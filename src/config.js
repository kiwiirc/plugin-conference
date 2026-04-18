/* global kiwi:true */

export const configBase = 'plugin-conference';
const defaultConfig = {
    tagID: 1,
    secure: false,
    server: '',
    queries: true,
    channels: true,
    buttonIcon: 'fa-phone',
    viewHeight: '40%',
    enabledInChannels: ['*'],
    groupInvitesTTL: 30000,
    maxParticipantsLength: 60,
    showLink: false,
    useLinkShortener: false,
    linkShortenerURL: 'https://x0.no/api/?{{ link }}',
    linkShortenerAPIToken: '',
    interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        TOOLBAR_BUTTONS: [
            'camera',
            // 'chat',
            'closedcaptions',
            'desktop',
            // 'download',
            // 'embedmeeting',
            'etherpad',
            // 'feedback',
            'filmstrip',
            'fullscreen',
            'hangup',
            'help',
            'highlight',
            // 'invite',
            // 'linktosalesforce',
            'livestreaming',
            'microphone',
            'noisesuppression',
            // 'participants-pane',
            // 'profile',
            'raisehand',
            // 'recording',
            // 'security',
            'select-background',
            'settings',
            // 'shareaudio',
            // 'sharedvideo',
            'shortcuts',
            'stats',
            'tileview',
            'toggle-camera',
            // 'videoquality',
            // 'whiteboard',
        ],
    },
    configOverwrite: {
        startWithVideoMuted: true,
        startWithAudioMuted: true,
        disableTileView: true,
        disableTileEnlargement: true,
    },
};

export function setDefaults() {
    const oldConfig = kiwi.state.getSetting('settings.conference');
    if (oldConfig) {
        // eslint-disable-next-line no-console, vue/max-len
        console.warn('[DEPRECATION] Please update your conference plugin config to use "plugin-conference" as its object key');
        kiwi.setConfigDefaults(configBase, oldConfig);
    }
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
    const enabledChannels = getSetting('enabledInChannels');
    if (enabledChannels.indexOf('*') > -1) {
        return true;
    }
    if (enabledChannels.indexOf(buffer.name.toLowerCase()) > -1) {
        return true;
    }
    return false;
}
