<template>
    <div v-if="showButton" class="plugin-conference-button" @click="openJitsi()">
        <a><i aria-hidden="true" class="fa fa-phone" /></a>
    </div>
</template>

<script>

/* global kiwi:true */
import JitsiMediaView from './JitsiMediaView.vue';
import * as config from '../config.js';

export default {
    props: ['network', 'buffer', 'sidebarState', 'pluginState'],
    computed: {
        showButton() {
            return config.isAllowedBuffer(this.buffer);
        }
    },
    methods: {
        openJitsi() {
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
            // eslint-disable-next-line no-alert
            if (window.confirm('Close current conference?')) {
                kiwi.emit('mediaviewer.hide');
            }
        },
    },
};
</script>

<style>
.plugin-conference-button {
    cursor: pointer;
}
</style>
