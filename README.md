KiwiIRC - Jitsi Meet Plugin
This is to announce the completion of the first draft of a new conferencing plugin for KiwiIRC.
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

![alt text](https://github.com/kiwiirc/plugin-conference/raw/master/image1.png)
