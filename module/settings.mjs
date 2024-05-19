export function add(key, data) {
    const common = {
        config: true,
        requiresReload: true,
        scope: "world",
        name: `HUMAN-LANG.${key}.name`,
        hint: `HUMAN-LANG.${key}.hint`,
    };

    game.settings.register("human-lang", key, Object.assign(common, data));
}

export function get(key) {
    return game.settings.get("human-lang", key);
}
