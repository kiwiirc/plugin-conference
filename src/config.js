/* global kiwi:true */
/* global _:true */

let configBase = 'conference';
let defaultConfig = {
    tagID: 1,
    secure: false,
    server: 'meet.jit.si',
    queries: true,
    channels: true,
    buttonIcon: 'fa-phone',
    viewHeight: '40%',
    enabledInChannels: ['*'],
    groupInvitesTTL: 30000,
    maxParticipantsLength: 60,
    participantsMore: 'more...',
    inviteText: '{{ nick }} is inviting you to a private call.',
    joinText: '{{ nick }} has joined the conference.',
    joinButtonText: 'Join now!',
    showLink: false,
    useLinkShortener: false,
    linkShortenerURL: 'https://x0.no/api/?{{ link }}',
    linkShortenerAPIToken: '',
    interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'fullscreen', 'hangup',
            'settings', 'videoquality', 'filmstrip', 'fodeviceselection',
            'stats', 'shortcuts',
        ],
    },
    configOverwrite: {
        startWithVideoMuted: true,
        startWithAudioMuted: true,
    },
};

export function setDefaults() {
    kiwi.setConfigDefaults(configBase, defaultConfig);
}

export function setting(name) {
    return kiwi.state.setting([configBase, name].join('.'));
}

export function getSetting(name) {
    return kiwi.state.getSetting(['settings', configBase, name].join('.'));
}

export function setSetting(name, value) {
    return kiwi.state.setSetting(['settings', configBase, name].join('.'), value);
}

export function isAllowedBuffer(buffer) {
    if (buffer.isQuery()) {
        return true;
    }
    let enabledChannels = getSetting('enabledInChannels');
    if (enabledChannels.indexOf('*') > -1) {
        return true;
    }
    if (enabledChannels.indexOf(buffer.name.toLowerCase()) > -1) {
        return true;
    }
    return false;
}
