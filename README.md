# KiwiIRC - Jitsi Meet Plugin

This plugin integrates the Jitsi Meet software into KiwiIRC. 

Features -

Icon & Jitsi Meet scripts load automatically @ 1st IRC JOIN event

Jitsi Meet "rooms" are created dynamically, based on the state of KiwiIRC. For example, a click
of the icon from within a channel will connect the user to that channel's conference room. Whereas
clicking the icon from within a private message will connect the user to a private conference.

This plugin makes use of KiwiIRC's built-in Media-Viewer feature, and strives to seamlessly
integrate with existing functionality. When the Media-Viewer is hidden, or when other media is
requested, the user's camera & mic are disengaged so as to prevent unintended broadcasting.

This plugin does not require any modifications to the KiwiIRC codebase.
All actions are dynamic and self-sufficient.

By default, the user's camera and mic are muted at connection to a conference.

![alt text](https://github.com/kiwiirc/plugin-conference/raw/master/image1.png)


By default, this plugin uses Jisti's public servers. It should be noted that by using the
public servers, your conferences are not necessarily secure. There is an option to use auth
tokens to secure your conferences, but this requires setting up your own jisti server.
To use your own servers, simply install Jitsi Meet (https://jitsi.org/downloads/), and edit
KiwiIRC's config.json file to use your own domain. Like so:

Note: the settings below are optional. If any item is omitted, the settings default to this:

    "conference":{ 
      "server": "meet.jit.si",
      "interfaceConfigOverwrite": {
        "SHOW_JITSI_WATERMARK": false,
        "SHOW_WATERMARK_FOR_GUESTS": false,
        "TOOLBAR_BUTTONS": [
          "microphone", "camera", "fullscreen", "fodeviceselection", "hangup",
          "settings", "videoquality", "filmstrip",
          "stats", "shortcuts"
        ]
      },
      "configOverwrite": {
      }
    },
    
Note: This is required for the plugin to function:

    "plugins": [
      {"name": "conferencePlugin", "url": "./static/plugins/plugin-conference/dist/main.js"}
    ]
  
  
more info about Jitsi's options can be found in the docs
(https://github.com/jitsi/jitsi-meet/blob/master/doc/quick-install.md)

Questions? scott@londontrustmedia.com
