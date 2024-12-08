/* global kiwi:true */

export const basePath = getBasePath();
export const configBase = 'plugin-conference';
export const defaultConfig = {
    tagID: 1,
    secure: false,
    server: 'meet.jit.si',
    queries: true,
    channels: true,
    closeOnLeave: true,
    buttonIcon: 'fa-phone',
    viewHeight: '40%',
    enabledInChannels: [],
    disabledInChannels: [],
    groupInvitesTTL: 30000,
    maxParticipantsLength: 60,
    inviteText: '{{ nick }} is inviting you to a private call.',
    joinText: '{{ nick }} has joined the conference.',
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
    },
};

export function setDefaults() {
    const oldConfig = kiwi.state.getSetting('settings.conference');
    if (oldConfig) {
        // eslint-disable-next-line no-console, vue/max-len
        console.warn('[DEPRECATION] Please update your conference config to use "plugin-conference" as its object key');
        kiwi.setConfigDefaults(configBase, oldConfig);
    }
    kiwi.setConfigDefaults(configBase, defaultConfig);

    // Check enabledInChannels
    const enabledInChannels = kiwi.state.getSetting('settings.plugin-conference.enabledInChannels');
    if (enabledInChannels.includes('*')) {
        // eslint-disable-next-line no-console, vue/max-len
        console.warn('[CONFIG] Warning "*" is no longer used in "enabledInChannels" please remove it.');
    }
}

export function setting(name, newVal) {
    return kiwi.state.setting([configBase, name].join('.'), newVal);
}

export function getSetting(name) {
    return kiwi.state.getSetting(['settings', configBase, name].join('.'));
}

export function setSetting(name, value) {
    return kiwi.state.setSetting(['settings', configBase, name].join('.'), value);
}

function getBasePath() {
    const scripts = document.getElementsByTagName('script');
    const scriptPath = scripts[scripts.length - 1].src;
    return scriptPath.substr(0, scriptPath.lastIndexOf('/') + 1);
}

export function isAllowedBuffer(buffer) {
    if (buffer.isQuery()) {
        return true;
    }

    let allowed = false;

    const enabledChannels = getSetting('enabledInChannels');
    if (!enabledChannels.length) {
        allowed = true;
    } else if (enabledChannels.includes(buffer.name.toLowerCase())) {
        allowed = true;
    }

    const disabledChannels = getSetting('disabledInChannels');
    if (disabledChannels.length && disabledChannels.includes(buffer.name.toLowerCase())) {
        allowed = false;
    }

    return allowed;
}
