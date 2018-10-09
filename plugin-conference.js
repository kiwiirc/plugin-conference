/* eslint-disable vue/html-indent */
/* eslint-disable no-bitwise */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-extend-native */
import platform from 'platform';
    
if (platform.name === 'IE') {
    // polyfill for includes
    // https://tc39.github.io/ecma262/#sec-array.prototype.includes
    if (!Array.prototype.includes) {
        Object.defineProperty(Array.prototype, 'includes', {
            value: function(searchElement, fromIndex) { // eslint-disable-line
                if (this == null) {
                    throw new TypeError('"this" is null or not defined');
                }
                // 1. Let O be ? ToObject(this value).
                let o = Object(this);
                // 2. Let len be ? ToLength(? Get(O, "length")).
                let len = o.length >>> 0;
                // 3. If len is 0, return false.
                if (len === 0) {
                    return false;
                }
                // 4. Let n be ? ToInteger(fromIndex).
                //        (If fromIndex is undefined, this step produces the value 0.)
                let n = fromIndex | 0;

                // 5. If n ≥ 0, then
                //    a. Let k be n.
                // 6. Else n < 0,
                //    a. Let k be len + n.
                //    b. If k < 0, let k be 0.
                let k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
                let sameValueZero = (x, y) => x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
                // 7. Repeat, while k < len
                while (k < len) {
                    // a. Let elementK be the result of ? Get(O, ! ToString(k)).
                    // b. If SameValueZero(searchElement, elementK) is true, return true.
                    if (sameValueZero(o[k], searchElement)) {
                        return true;
                    }
                    // c. Increase k by 1.
                    k++;
                }
                // 8. Return false
                return false;
            },
        });
    }
}

kiwi.plugin('conferencePlugin', (kiwi, log) => { /* eslint-disable-line no-undef */
    let api = null;
    let token = null;
    // captionTimer holds a per-buffer value to control grouping of join messages
    let captionTimer = [];
    // captions holds the actual message data that is displayed upon conference joins
    let captions = [];
    let kiwiConferenceTag = '1';
    let sharedData = { isOpen: false };
    const groupedNoticesTTL = 30000;

    // Load any jitsi UI config settings
    let interfaceConfigOverwriteFromConfig = kiwi.state.setting('conference.interfaceConfigOverwrite') || {};
    let interfaceConfigOverwrite = {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'fullscreen', 'hangup',
            'settings', 'videoquality', 'filmstrip', 'fodeviceselection',
            'stats', 'shortcuts',
        ],
    };
    Object.keys(interfaceConfigOverwriteFromConfig).forEach((key) => {
        interfaceConfigOverwrite[key] = interfaceConfigOverwriteFromConfig[key];
    });

    // Load any jitsi general config settings
    let configOverwriteFromConfig = kiwi.state.setting('conference.configOverwrite') || {};
    let configOverwrite = {
        startWithVideoMuted: true,
        startWithAudioMuted: true,
    };
    Object.keys(configOverwriteFromConfig).forEach((key) => {
        configOverwrite[key] = configOverwriteFromConfig[key];
    });

    // Add the call button to the channel+query headers
    const conferencingTool = document.createElement('div');
    conferencingTool.style.cursor = 'pointer';
    conferencingTool.innerHTML = '<a> <i style="padding-left: 10px;" aria-hidden="true" class="fa fa-phone"></i></a>';
    if (kiwi.state.setting('conference.channels') !== false) {
        kiwi.addUi('header_channel', conferencingTool);
    }
    if (kiwi.state.setting('conference.queries') !== false) {    
        kiwi.addUi('header_query', conferencingTool);
    }
    conferencingTool.onclick = (e) => {
        e.preventDefault();
        if (api) {
            hideCams();
        } else {
            showCams();
        }
    };

    // The component that gets shown in the messagelist when somebody joins a conference call
    const joinCallMessageComponent = kiwi.Vue.extend({
        template: `
            <div style="width:100%; padding: 20px; background: #3338; text-align: center; color: #ffe; font-size: 1.05em; line-height: 1.05em;">
                <div v-for="(caption, idx) in captions" :key="caption" style="display: inline-block">
                    <b>{{caption}}</b><span v-if="captions.length > 1 && idx < captions.length - 1">,&nbsp;</span>
                    <span v-if="idx === captions.length-1 && caption.indexOf('is inviting you to a private call.') === -1"> ha<span v-if="captions.length > 1">ve</span><span v-else>s</span> joined the conference.</span>
                </div>
                <div v-if="!sharedData.isOpen" @click="showCams()" style="background: #bca; color: #000;" class="u-button u-button-primary"><i aria-hidden="true" class="fa fa-phone"></i> Join now!</div>
            </div>
        `,
        props: [
            'message',
            'buffer',
        ],
        data() {
            return { captions: null };
        },
        methods: {
            showCams: showCams,
        },
    });

    kiwi.on('message.new', (newMessage, buffer) => {
        let messageTemplate = null;
        let message = '';
        let nick = '';
        if (newMessage.tags && newMessage.tags['+kiwiirc.com/conference'] === kiwiConferenceTag) {
            nick = newMessage.nick;
            if (buffer.isChannel()) {
                let bufferMessages = buffer.getMessages();
                for (let i = bufferMessages.length; i--;) {
                    if (bufferMessages[i].tags && bufferMessages[i].tags['+kiwiirc.com/conference'] === kiwiConferenceTag) {
                        messageTemplate = bufferMessages[i];
                        break;
                    }
                }
            }
            let timerKey = window.kiwi.state.getActiveNetwork().name + buffer.name;
            // if this is the first join message in groupedNoticesTTL milliseconds,
            // or is a private message, inject a new in-call component
            if (typeof captionTimer[timerKey] === 'undefined' || Date.now() - captionTimer[timerKey] > groupedNoticesTTL || buffer.isQuery()) {
                messageTemplate = newMessage;
                captions[timerKey] = [];
            } else {
                newMessage.template = kiwi.Vue.extend({ template: null });
            }
            captionTimer[timerKey] = Date.now();
            // if this is a channel join (not a PM), then just display the nick.
            // Otherwise show the message below.
            if (buffer.isChannel()) {
                message = '';
            } else {
                message = ' is inviting you to a private call.';
            }
            if (!captions[timerKey].includes(nick + message)) {
                captions[timerKey].push(nick + message);
                // only inject a new vue component if this is the first
                // join message in groupedNoticesTTL milliseconds
                if (captions[timerKey].length === 1) {
                    messageTemplate.template = joinCallMessageComponent.extend({
                        data() {
                            return {
                                captions: captions[timerKey],
                                sharedData: sharedData,
                            };
                        },
                    });
                }
            }
        }
    });

    function showCams() {
        sharedData.isOpen = true;
        kiwi.emit('mediaviewer.show', { iframe: true, url: 'about:blank' });

        // Give some time for the mediaviewer to show up in the DOM
        setTimeout(loadJitsi, 10);
    }

    function loadJitsi() {
        let iframe = prepareJitsiIframe();
        let innerDoc = iframe.contentDocument || iframe.contentWindow.document;
        let jitsiBody = innerDoc.getElementsByTagName('body')[0];
        let innerHead = innerDoc.getElementsByTagName('head')[0];
        let network = window.kiwi.state.getActiveNetwork();
        let buffer = window.kiwi.state.getActiveBuffer();

        let roomName = '';
        let m = null;
        if (buffer.isQuery()) { // cam is being invoked in PM, not a channel
            let nicks = [];
            nicks.push(network.nick);
            nicks.push(buffer.name);
            nicks.sort();
            nicks[0] = 'query-' + nicks[0] + '#';
            roomName = nicks.join('');
            m = new network.ircClient.Message('PRIVMSG', buffer.name, '* ' + network.nick + ' is inviting you to a private call.');
        } else {
            roomName = buffer.name;
            m = new network.ircClient.Message('PRIVMSG', buffer.name, '* ' + network.nick + ' has joined the conference.');
        }

        m.tags['+kiwiirc.com/conference'] = kiwiConferenceTag;
        network.ircClient.raw(m);

        let options = {
            roomName: encodeRoomName(network.connection.server, roomName),
            displayName: buffer.name,
            parentNode: jitsiBody,
            interfaceConfigOverwrite,
            configOverwrite,
        };

        if (kiwi.state.setting('conference.secure')) {
            // Get the JWT token from the network
            kiwi.once('irc.raw.EXTJWT', (command, message) => {
                token = message.params[1];
                loadJitsiScript();
            });
            network.ircClient.raw('EXTJWT ' + roomName);
        } else {
            loadJitsiScript();
        }

        function loadJitsiScript() {
            if (platform.name === 'IE') {
                jitsiBody.style.height = '100vh';
                jitsiBody.style.background = '#666';
                jitsiBody.innerHTML = `<div style="font-size:16px;text-align:center;width:50%;margin-left:25%;margin-top:25vh;font-family:arial,tahoma;background:#311;color:#fcc;padding:25px;border-radius:5px;">
                                                             This browser is not supported.<br>Please update your browser.</div>`;
                return;
            }
            // Load the jitsi script into the mediaviewer iframe
            let jitsiDomain = kiwi.state.setting('conference.server') || 'meet.jit.si';
            let jitsiApiUrl = kiwi.state.setting('conference.jitsiApiUrl') || 'https://' + jitsiDomain + '/external_api.min.js';
            let jitsiAPIScript = innerDoc.createElement('script');
            jitsiAPIScript.setAttribute('type', 'text/javascript');
            jitsiAPIScript.setAttribute('src', jitsiApiUrl);
            jitsiAPIScript.addEventListener('load', (event) => {
                if (event.target.nodeName === 'SCRIPT') {
                    jitsiBody.innerHTML = '';
                    if (kiwi.state.setting('conference.secure')) {
                        options.jwt = token;
                        options.noSsl = false;
                    }
                    api = new iframe.contentWindow.JitsiMeetExternalAPI(jitsiDomain, options);
                    api.executeCommand('displayName', network.nick);
                    api.on('videoConferenceLeft', () => {
                        hideCams();
                    });
                }
            });

            innerHead.appendChild(jitsiAPIScript);
        }
    }

    function prepareJitsiIframe() {
        let iframes = document.querySelectorAll('.kiwi-mediaviewer-iframe');
        let iframe = iframes[iframes.length - 1];
        let mediaviewers = document.querySelectorAll('.kiwi-mediaviewer');
        let mediaviewer = mediaviewers[mediaviewers.length - 1];
        let innerDoc = iframe.contentDocument || iframe.contentWindow.document;
        let jitsiDiv = innerDoc.getElementsByTagName('body')[0];

        innerDoc.domain = document.domain;
        setTimeout(() => {
            let jitsiIframe = innerDoc.getElementById('jitsiConferenceFrame0');
            let innerInnerDoc = jitsiIframe.contentDocument || jitsiIframe.contentWindow.document;
            innerInnerDoc.domain = document.domain;
        }, 2000);
        jitsiDiv.style.margin = 0;
        iframe.style.width = '100%';
        mediaviewer.style.height = '40%';
        mediaviewer.style.overflow = 'hidden';
        iframe.style.height = '100%';

        return iframe;
    }

    function hideCams() {
        sharedData.isOpen = false;
        if (api) {
            api.dispose();
            api = null;
        }
        kiwi.emit('mediaviewer.hide');
    }

    // To cover special characters in channel and query names, encode the complete name
    // into hex characters. The Jitsi server will decode this server-side
    function encodeRoomName(serverAddr, roomName) {
        let room = serverAddr + '/' + roomName;
        return room.split('').map(c => c.charCodeAt(0).toString(16)).join('');
    }

    kiwi.on('mediaviewer.hide', () => {
        sharedData.isOpen = false;
        if (api) hideCams();
    });
});
