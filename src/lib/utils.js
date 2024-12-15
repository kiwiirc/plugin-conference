const base62Chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

function base62Encode(binary) {
    let base62 = '';
    let bytes = [];

    for (let i = 0; i < binary.length; i++) {
        bytes.push(binary[i]);
    }

    while (bytes.length > 0) {
        const quotient = [];
        let remainder = 0;

        for (let i = bytes.length - 1; i >= 0; i--) {
            const accumulator = bytes[i] + remainder * 256;
            const digit = Math.floor(accumulator / 62);
            remainder = accumulator % 62;
            if (quotient.length > 0 || digit > 0) {
                quotient.unshift(digit);
            }
        }

        base62 += base62Chars[remainder];
        bytes = quotient;
    }

    return base62;
}

async function sha256(str) {
    const msgBuffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    return new Uint8Array(hashBuffer);
}

export async function encodeRoomName(str) {
    const hash = await sha256(str);
    return base62Encode(hash).slice(-16);
}
