kiwi.plugin('conferencePlugin', function(kiwi, log) {
  let camsVisible = mediaViewerOpen = jitsiLoaded = api = buttonAdded = token = false;
  let jitsiDiv = resizejitsiDiv = network = buffer = messages = options = domain = false;

  let jitsiDomain = kiwi.state.setting('conference.server') || 'meet.jit.si'
  let interfaceConfigOverwriteFromConfig = kiwi.state.setting('conference.interfaceConfigOverwrite') || {}
  let interfaceConfigOverwrite = {
    "SHOW_JITSI_WATERMARK": false,
    "SHOW_WATERMARK_FOR_GUESTS": false,
    "TOOLBAR_BUTTONS": [
      "microphone", "camera", "fullscreen", "fodeviceselection", "hangup",
      "settings", "videoquality", "filmstrip",
      "stats", "shortcuts"
    ]
  }
  Object.keys(interfaceConfigOverwriteFromConfig).forEach(key => { interfaceConfigOverwrite[key] = interfaceConfigOverwriteFromConfig[key]; });
  
  let configOverwriteFromConfig = kiwi.state.setting('conference.configOverwrite') || {}
  let configOverwrite = {
    "startWithVideoMuted": true,
    "startWithAudioMuted": true
  }
  Object.keys(configOverwriteFromConfig).forEach(key => { configOverwrite[key] = configOverwriteFromConfig[key]; });
  
  
  if(!buttonAdded){
    buttonAdded = true;
    const conferencingTool = document.createElement('div');
    conferencingTool.style.marginLeft = '10px';
    conferencingTool.style.cursor = 'pointer';
    conferencingTool.innerHTML = '<i aria-hidden="true" class="fa fa-phone"></i>';
    kiwi.addUi('header_channel', conferencingTool);
    kiwi.addUi('header_query', conferencingTool);
    conferencingTool.onclick = function(e){
      e.preventDefault();
      if(camsVisible){
        hideCams();
      }else{
        showCams();
      }
    }
    kiwi.on('message.new', function (e) {
      if (e.message.indexOf('has joined the conference.') !== -1) {
        let nick = e.message.substring(2, e.message.indexOf('has joined the conference.'));
        console.log(nick.toLowerCase(), window.kiwi.state.getActiveNetwork().nick.toLowerCase());
        if(nick.toLowerCase() === 'ha') return;
        e.template = kiwi.Vue.extend({template:`<div style="width:100%; padding: 20px; background: #ccc; text-align: center; color: #000; font-size: 2em;">
                                  <i aria-hidden="true" class="fa fa-phone"></i>
                                  ${nick} has joined the conference call.
                                  <button @click="iframeizeCams()">Join now!</button>
                                </div>`,
                                methods:{
                                  iframeizeCams: iframeizeCams,
                                }
                              });
      }
    });
  }
  
  function iframeizeCams(){
    kiwi.emit('mediaviewer.show', { iframe: true, url: 'about:blank' });
    setTimeout(() => {
      let iframe = document.querySelector('.kiwi-mediaviewer iframe');
      let mediaviewer = document.querySelector('.kiwi-mediaviewer');
      let innerDoc = iframe.contentDocument || iframe.contentWindow.document;
      let innerWindow = iframe.contentWindow;
      jitsiDiv = innerDoc.getElementsByTagName('body')[0];
      let innerHead = innerDoc.getElementsByTagName('head')[0];
      jitsiDiv.style.margin = 0;
      iframe.style.width = '100%';
      mediaviewer.style.height = '45%';
      iframe.style.height = '100%';
      
      let d = Date.now();
      let loader = setInterval(function() {
        network = window.kiwi.state.getActiveNetwork();
        buffer = window.kiwi.state.getActiveBuffer();
        if(typeof buffer.name !== "undefined" || Date.now() - d > 5000){ // allow up to 5 seconds to get buffer data
          clearInterval(loader);
          let suffix;
          if(!network.isChannelName(buffer.name)){ // cam is being invoked in PM, not a channel
            let nicks = [];
            nicks.push(network.nick);
            nicks.push(buffer.name);
            nicks.sort();
            nicks[0] = 'query-' + nicks[0] + '#';
            suffix = nicks.join('');
          }else{
            suffix = buffer.name;
          }
          buffer.say('has joined the conference.', {type: 'action'});
          let roomName = (network.connection.server + '/' + suffix).split('').map(c => c.charCodeAt(0).toString(16)).join('');
          kiwi.once('irc.raw.EXTJWT', function(command, message) {
            token = message.params[1]
            domain = jitsiDomain;
            options = {
                roomName,
                displayName: buffer.name,
                parentNode: jitsiDiv,
                interfaceConfigOverwrite,
                configOverwrite
            }
            let jitsiAPIScript = innerDoc.createElement("script");
            jitsiAPIScript.setAttribute("type", "text/javascript");
            jitsiAPIScript.setAttribute("src", "https://meet.jit.si/external_api.js");
            jitsiAPIScript.addEventListener("load", function(event){
              if(event.target.nodeName === "SCRIPT"){
                jitsiLoaded = true;
                jitsiDiv.innerHTML="";
                options.jwt = token;
                options.noSsl = false;
                api = new innerWindow.JitsiMeetExternalAPI(domain, options);
                api.executeCommand('displayName', network.nick);
                api.on('videoConferenceLeft', () => {
                  hideCams();
                });
              }
            });
            if(!jitsiLoaded){
              jitsiLoaded = true;
              innerHead.appendChild(jitsiAPIScript);
            }
          });
          network.ircClient.raw('EXTJWT ' + suffix)
        }
      }, 10);
    }, 100);
  }
  
  function showCams(){
    if(!camsVisible){
      camsVisible = true;
      iframeizeCams();
    }
  }

  function hideCams(){
    
    if(jitsiLoaded){
      jitsiDiv.style.display = "none";
      jitsiLoaded = false;
      api.dispose();
    }
    kiwi.emit('mediaviewer.hide');
  }
  
  kiwi.on('mediaviewer.opened', function(){
    mediaViewerOpen = true;
    //showCams();
  });
  
  kiwi.on('mediaviewer.hide', function(){
    mediaViewerOpen = false;
    camsVisible = false;
    jitsiLoaded = false;
  });
});
