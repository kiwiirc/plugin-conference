<template>
    <div class="plugin-conference-join">
        <div class="plugin-conference-jointext">
            {{ $t('plugin-conference:' + (buffer.isQuery() ? 'inviteText' : 'joinText'), { nick: nicks.join(', ') }) }}
        </div>
        <div v-if="shouldShowButtons" class="u-button u-button-primary" @click="openJitsi()">
            <i aria-hidden="true" class="fa fa-phone" />
            <span class="plugin-conference-joinbutton">{{ $t('plugin-conference:joinNow') }}</span>
        </div>
    </div>
</template>

<script>

/* global kiwi:true */
import * as config from '@/config.js';

import JitsiMediaView from '@/components/JitsiMediaView.vue';

const TextFormatting = kiwi.require('helpers/TextFormatting');

export default {
    props: ['buffer', 'message', 'idx', 'ml', 'pluginState', 'inviteState'],
    computed: {
        nicks() {
            const maxLength = config.setting('maxParticipantsLength');
            const showNicks = [];
            let length = 0;
            for (let i = 0; i < this.inviteState.members.length; i++) {
                const nick = this.inviteState.members[i];
                length += nick.length;
                if (length > maxLength) {
                    showNicks.push(TextFormatting.t('plugin-conference:participantsMore'));
                    break;
                }
                showNicks.push(nick);
            }
            return showNicks;
        },
        shouldShowButtons() {
            const network = this.buffer.getNetwork();
            return !this.pluginState.isActive
                && (
                    (this.buffer.isQuery() && network.state === 'connected')
                    || this.buffer.joined
                );
        },
    },
    methods: {
        openJitsi() {
            this.pluginState.isActive = true;
            kiwi.emit('mediaviewer.show', {
                component: JitsiMediaView,
                componentProps: {
                    pluginState: this.pluginState,
                    buffer: this.buffer,
                },
            });
        },
    },
};
</script>

<style>
.plugin-conference-join {
    box-sizing: border-box;
    width: 100%;
    padding: 20px;
    font-size: 1.05em;
    line-height: 1.05em;
    text-align: center;
    background: var(--brand-midtone);
}

.plugin-conference-jointext {
    display: inline-block;
    margin-right: 10px;
    line-height: 2em;
}

.plugin-conference-joinbutton {
    margin-left: 8px;
}
</style>
