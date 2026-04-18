<template>
    <div ref="el" class="p-conference-jitsi">
        <div v-if="isJoined" class="p-conference-overlay">
            {{ roomName }} @ {{ network.name }}
        </div>
        <div v-if="isLoading" class="p-conference-loading">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                <g>
                    <circle cx="12" cy="2.5" r="1.5" opacity="0.14" />
                    <circle cx="16.75" cy="3.77" r="1.5" opacity="0.29" />
                    <circle cx="20.23" cy="7.25" r="1.5" opacity="0.43" />
                    <circle cx="21.5" cy="12" r="1.5" opacity="0.57" />
                    <circle cx="20.23" cy="16.75" r="1.5" opacity="0.71" />
                    <circle cx="16.75" cy="20.23" r="1.5" opacity="0.86" />
                    <circle cx="12" cy="21.5" r="1.5" />
                    <animateTransform
                        attributeName="transform"
                        calcMode="discrete"
                        dur="0.75s"
                        repeatCount="indefinite"
                        type="rotate"
                        values="0 12 12;30 12 12;60 12 12;90 12 12;120 12 12;150 12 12;180
                            12 12;210 12 12;240 12 12;270 12 12;300 12 12;330 12 12;360 12 12"
                    />
                </g>
            </svg>
        </div>
        <div v-else-if="notSupported" class="p-conference-notsupported" v-html="notSupportedText" />
    </div>
</template>

<script setup>
/* global kiwi:true */
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';

import * as config from '@/config.js';
import * as utils from '@/lib/utils.js';
import { t } from '@/translations.js';

const emit = defineEmits(['setHeight']);
const props = defineProps({
    componentProps: { type: Object, required: true },
});

const el = ref(null);

const api = ref(null);
const link = ref('');
const token = ref('');
const encodedRoomName = ref('');
const isJoined = ref(false);
const isLoading = ref(false);
const notSupported = ref(false);

const buffer = computed(() => props.componentProps.buffer);
const network = computed(() => buffer.value.getNetwork());
const notSupportedText = computed(() => t('notSupported').replace('\n', '<br>'));
const roomName = computed(() => {
    if (buffer.value.isQuery()) {
        return [network.value.nick, buffer.value.name].sort().join('+');
    }
    return buffer.value.name;
});

let unmounted = false;
let scr = null;
let abortController = null;

let ircPartHandler;
let ircQuitHandler;
let ircKickHandler;

// Stored at component scope so they can be cancelled in onBeforeUnmount
let extJwtHandler = null;
let extJwtTimeout = null;

function setupIrcListeners() {
    const channelMatches = (event) => event.channel.toLowerCase() === buffer.value.name.toLowerCase();
    const isOwnNick = (nick) => nick.toLowerCase() === network.value.nick.toLowerCase();
    const networkMatches = (net) => net === network.value;

    ircPartHandler = (event, net) => {
        if (!networkMatches(net) || buffer.value.isQuery()) {
            return;
        }
        if (channelMatches(event) && isOwnNick(event.nick)) {
            kiwi.emit('mediaviewer.hide');
        }
    };

    ircQuitHandler = (event, net) => {
        if (!networkMatches(net)) {
            return;
        }
        if (isOwnNick(event.nick)) {
            kiwi.emit('mediaviewer.hide');
        }
    };

    ircKickHandler = (event, net) => {
        if (!networkMatches(net) || buffer.value.isQuery()) {
            return;
        }
        if (channelMatches(event) && isOwnNick(event.kicked)) {
            kiwi.emit('mediaviewer.hide');
        }
    };

    kiwi.on('irc.part', ircPartHandler);
    kiwi.on('irc.quit', ircQuitHandler);
    kiwi.on('irc.kick', ircKickHandler);
}

function removeIrcListeners() {
    kiwi.off('irc.part', ircPartHandler);
    kiwi.off('irc.quit', ircQuitHandler);
    kiwi.off('irc.kick', ircKickHandler);
}

function cancelFetchToken() {
    if (extJwtTimeout) {
        clearTimeout(extJwtTimeout);
        extJwtTimeout = null;
    }
    if (extJwtHandler) {
        kiwi.off('irc.raw.EXTJWT', extJwtHandler);
        extJwtHandler = null;
    }
}

function fetchToken() {
    return new Promise((resolve, reject) => {
        let t = '';

        extJwtHandler = (command, message) => {
            if (message.params[2] === '*') {
                t = message.params[3];
            } else {
                t += message.params[2];
                cancelFetchToken();
                resolve(t);
            }
        };

        extJwtTimeout = setTimeout(() => {
            cancelFetchToken();
            reject(new Error('EXTJWT timeout'));
        }, 10000);

        kiwi.on('irc.raw.EXTJWT', extJwtHandler);
        network.value.ircClient.raw('EXTJWT', buffer.value.isQuery() ? '*' : roomName.value);
    });
}

function addLocalMessage(text) {
    kiwi.state.addMessage(buffer.value, {
        time: Date.now(),
        nick: '',
        message: text,
        type: 'error',
    });
}

function sendJoinMessage() {
    const nick = network.value.nick;
    let msgText = '* ' + (buffer.value.isQuery() ? t('inviteText', { nick }) : t('joinText', { nick }));

    if (config.setting('showLink') && link.value) {
        msgText += ' ' + link.value;
    }

    const message = new network.value.ircClient.Message('PRIVMSG', buffer.value.name, msgText);
    message.prefix = network.value.nick;
    message.tags['+kiwiirc.com/conference'] = config.getSetting('tagID');
    network.value.ircClient.raw(message);
}

function onLinkResolved(resolvedLink) {
    link.value = resolvedLink;
    if (isJoined.value) {
        sendJoinMessage();
    }
}

function getShortLink(shortURL, l) {
    fetch(shortURL.replace('{{ link }}', l), { signal: abortController.signal })
        .then((r) => r.text())
        .then((result) => {
            const urlRegex = kiwi.require('helpers/TextFormatting').urlRegex;
            const isUrl = new RegExp('^' + urlRegex.source + '$');
            onLinkResolved(isUrl.test(result) ? result : l);
        })
        .catch((err) => {
            if (err.name === 'AbortError') return;
            onLinkResolved(l);
        });
}

function getBitlyLink(bitlyURL, l) {
    const apiKey = config.setting('linkShortenerAPIToken');
    const requestURL = bitlyURL + '?access_token=' + apiKey + '&longUrl=' + l;
    fetch(requestURL, { signal: abortController.signal })
        .then((r) => r.json())
        .then((result) => onLinkResolved(result.url))
        .catch((err) => {
            if (err.name === 'AbortError') return;
            onLinkResolved(l);
        });
}

function getLink() {
    const l = 'https://' + config.setting('server') + '/' + encodedRoomName.value;
    if (!config.setting('useLinkShortener')) {
        link.value = l;
        return;
    }

    const shortURL = config.setting('linkShortenerURL');
    if (shortURL.indexOf('api-ssl.bitly.com') > -1) {
        getBitlyLink(shortURL, l);
    } else {
        getShortLink(shortURL, l);
    }
}

function scriptLoaded() {
    const configOverwrite = {};
    Object.assign(configOverwrite, config.setting('configOverwrite'), {
        hideConferenceSubject: true,
        prejoinPageEnabled: false,
        prejoinConfig: {
            enabled: false,
        },
        gravatar: {
            disabled: true,
        },
        p2p: {
            enabled: false,
        },
    });

    if (config.setting('showLink') && !link.value) {
        getLink();
    }

    const user = network.value.currentUser();
    const domain = config.setting('server');
    const options = {
        roomName: encodedRoomName.value,
        userInfo: {
            displayName: network.value.nick,
            ...buffer.value.isQuery() && { email: buffer.value.name },
            ...user.avatar && (user.avatar.large || user.avatar.small) && {
                avatarURL: user.avatar.large || user.avatar.small,
            },
        },
        parentNode: el.value,
        configOverwrite,
        interfaceConfigOverwrite: config.setting('interfaceConfigOverwrite'),
        onload: () => {
            api.value.addEventListener('videoConferenceJoined', () => {
                isJoined.value = true;
                isLoading.value = false;

                if (!config.setting('showLink') || link.value) {
                    sendJoinMessage();
                }
            });

            api.value.addEventListener('videoConferenceLeft', () => {
                kiwi.emit('mediaviewer.hide');
            });

            api.value.once('browserSupport', (event) => {
                if (!event.supported) {
                    isLoading.value = false;
                    notSupported.value = true;
                }
            });

            api.value.addEventListener('errorOccurred', async (event) => {
                if (event?.error?.message === 'Token expired') {
                    api.value.dispose();
                    api.value = null;
                    try {
                        token.value = await fetchToken();
                        scriptLoaded();
                    } catch (e) {
                        addLocalMessage(t('conferenceFailedReauth'));
                        kiwi.emit('mediaviewer.hide');
                    }
                    return;
                }

                const errMsg = event?.error?.message || 'unknown error occurred';
                addLocalMessage(t('conferenceError', { error: errMsg }));
                kiwi.emit('mediaviewer.hide');
            });
        },
    };

    if (config.setting('secure')) {
        options.jwt = token.value;
    }

    api.value = new window.JitsiMeetExternalAPI(domain, options);
}

function scriptLoad() {
    const roomNamePromise = utils.encodeRoomName(network.value.connection.server + '/' + roomName.value);
    scr = document.createElement('script');
    scr.src = 'https://' + config.setting('server') + '/external_api.js';
    scr.onload = async () => {
        if (unmounted) return;
        const name = await roomNamePromise;
        if (unmounted) return;
        encodedRoomName.value = buffer.value.isQuery() ? 'q-' + name : name;
        scriptLoaded();
    };
    scr.defer = true;
    el.value.appendChild(scr);
}

onMounted(async () => {
    setupIrcListeners();
    abortController = new AbortController();
    isLoading.value = true;

    if (config.setting('secure')) {
        try {
            token.value = await fetchToken();
        } catch (e) {
            addLocalMessage(t('conferenceFailedToken'));
            isLoading.value = false;
            return;
        }
    }

    scriptLoad();

    nextTick(() => emit('setHeight', config.setting('viewHeight')));
});

onBeforeUnmount(() => {
    unmounted = true;
    props.componentProps.pluginState.isActive = false;
    removeIrcListeners();
    cancelFetchToken();

    if (scr) {
        scr.onload = null;
    }

    if (abortController) {
        abortController.abort();
    }

    emit('setHeight', null);

    if (api.value) {
        api.value.dispose();
    }
});
</script>

<style lang="scss">
.p-conference-jitsi {
    height: 100%;

    /* fixes firefox showing scrollbar */
    overflow: hidden;
}

.p-conference-overlay {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
    padding: 6px 6px 2px 6px;
    color: #fff;
    background-color: rgb(0, 0, 0, 0.2);
}

.p-conference-loading {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background-color: rgb(0, 0, 0, 0.6);

    > svg {
        width: min(max(20vb, 80px), 200px);
        height: min(max(20vb, 80px), 200px);
        fill: #fff;
    }

    > i {
        font-size: 100px;
    }
}

.p-conference-notsupported {
    display: inline-block;
    padding: 25px;
    margin: 25px auto;
    font-size: 130%;
    font-weight: 600;
    color: var(--brand-default-fg);
    background-color: var(--brand-error);
    border-radius: 5px;
}
</style>
