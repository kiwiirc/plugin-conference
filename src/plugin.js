/* global kiwi:true */

import * as config from '@/config.js';

import translations from '@/translations.js';
import HeaderButton from '@/components/HeaderButton.vue';
import MessageTemplate from '@/components/MessageTemplate.vue';
import JitsiMediaView from '@/components/JitsiMediaView.vue';

kiwi.plugin('conference', (kiwi) => {
    config.setDefaults();

    kiwi.addTranslations(config.configBase, translations);

    const tagID = config.getSetting('tagID').toString();

    const pluginState = {
        isActive: false,
    };

    const activeInviteStates = {
        // bufferName: {
        //     members: ['nick1', 'nick2'],
        //     timeout: 12345,
        // }
    };

    // Add conference buttons
    if (config.getSetting('channels') || config.getSetting('queries')) {
        if (config.getSetting('channels')) {
            kiwi.addUi('header_channel', HeaderButton, { props: { pluginState } });
        }

        if (config.getSetting('queries')) {
            kiwi.addUi('header_query', HeaderButton, { props: { pluginState } });
        }
    }

    // Allow other plugins to open the conference component
    kiwi.on('plugin-conference.show', (event) => {
        if (pluginState.isActive || !event.buffer) {
            return;
        }

        pluginState.isActive = true;
        kiwi.emit('mediaviewer.show', {
            component: JitsiMediaView,
            componentProps: {
                pluginState: pluginState,
                buffer: event.buffer,
            },
        });
    });

    // Allow other plugins to hide for completeness
    kiwi.on('plugin-conference.hide', () => {
        if (pluginState.isActive) {
            kiwi.emit('mediaviewer.hide');
        }
    });

    // Listen for conference irc message
    kiwi.on('irc.message', (event, network, ircEvent) => {
        if (event.from_server || !isConference(event.tags)) {
            return;
        }

        let bufferName = event.target;
        if (event.target === network.nick) {
            bufferName = event.nick;
        }

        const inviteState = activeInviteStates[bufferName.toUpperCase()];
        if (inviteState && inviteState.timeout + config.setting('groupInvitesTTL') > Date.now()) {
            if (inviteState.members.indexOf(event.nick) === -1) {
                // Add this nick to the existing invite component
                inviteState.members.push(event.nick);
            }

            // We have an active invite component, we no longer need this message
            ircEvent.handled = true;
        }
    });

    // Listen for new conference message and replace with our component
    kiwi.on('message.new', (event) => {
        const message = event.message;
        const buffer = event.buffer;
        if (!isConference(message.tags)) {
            return;
        }

        const inviteState = kiwi.Vue.observable({
            members: [message.nick],
            timeout: Date.now(),
        });

        activeInviteStates[buffer.name.toUpperCase()] = inviteState;

        message.template = kiwi.Vue.extend(MessageTemplate);
        message.templateProps = {
            inviteState,
            pluginState,
        };
    });

    function isConference(tags) {
        return tags && tags['+kiwiirc.com/conference'] === tagID;
    }
});
