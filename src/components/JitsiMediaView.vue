<template>
    <div class="p-conference-jitsi">
        <div v-if="isJoined" class="p-conference-overlay">{{ roomName }} @ {{ network.name }}</div>
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
        <div v-else-if="notSupported" class="p-conference-notsupported">
            {{ $t('plugin-conference:notSupported') }}
        </div>
    </div>
</template>

<script>
/* global kiwi:true */

import * as config from '@/config.js';
import * as utils from '@/lib/utils.js';

export default {
    props: ['componentProps'],
    data() {
        return {
            api: null,
            link: '',
            token: '',
            encodedRoomName: '',
            isJoined: false,
            isLoading: false,
            loadingAnimation: null,
            notSupported: false,
        };
    },
    computed: {
        roomName() {
            if (this.buffer.isQuery()) {
                const members = [this.network.nick, this.buffer.name];
                members.sort();
                return members.join('+');
            }
            return this.buffer.name;
        },
        buffer() {
            return this.componentProps.buffer;
        },
        network() {
            return this.buffer.getNetwork();
        },
    },
    watch: {
        'buffer.joined'(newVal) {
            if (!newVal && config.setting('closeOnLeave')) {
                // Close the conference if the user is no longer in the channel
                kiwi.emit('mediaviewer.hide');
            }
        },
    },
    mounted() {
        this.isLoading = true;

        if (config.setting('secure')) {
            kiwi.on('irc.raw.EXTJWT', this.handleExtjwt);
            const jwtTarget = this.buffer.isQuery() ? '*' : this.roomName;
            this.network.ircClient.raw('EXTJWT', jwtTarget);
        } else {
            this.scriptLoad();
        }

        // MediaViewer also sets a height on mounted()
        // and is called after this mounted()
        this.$nextTick(() => {
            this.$parent.setHeight(config.setting('viewHeight'));
        });
    },
    beforeDestroy() {
        this.componentProps.pluginState.isActive = false;
        const mediaviewer = this.$el.parentElement;
        if (mediaviewer) {
            mediaviewer.style.height = '';
        }

        if (this.api) {
            this.api.dispose();
        }
    },
    methods: {
        handleExtjwt(command, message) {
            if (message.params[2] === '*') {
                this.token = message.params[3];
            } else {
                this.token += message.params[2];
                this.scriptLoad();
                kiwi.off('irc.raw.EXTJWT', this.handleExtjwt);
            }
        },
        scriptLoad() {
            const roomNamePromise = utils.encodeRoomName(this.network.connection.server + '/' + this.roomName);
            const scr = document.createElement('script');
            scr.src = 'https://' + config.setting('server') + '/external_api.js';
            scr.onload = async () => {
                const roomName = await roomNamePromise;
                this.encodedRoomName = (this.buffer.isQuery()) ? 'q-' + roomName : roomName;
                this.scriptLoaded();
            };
            scr.defer = true;
            this.$el.appendChild(scr);
        },
        scriptLoaded() {
            const configOverwrite = config.setting('configOverwrite');

            // Disable prejoin page as we are setting the users nick
            Object.assign(configOverwrite, {
                prejoinPageEnabled: false,
                prejoinConfig: {
                    enabled: false,
                },
                hideConferenceSubject: true,
            });

            if (config.setting('showLink') && !this.link) {
                this.getLink();
            }

            const user = this.network.currentUser();
            const domain = config.setting('server');
            const options = {
                roomName: this.encodedRoomName,
                userInfo: {
                    displayName: this.network.nick,
                },
                parentNode: this.$el,
                configOverwrite: configOverwrite,
                interfaceConfigOverwrite: config.setting('interfaceConfigOverwrite'),
                onload: () => {
                    this.api.executeCommand('toggleTileView');
                    this.api.once('videoConferenceJoined', (event) => {
                        this.isLoading = false;
                        this.isJoined = true;

                        if (user.avatar && (user.avatar.large || user.avatar.small)) {
                            this.api.executeCommand('avatarUrl', user.avatar.large || user.avatar.small);
                        }

                        if (!config.setting('showLink') || this.link) {
                            // if showLink is disabled or the link is ready send our join message,
                            // if the link is not ready the message will be send when it is
                            this.sendJoinMessage();
                        }
                    });
                    this.api.once('videoConferenceLeft', () => {
                        kiwi.emit('mediaviewer.hide');
                    });
                    this.api.once('browserSupport', (event) => {
                        if (!event.supported) {
                            this.isLoading = false;
                            this.isJoined = false;
                            this.notSupported = true;
                        }
                    });
                },
            };

            if (config.setting('secure')) {
                options.jwt = this.token;
            }

            this.api = new window.JitsiMeetExternalAPI(domain, options);
        },
        sendJoinMessage() {
            let msgText = this.buffer.isQuery() ? config.setting('inviteText') : config.setting('joinText');

            msgText = '* ' + msgText.replace('{{ nick }}', this.network.nick);

            if (config.setting('showLink') && this.link) {
                msgText += ' ' + this.link;
            }

            const message = new this.network.ircClient.Message('PRIVMSG', this.buffer.name, msgText);
            message.prefix = this.network.nick;
            message.tags['+kiwiirc.com/conference'] = config.getSetting('tagID');
            this.network.ircClient.raw(message);
        },
        getLink() {
            const link = 'https://' + config.setting('server') + '/' + this.encodedRoomName;
            if (!config.setting('useLinkShortener')) {
                this.link = link;
                return;
            }

            const shortURL = config.setting('linkShortenerURL');
            if (shortURL.indexOf('api-ssl.bitly.com') > -1) {
                this.getBitlyLink(shortURL, link);
            } else {
                this.getShortLink(shortURL, link);
            }
        },
        getShortLink(shortURL, link) {
            const requestURL = shortURL.replace('{{ link }}', link);
            fetch(requestURL)
                .then((r) => r.text())
                .then((result) => {
                    const urlRegex = kiwi.require('helpers/TextFormatting').urlRegex;
                    const isUrl = new RegExp('^' + urlRegex.source + '$');
                    // catch any issues by making sure the result is a url
                    if (isUrl.test(result)) {
                        this.link = result;
                    }
                    if (this.isJoined) {
                        this.sendJoinMessage();
                    }
                });
        },
        getBitlyLink(bitlyURL, link) {
            const apiKey = config.setting('linkShortenerAPIToken');
            const requestURL = bitlyURL + '?access_token=' + apiKey + '&longUrl=' + link;
            fetch(requestURL)
                .then((r) => r.json())
                .then((result) => {
                    this.link = result.url;
                    if (this.isJoined) {
                        this.sendJoinMessage();
                    }
                });
        },
    },
};
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
    background-color: rgba(0, 0, 0, 0.2);
}

.p-conference-loading {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background-color: rgba(0, 0, 0, 0.6);

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
