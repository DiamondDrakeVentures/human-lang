import * as Settings from "./settings.mjs";
import * as Utils from "./utils.mjs";
import Lang from "./lang.mjs";

function registerSysSettings() {
    Settings.add("common_lang", {
        choices: {
            common: "Common",
            ...Lang,
        },
        default: "common",
    });

    Settings.add("remove_standard", {
        type: Boolean,
        default: false,
    });

    Settings.add("remove_exotic", {
        type: Boolean,
        default: false,
    });

    Settings.add("remove_primordial", {
        type: Boolean,
        default: false,
    });

    Settings.add("remove_druidic", {
        type: Boolean,
        default: false,
    });

    Settings.add("remove_cant", {
        type: Boolean,
        default: false,
    });
}

Hooks.once("init", () => {
    registerSysSettings();

    const commonLang = Settings.get("common_lang");

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

    if(Settings.get("remove_standard")) {
        for(const [key, val] of Object.entries(CONFIG.DND5E.languages.standard.children)) {
            if(key != "common") {
                delete CONFIG.DND5E.languages.standard.children[key];
            }
        }
    }

    if(Settings.get("remove_exotic")) {
        for(const [key, val] of Object.entries(CONFIG.DND5E.languages.exotic.children)) {
            if(key != "primordial") {
                delete CONFIG.DND5E.languages.exotic.children[key];
            }
        }
    }

    if(Settings.get("remove_primordial")) {
        delete CONFIG.DND5E.languages.exotic.children.primordial;
    }

    if(Object.entries(CONFIG.DND5E.languages.exotic.children).length < 1) {
        delete CONFIG.DND5E.languages.exotic;
    }

    if(Settings.get("remove_druidic")) {
        delete CONFIG.DND5E.languages.druidic;
    }

    if(Settings.get("remove_cant")) {
        delete CONFIG.DND5E.languages.cant;
    }
});

Hooks.once("i18nInit", () => {
    Utils.performPreLocalization();
});
