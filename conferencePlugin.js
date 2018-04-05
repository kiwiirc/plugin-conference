kiwi.plugin('conferencePlugin', function(kiwi, log) {

  let jitsiDomain = kiwi.state.setting('conference.server')
  let camsVisible = camClick = mediaViewerOpen = jitsiLoaded = api = buttonAdded = false;
  let jitsiDiv = resizejitsiDiv = network = buffer = options = domain = false;
  
  kiwi.on('irc.raw', function(command, event){
    if(command === "JOIN" && !buttonAdded){
      buttonAdded = true;
      const conferencingTool = document.createElement('i');
      conferencingTool.className = 'fa fa-video-camera';
      kiwi.addUi('input', conferencingTool);
      conferencingTool.onclick = function(e){
        e.preventDefault();
        camClick = true;
        if(camsVisible){
          kiwi.emit('mediaviewer.hide');
        }else{
          if(mediaViewerOpen){
            showCams();
          }else{
            kiwi.emit('mediaviewer.show', '');
          }
        }
      }
    }
  });
  
  window.addEventListener("click", function(e){
    if(e.srcElement.className.indexOf("kiwi-messagelist-message-linkhandle") !== -1 ||
       e.srcElement.className.indexOf("u-button-secondary") !== -1){
      kiwi.emit('mediaviewer.hide')
    }
  });
  
  function showCams(){
    mediaViewerOpen = true;
    if(!camClick) return;
    if(!camsVisible){
      if(jitsiLoaded){
        jitsiDiv.style.display = "block";
        resizeJitsiDiv();
      }else{
        jitsiDiv = document.createElement("div");
        resizeJitsiDiv = function(){
          let mediaViewerDiv = document.getElementsByClassName("kiwi-mediaviewer")[0];
          jitsiDiv.style.height = mediaViewerDiv.clientHeight + "px";
          jitsiDiv.style.width = mediaViewerDiv.clientWidth + "px";
          jitsiDiv.style.position = "absolute";
          let rect = mediaViewerDiv.getBoundingClientRect();
          jitsiDiv.style.top = rect.top + "px";
          jitsiDiv.style.left = rect.left + "px";
        }
        resizeJitsiDiv();
        window.addEventListener("resize", function(){
          if(camsVisible)resizeJitsiDiv();
        });
        jitsiDiv.style.background = "#000";
        jitsiDiv.innerHTML = "Loading Camera...";
        document.body.appendChild(jitsiDiv);
        network = window.kiwi.state.getActiveNetwork();
        buffer = window.kiwi.state.getActiveBuffer();
        let d = Date.now();
        while(typeof buffer.name === "undefined" && Date.now() - d < 5000){ // allow up to 5 seconds to get buffer data
          buffer = window.kiwi.state.getActiveBuffer();
        }
        let suffix;
        if(buffer.name.indexOf("#") !== 0){ // cam is being invoked in PM, not a channel
          let nicks = [];
          nicks.push(network.nick);
          nicks.push(buffer.name);
          nicks.sort();
          let s = nicks.join('').replace(/-/g,"");
          suffix = encodeURIComponent(s.substring(0,s.indexOf("#")==-1?100:s.indexOf("#")-1));
        }else{
          suffix = buffer.name.replace("#", "");
        }
        let roomName = network.name + suffix;
        domain = jitsiDomain;
        options = {
            height:"100%",
            roomName,
            parentNode: jitsiDiv,
            interfaceConfigOverwrite: {TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'fullscreen', 'fodeviceselection', 'hangup',
            'profile', 'contacts', 'info', 'recording', 'etherpad',
            'settings', 'videoquality', 'filmstrip',
            'invite', 'feedback', 'stats', 'shortcuts'
            ]}
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
          }
        });
        document.head.appendChild(jitsiAPIScript);
      }
    }
    camsVisible = true;
  }

  function hideCams(){
    if(jitsiLoaded){
      jitsiDiv.style.display = "none";
      jitsiLoaded = false;
      api.dispose();
    }
    camsVisible = false;
    camClick = false;
  }
  
  kiwi.on('mediaviewer.opened', function(){
    showCams();
  });
  
  kiwi.on('mediaviewer.hide', function(){
    hideCams();
    mediaViewerOpen = false;
  });
});