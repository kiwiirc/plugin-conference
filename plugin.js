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
  let configOverwrite = {}
  Object.keys(configOverwriteFromConfig).forEach(key => { configOverwrite[key] = configOverwriteFromConfig[key]; });
  
  
  if(!buttonAdded){
    buttonAdded = true;
    const conferencingTool = document.createElement('i');
    conferencingTool.className = 'fa fa-video-camera';
    kiwi.addUi('input', conferencingTool);
    conferencingTool.onclick = function(e){ 
      e.preventDefault();
      if(camsVisible){
        hideCams();
      }else{
        showCams();
      }
    }
  }
  
  function iframeizeCams(){
    kiwi.emit('mediaviewer.show', { iframe: true, url: 'about:blank' });
    setTimeout(() => {
      let iframe = document.querySelector('.kiwi-mediaviewer iframe');
      let mediaviewer = document.querySelector('.kiwi-mediaviewer');
      let innerDoc = iframe.contentDocument || iframe.contentWindow.document;
      jitsiDiv = innerDoc.getElementsByTagName('body')[0];
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
          let roomName = (kiwi.state.setting('startupOptions.server') + '/' + suffix).split('').map(c => c.charCodeAt(0).toString(16)).join('');
          network.ircClient.raw('EXTJWT ' + suffix)
          token = null
          let interval = setInterval(function () {
            messages = network.buffers[0].getMessages();
            for(let i = 0; i < messages.length; ++i){
              if (messages[i].message.substring(0,6) === 'EXTJWT') {
                clearInterval(interval);
                token = messages[i].message.substring(messages[i].message.indexOf(',') + 2)
                domain = jitsiDomain;
                options = {
                    roomName,
                    parentNode: jitsiDiv,
                    interfaceConfigOverwrite,
                    configOverwrite
                }
                let jitsiAPIScript = document.createElement("script");
                jitsiAPIScript.setAttribute("type", "text/javascript");
                jitsiAPIScript.setAttribute("src", "https://meet.jit.si/external_api.js");
                jitsiAPIScript.addEventListener("load", function(event){
                  if(event.target.nodeName === "SCRIPT"){
                    jitsiLoaded = true;
                    jitsiDiv.innerHTML="";
                    options.jwt = token;
                    options.noSsl = false;
                    api = new JitsiMeetExternalAPI(domain, options);
                    api.executeCommand('displayName', network.nick);
                    api.executeCommand('toggleAudio');
                    api.executeCommand('toggleVideo');
                  }
                });
                if(!jitsiLoaded){
                  jitsiLoaded = true;
                  document.head.appendChild(jitsiAPIScript);
                }
              }
            }
          }, 2000);
        }
      }, 10);
    }, 100);
  }
  
  window.addEventListener("click", function(e){
    if(e.srcElement.className.indexOf("u-button-secondary") !== -1){
      hideCams();
    }
  });
  
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
