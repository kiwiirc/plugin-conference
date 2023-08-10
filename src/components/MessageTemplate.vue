<template>
    <div class="plugin-conference-join">
        <div class="plugin-conference-jointext">
            {{ buffer.isQuery() ? inviteText : joinText }}
        </div>
        <div v-if="!pluginState.isActive" class="u-button u-button-primary" @click="openJitsi()">
            <i aria-hidden="true" class="fa fa-phone" />
            <span class="plugin-conference-joinbutton">{{ joinButtonText }}</span>
        </div>
    </div>
</template>

<script>

/* global kiwi:true */
import JitsiMediaView from './JitsiMediaView.vue';
import * as config from '../config.js';

export default {
    props: ['buffer', 'message', 'idx', 'ml', 'pluginState', 'inviteState'],
    computed: {
        nicks() {
            let maxLength = config.setting('maxParticipantsLength');
            let showNicks = [];
            let length = 0;
            for (let i = 0; i < this.inviteState.members.length; i++) {
                let nick = this.inviteState.members[i];
                length += nick.length;
                if (length > maxLength) {
                    showNicks.push(config.setting('participantsMore'));
                    break;
                }
                showNicks.push(nick);
            }
            return showNicks;
        },
        joinButtonText() {
            return config.setting('joinButtonText');
        },
        inviteText() {
            return config.setting('inviteText').replace('{{ nick }}', this.nicks.join(', '));
        },
        joinText() {
            return config.setting('joinText').replace('{{ nick }}', this.nicks.join(', '));
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
    background: var(--brand-midtone);
    box-sizing: border-box;
    font-size: 1.05em;
    line-height: 1.05em;
    padding: 20px;
    text-align: center;
    width: 100%;
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
