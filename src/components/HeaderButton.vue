<template>
    <div v-if="showButton" class="p-conference-button" :class="{ 'kiwi-header-option--active': pluginState.isActive }">
        <div v-if="closePrompt" class="p-conference-prompt">
            <div>{{ $t('plugin-conference:closeConference') }}</div>
            <input-confirm :flip-connotation="true" @ok="closeConference()" @submit="hideToast()" />
        </div>
        <div @click="openConference()">
            <a><i aria-hidden="true" :class="buttonIcon" class="fa" /></a>
        </div>
    </div>
</template>

<script>
/* global kiwi:true */
import * as config from '@/config.js';

import JitsiMediaView from '@/components/JitsiMediaView.vue';

export default {
    props: ['network', 'buffer', 'sidebarState', 'pluginState'],
    data() {
        return {
            closePrompt: false,
        };
    },
    computed: {
        showButton() {
            return config.isAllowedBuffer(this.buffer);
        },
        buttonIcon() {
            return config.setting('buttonIcon');
        },
    },
    methods: {
        openConference() {
            if (!this.pluginState.isActive) {
                this.pluginState.isActive = true;
                kiwi.emit('mediaviewer.show', {
                    component: JitsiMediaView,
                    componentProps: {
                        pluginState: this.pluginState,
                        buffer: this.buffer,
                    },
                });
                return;
            }

            this.closePrompt = true;
        },
        closeConference() {
            kiwi.emit('mediaviewer.hide');
        },
        hideToast() {
            this.closePrompt = false;
        },
    },
};
</script>

<style lang="scss">
.p-conference-prompt {
    position: absolute;
    top: 44px;
    right: 10px;
    padding: 10px;
    font-size: 1.2em;
    font-weight: 400;
    color: var(--brand-default-fg, #000);
    background-color: var(--brand-default-bg, #fff);
    border-radius: 0 0 10px 10px;

    a.u-button-warning {
        color: var(--brand-default-bg);
        background-color: var(--brand-error);
    }
}
</style>
