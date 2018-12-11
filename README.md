# KiwiIRC - Audio / Video conferencing

This plugin integrates the [Jitsi Meet](https://jitsi.org/jitsi-meet/) conference software into KiwiIRC. 

Features -
* Individual conference rooms for channels and private messages
* Video, audio, or both, directly within Kiwi IRC itself
* Continue using Kiwi IRC and other channels without dropping the conference call
* Channel operators automatically promoted to conference room moderators

### Building
~~~shell
yarn && yarn build
~~~

Copy `dist/plugin-conference.min.js` to your Kiwi plugins folder

### Loading the plugin into Kiwi IRC
Add the plugin javascript file to your kiwiirc `config.json` and configure the settings:

```json
{
    "plugins": [
        {
            "name": "conference",
            "url": "static/plugins/plugin-conference/dist/plugin-conference.min.js"
        }
    ],
    "conference": {
        "server": "meet.jit.si",
        "secure": false
    }
}
```

### Security note!
By default, this plugin uses Jisti's public servers. It should be noted that by using these public servers, your conference calls are not secure in that anybody can join them if they can guess the room name.

Note that the "secure" option enables JWT authentication, but will not work on Jitsi's public server.

### Extra configuration
Jitsi Meet supports extra configuration to customise its interface and functions. You can configure these via the optional `interfaceConfigOverwrite` and `configOverwrite` config options.

The defaults are:
~~~json
"conference":{ 
    "server": "meet.jit.si",
    "secure": false,
    "enabledInChannels": [ "*" ],
    "joinText": "has joined the conference",
    "inviteText": "is inviting you to a private call.",
    "joinButtonText": "Join now!",
    "disabledText": "Sorry. The sysop has not enabled conferences in this channel.",
    "showLink": true,
    "useBitlyLink": false,
    "bitlyAccessToken": "BITLY_API_KEY_HERE",
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
}
~~~

The 'showLink' item, if enabled, will append a direct link to the broadcasted join message which opens the jitsi conference for non-Kiwi users.
The 'useBitlyLink' item, if enabled (requires showLink to also be enabled), will shorten the link displayed using Bitly's free service. You must sign up for a free Bitly account to use the API (https://bitly.com/). Once registered, follow the instructions to generate an access token, then provide that in Kiwi's config @ "bitlyAccessToken".

More info about Jitsi's options can be found in these files:
* https://github.com/jitsi/jitsi-meet/blob/master/interface_config.js
* https://github.com/jitsi/jitsi-meet/blob/master/config.js

You may also choose to hide the conference call icon in either channels or private messages:
```json
{
    "channels": false,
    "queries": false
}
```
### Running your own conference server
Running your own conference server allows you to secure your conference rooms. We make use of the Jitsi Meet server to handle the conference calls, the installation steps can be found here: https://github.com/jitsi/jitsi-meet/blob/master/doc/quick-install.md

## License

[ Licensed under the Apache License, Version 2.0](LICENSE).
