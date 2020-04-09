/* global kiwi:true */

import * as config from './config.js';
import HeaderButton from './components/HeaderButton.vue';
import MessageTemplate from './components/MessageTemplate.vue';

kiwi.plugin('conference', (kiwi) => {
    config.setDefaults();

    let tagID = config.getSetting('tagID').toString();

    let pluginState = {
        isActive: false,
    };

    let activeInviteStates = {
        // bufferName: {
        //     members: ['nick1', 'nick2'],
        //     timeout: 12345,
        // }
    };

    // Add conference buttons
    if (config.getSetting('channels') || config.getSetting('queries')) {
        let ButtonComponent = kiwi.Vue.extend(HeaderButton);
        let buttonInstance = new ButtonComponent({
            data() {
                return {
                    pluginState: pluginState,
                };
            },
        });
        buttonInstance.$mount();

        if (config.getSetting('channels')) {
            kiwi.addUi('header_channel', buttonInstance.$el);
        }

        if (config.getSetting('queries')) {
            kiwi.addUi('header_query', buttonInstance.$el);
        }
    }

    kiwi.on('irc.message', (event, network, ircEvent) => {
        if (event.from_server || !isConference(event.tags)) {
            return;
        }

        let bufferName = event.target;
        if (event.target === network.nick) {
            bufferName = event.nick;
        }

        let inviteState = activeInviteStates[bufferName];
        if (inviteState && inviteState.timeout + config.setting('groupInvitesTTL') > Date.now()) {
            if (inviteState.members.indexOf(event.nick) === -1) {
                inviteState.members.push(event.nick);
            }
            ircEvent.handled = true;
        }
    });

    kiwi.on('message.new', (event) => {
        let message = event.message;
        let buffer = event.buffer;
        if (!isConference(message.tags)) {
            return;
        }

        activeInviteStates[buffer.name] = {
            members: [message.nick],
            timeout: Date.now(),
        };

        let MessageComponent = kiwi.Vue.extend(MessageTemplate);
        let messageInstance = new MessageComponent({
            propsData: {
                buffer: buffer,
            },
            data() {
                return {
                    pluginState: pluginState,
                    inviteState: activeInviteStates[buffer.name],
                };
            },
        });
        messageInstance.$mount();
        message.template = messageInstance;
    });

    function isConference(tags) {
        return tags && tags['+kiwiirc.com/conference'] === tagID;
    }
});
