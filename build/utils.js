const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

module.exports.pathResolve = (...args) => path.resolve(process.cwd(), ...args);

module.exports.getCommitHash = () => {
    let commitHash = 'unknown';
    try {
        commitHash = execSync('git rev-parse --short HEAD').toString().trim();
        const modified = execSync('git diff --quiet HEAD -- || echo true').toString();
        if (modified.trim() === 'true') {
            commitHash += '-modified';
        }
    } catch {
        console.error('Failed to get commit hash');
    }
    return commitHash;
};

module.exports.getNetworkIPs = () => {
    const interfaces = os.networkInterfaces();
    const ips = [];
    /* eslint-disable no-restricted-syntax */
    for (const iface of Object.values(interfaces)) {
        for (const alias of iface) {
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                ips.push(alias.address);
            }
        }
    }

    return ips;
};

module.exports.formatSize = (_size) => {
    const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];
    let size = _size;
    let pos = 0;

    while (size >= 1024 && pos < units.length) {
        size /= 1024;
        pos++;
    }

    return `${parseFloat(size.toFixed(2))} ${units[pos]}`;
};

module.exports.KiB = 1024;
module.exports.MiB = 1048576;
module.exports.GiB = 1073741824;

/*
 * Re-maps a number from one range to another
 * http://processing.org/reference/map_.html
 */
module.exports.mapRange = (value, vMin, vMax, dMin, dMax) => {
    const vValue = parseFloat(value);
    const vRange = vMax - vMin;
    const dRange = dMax - dMin;

    return (vValue - vMin) * dRange / vRange + dMin;
};
