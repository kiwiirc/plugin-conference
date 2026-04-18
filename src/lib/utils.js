const base36Chars = '0123456789abcdefghijklmnopqrstuvwxyz';

function base36Encode(binary) {
    let base36 = '';
    let bytes = [];

    for (let i = 0; i < binary.length; i++) {
        bytes.push(binary[i]);
    }

    while (bytes.length > 0) {
        const quotient = [];
        let remainder = 0;

        for (let i = bytes.length - 1; i >= 0; i--) {
            const accumulator = bytes[i] + remainder * 256;
            const digit = Math.floor(accumulator / 36);
            remainder = accumulator % 36;
            if (quotient.length > 0 || digit > 0) {
                quotient.unshift(digit);
            }
        }

        base36 += base36Chars[remainder];
        bytes = quotient;
    }

    return base36;
}

async function sha256(str) {
    const msgBuffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    return new Uint8Array(hashBuffer);
}

export async function encodeRoomName(str) {
    const hash = await sha256(str);
    return base36Encode(hash).slice(-16);
}
