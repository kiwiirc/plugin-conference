# KiwiIRC - Audio / Video conferencing

### Status - in development

This plugin integrates the [Jitsi Meet](https://jitsi.org/jitsi-meet/) conference software into KiwiIRC. 

Features -
* Individual conference rooms for channels and private messages
* Video, audio, or both, directly within Kiwi IRC itself
* Continue using Kiwi IRC and other channels without dropping the conference call
* Channel operators automatically promoted to conference room moderators

### Loading the plugin into Kiwi IRC
Add the plugin javascript file to your kiwiirc `config.json` and configure the settings:

```json
{
	"plugins": [
		{
			"name": "conference",
			"url": "static/plugins/conference/main.js"
		}
	],
	"conference": {
		"server": "meet.jit.si"
	}
}
```

### Security note!
By default, this plugin uses Jisti's public servers. It should be noted that by using these public servers, your conference calls are not secure in that anybody can join them if they can guess the room name.

There is work being done to provide secure conference rooms between IRC channels and private messages.

### Extra configuration
Jitsi Meet supports extra configuration to customise its interface and functions. You can configure these via the optional `interfaceConfigOverwrite` and `configOverwrite` config options.

The defaults are:
~~~json
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
}
~~~
  
more info about Jitsi's options can be found in the docs
(https://github.com/jitsi/jitsi-meet/blob/master/doc/quick-install.md)

## License

[ Licensed under the Apache License, Version 2.0](LICENSE).
