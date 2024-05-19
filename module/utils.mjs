const _preloc = {};

export function preLocalize(key, conf) {
    _preloc[key] = conf;
}

export function performPreLocalization() {
    for(const [key, conf] of Object.entries(_preloc)) {
        for(const [k, v] of Object.entries(conf)) {
            conf[k] = game.i18n.localize(v);
        }
    }
}
