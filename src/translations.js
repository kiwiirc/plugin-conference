/* global kiwi:true */

import * as config from '@/config.js';

const TextFormatting = kiwi.require('helpers/TextFormatting');

export default {
    'en-us': {
        notSupported: 'This browser is not supported.\nPlease update your browser.',
        closeConference: 'Close the current conference?',
        joinNow: 'Join now!',
        inviteText: '{{ nick }} is inviting you to a private call.',
        joinText: '{{ nick }} has joined the conference.',
        participantsMore: 'more...',
        startConference: 'Start Conference',
        endConference: 'End Conference',
        conferenceFailedToken: 'Conference: failed to obtain authentication token',
        conferenceFailedReauth: 'Conference: failed to re-authenticate',
        conferenceError: 'Conference error: {{ error }}',
    },
};

export function t(...args) {
    return TextFormatting.t(config.configBase + ':' + args.shift(), ...args);
}
