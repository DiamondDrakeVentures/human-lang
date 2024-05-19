import Lang from "./lang.mjs";

function registerSysSettings() {
    game.settings.register("human-lang", "common_lang", {
        config: true,
        requiresReload: true,
        scope: "world",
        name: "HUMAN-LANG.common_lang.name",
        hint: "HUMAN-LANG.common_lang.hint",
        type: String,
        choices: {
            common: "Common",
            ...Lang
        },
        default: "common",
    });

    game.settings.register("human-lang", "remove_standard", {
        config: true,
        requiresReload: true,
        scope: "world",
        name: "HUMAN-LANG.remove_standard.name",
        hint: "HUMAN-LANG.remove_standard.hint",
        type: Boolean,
        default: false,
    });

    game.settings.register("human-lang", "remove_exotic", {
        config: true,
        requiresReload: true,
        scope: "world",
        name: "HUMAN-LANG.remove_exotic.name",
        hint: "HUMAN-LANG.remove_exotic.hint",
        type: Boolean,
        default: false,
    });

    game.settings.register("human-lang", "remove_primordial", {
        config: true,
        requiresReload: true,
        scope: "world",
        name: "HUMAN-LANG.remove_primordial.name",
        hint: "HUMAN-LANG.remove_primordial.hint",
        type: Boolean,
        default: false,
    });

    game.settings.register("human-lang", "remove_druidic", {
        config: true,
        requiresReload: true,
        scope: "world",
        name: "HUMAN-LANG.remove_druidic.name",
        hint: "HUMAN-LANG.remove_druidic.hint",
        type: Boolean,
        default: false,
    });

    game.settings.register("human-lang", "remove_cant", {
        config: true,
        requiresReload: true,
        scope: "world",
        name: "HUMAN-LANG.remove_cant.name",
        hint: "HUMAN-LANG.remove_cant.hint",
        type: Boolean,
        default: false,
    });
}

Hooks.once("init", () => {
    registerSysSettings();

    const commonLang = game.settings.get("human-lang", "common_lang");

    if(commonLang != "common") {
        CONFIG.DND5E.languages.standard.children.common = Lang[commonLang];
    }

    CONFIG.DND5E.languages.human = {
        label: "HUMAN-LANG.group.human",
        children: Lang,
    };

    if(commonLang != "common") {
        delete CONFIG.DND5E.languages.human.children[commonLang];
    }

    if(game.settings.get("human-lang", "remove_standard")) {
        for(const [key, val] of Object.entries(CONFIG.DND5E.languages.standard.children)) {
            if(key != "common") {
                delete CONFIG.DND5E.languages.standard.children[key];
            }
        }
    }

    if(game.settings.get("human-lang", "remove_exotic")) {
        for(const [key, val] of Object.entries(CONFIG.DND5E.languages.exotic.children)) {
            if(key != "primordial") {
                delete CONFIG.DND5E.languages.exotic.children[key];
            }
        }
    }

    if(game.settings.get("human-lang", "remove_primordial")) {
        delete CONFIG.DND5E.languages.exotic.children.primordial;
    }

    if(Object.entries(CONFIG.DND5E.languages.exotic.children).length < 1) {
        delete CONFIG.DND5E.languages.exotic;
    }

    if(game.settings.get("human-lang", "remove_druidic")) {
        delete CONFIG.DND5E.languages.druidic;
    }

    if(game.settings.get("human-lang", "remove_cant")) {
        delete CONFIG.DND5E.languages.cant;
    }
});
