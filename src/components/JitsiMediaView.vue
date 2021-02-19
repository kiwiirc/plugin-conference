<template>
    <div class="plugin-conference-jitsi">
        <div v-if="isJoined" class="plugin-conference-overlay">
            {{ roomName }} @ {{ network.name }}
        </div>
    </div>
</template>

<script>

/* global kiwi:true */
import platform from 'platform';
import * as config from '../config.js';

export default {
    props: ['componentProps'],
    data() {
        return {
            api: null,
            link: '',
            token: '',
            isJoined: false,
            loadingAnimation: null,
        };
    },
    computed: {
        roomName() {
            if (this.buffer.isQuery()) {
                let members = [
                    this.network.nick,
                    this.buffer.name,
                ];
                members.sort();
                return 'query-' + members.join('+');
            }
            return this.buffer.name;
        },
        encodedRoomName() {
            let room = this.network.connection.server + '/' + this.roomName;
            return room.split('').map((c) => c.charCodeAt(0).toString(16)).join('');
        },
        buffer() {
            return this.componentProps.buffer;
        },
        network() {
            return this.buffer.getNetwork();
        },
    },
    mounted() {
        if (platform.name === 'IE') {
            let notSupported = document.createElement('div');
            notSupported.style.textAlign = 'center';
            notSupported.innerHTML = '<div class="plugin-conference-notsupported">This browser is not supported.<br />Please update your browser.</div>';
            this.$el.appendChild(notSupported);
            return;
        }

        this.loadingAnimationStart();

        if (config.setting('showLink')) {
            this.getLink();
        }

        if (config.setting('secure')) {
            kiwi.once('irc.raw.EXTJWT', (command, message) => {
                this.token = message.params[1];
                this.scriptLoad();
            });
            this.network.ircClient.raw('EXTJWT', this.roomName);
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
        let mediaviewer = this.$el.parentElement;
        if (mediaviewer) {
            mediaviewer.style.height = '';
        }

        if (this.api) {
            this.api.dispose();
        }
    },
    methods: {
        scriptLoad() {
            let that = this;
            let scr = document.createElement('script');
            scr.src = 'https://' + config.setting('server') + '/external_api.js';
            scr.onload = () => {
                that.scriptLoaded();
            };
            scr.defer = true;
            this.$el.appendChild(scr);
        },
        scriptLoaded() {
            let configOverwrite = config.setting('configOverwrite');
            configOverwrite.prejoinPageEnabled = false;

            let domain = config.setting('server');
            let options = {
                roomName: this.encodedRoomName,
                parentNode: this.$el,
                configOverwrite: configOverwrite,
                interfaceConfigOverwrite: config.setting('interfaceConfigOverwrite'),
            };

            if (config.setting('secure')) {
                options.jwt = this.token;
                options.noSsl = false;
            }

            this.api = new window.JitsiMeetExternalAPI(domain, options);
            this.api.executeCommand('displayName', this.network.nick);
            this.api.executeCommand('subject', ' ');
            this.api.once('videoConferenceJoined', () => {
                this.loadingAnimationStop();
                this.isJoined = true;
                if (!config.setting('showLink') || this.link) {
                    // if showLink is disabled or the link is ready send our join message,
                    // if the link is not ready the message will be send when it is
                    this.sendJoinMessage();
                }
            });
            this.api.once('videoConferenceLeft', () => {
                kiwi.emit('mediaviewer.hide');
            });
        },
        sendJoinMessage() {
            let msgText = this.buffer.isQuery() ?
                config.setting('inviteText') :
                config.setting('joinText');

            msgText = '* ' + msgText.replace('{{ nick }}', this.network.nick);

            if (config.setting('showLink') && this.link) {
                msgText += ' ' + this.link;
            }

            let message = new this.network.ircClient.Message('PRIVMSG', this.buffer.name, msgText);
            message.prefix = this.network.nick;
            message.tags['+kiwiirc.com/conference'] = config.getSetting('tagID');
            this.network.ircClient.raw(message);
        },
        loadingAnimationStart() {
            if (this.loadingAnimation) {
                return;
            }
            this.loadingAnimation = document.createElement('div');
            this.loadingAnimation.style.position = 'absolute';
            this.loadingAnimation.style.top = '34%';
            this.loadingAnimation.style.marginLeft = '45%';
            this.loadingAnimation.innerHTML = '<i class="fa fa-spin fa-spinner" aria-hidden="true" style="font-size: 100px;"/>';
            this.$el.appendChild(this.loadingAnimation);
        },
        loadingAnimationStop() {
            this.$el.removeChild(this.loadingAnimation);
            this.loadingAnimation = null;
        },
        getLink() {
            let link = 'https://' + config.setting('server') + '/' + this.encodedRoomName;
            if (!config.setting('useLinkShortener')) {
                this.link = link;
                return;
            }

            let shortURL = config.setting('linkShortenerURL');
            if (shortURL.indexOf('api-ssl.bitly.com') > -1) {
                this.getBitlyLink(shortURL, link);
            } else {
                this.getShortLink(shortURL, link);
            }
        },
        getShortLink(shortURL, link) {
            let requestURL = shortURL.replace('{{ link }}', link);
            let noCorsURL = 'https://cors-anywhere.herokuapp.com/';
            fetch(noCorsURL + requestURL).then((r) => r.text()).then((result) => {
                let urlRegex = kiwi.require('helpers/TextFormatting').urlRegex;
                let isUrl = new RegExp('^' + urlRegex.source + '$');
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
            let apiKey = config.setting('linkShortenerAPIToken');
            let requestURL = bitlyURL + '?access_token=' + apiKey + '&longUrl=' + link;
            fetch(requestURL).then((r) => r.json()).then((result) => {
                this.link = result.url;
                if (this.isJoined) {
                    this.sendJoinMessage();
                }
            });
        },
    },
};
</script>

<style>
.plugin-conference-jitsi {
    height: 100%;

    /* fixes firefox showing scrollbar */
    overflow: hidden;
}

.plugin-conference-overlay {
    background-color: rgba(0, 0, 0, 0.2);
    color: #fff;
    padding: 8px;
    position: absolute;
    top: 0;
    z-index: 10;
}

.plugin-conference-notsupported {
    background-color: var(--brand-error);
    border-radius: 5px;
    color: var(--brand-default-fg);
    display: inline-block;
    font-size: 130%;
    font-weight: 600;
    margin: 25px auto;
    padding: 25px;
}
</style>
