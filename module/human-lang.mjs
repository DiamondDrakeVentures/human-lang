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
})
