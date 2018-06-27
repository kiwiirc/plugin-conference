kiwi.plugin('conferencePlugin', function(kiwi, log) {
  let camsVisible = mediaViewerOpen = jitsiLoaded = api = buttonAdded = false;
  let jitsiDiv = resizejitsiDiv = network = buffer = options = domain = false;

  let jitsiDomain = kiwi.state.setting('conference.server') || 'meet.jit.si'
  let jitsiOptionsFromConfig = kiwi.state.setting('conference.jitsioptions')
  let jitsiOptions = {
    "SHOW_JITSI_WATERMARK": false,
    "SHOW_WATERMARK_FOR_GUESTS": false,
    "TOOLBAR_BUTTONS": [
      "microphone", "camera", "fullscreen", "fodeviceselection", "hangup",
      "settings", "videoquality", "filmstrip",
      "stats", "shortcuts"
    ]
  }
  Object.keys(jitsiOptionsFromConfig).forEach(key => { jitsiOptions[key] = jitsiOptionsFromConfig[key]; });
  
  
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
      
      network = window.kiwi.state.getActiveNetwork();
      buffer = window.kiwi.state.getActiveBuffer(); 
      let d = Date.now();
      while(typeof buffer.name === "undefined" && Date.now() - d < 5000){ // allow up to 5 seconds to get buffer data
        buffer = window.kiwi.state.getActiveBuffer();
      }
      let suffix;
      if(!network.isChannelName(buffer.name)){ // cam is being invoked in PM, not a channel
        let nicks = [];
        nicks.push(network.nick);
        nicks.push(buffer.name);
        nicks.sort();
        let s = nicks.join('').replace(/-/g,"");
        suffix = encodeURIComponent(s.substring(0,s.indexOf("#")==-1?100:s.indexOf("#")-1));
      }else{
        suffix = buffer.name.replace(/#/g, "");
      }
      let roomName = network.name + suffix;
      domain = jitsiDomain;
      options = {
          roomName,
          parentNode: jitsiDiv,
          interfaceConfigOverwrite: jitsiOptions
      }
      let jitsiAPIScript = document.createElement("script");
      jitsiAPIScript.setAttribute("type", "text/javascript");
      jitsiAPIScript.setAttribute("src", "https://meet.jit.si/external_api.js");
      jitsiAPIScript.addEventListener("load", function(event){
        if(event.target.nodeName === "SCRIPT"){
          jitsiLoaded = true;
          jitsiDiv.innerHTML="";
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
    },100);
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
