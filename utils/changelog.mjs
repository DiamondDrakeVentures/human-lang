import fs, { write } from "fs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const verPattern = /^#{2}\s(.*)$/g;
const secPattern = /^#{3}\s(.*)$/g;
const verIDPattern = /\[([0-9]+\.[0-9]+\.[0-9]+)\]\s-\s([0-9]{4}\-[0-9]{2}-[0-9]{2})/g;

const UNRELEASED = "[UNRELEASED]";

const DEFAULT_SECTIONS = [
    "Added",
    "Changed",
    "Deprecated",
    "Removed",
    "Fixed",
    "Security",
];

function parseChangelog(str) {
    const changelog = {};

    const lines = str.split("\n");

    let ver = {};
    let sec = {};
    for(const line of lines) {
        const verHeader = Array.from(line.matchAll(verPattern), m => m[1]);
        const secHeader = Array.from(line.matchAll(secPattern), m => m[1]);

        if(verHeader.length > 0) {
            _closeSec(ver, sec);
            _closeVer(changelog, ver);

            if(verHeader[0] == UNRELEASED) {
                ver.id = UNRELEASED;
                ver.date = "";
            } else {
                ver.id = Array.from(verHeader[0].matchAll(verIDPattern), m => m[1])[0];
                ver.date = Array.from(verHeader[0].matchAll(verIDPattern), m => m[2])[0];
            }

            ver.sections = {};
        } else if(secHeader.length > 0) {
            _closeSec(ver, sec);

            sec.id = secHeader[0];
            sec.contents = [];
        } else if(sec.hasOwnProperty("contents")) {
            sec.contents.push(line);
        } else if(Object.keys(ver).length < 1) {
            if(!changelog.hasOwnProperty("header")) {
                changelog.header = [];
            }

            changelog.header.push(line);
        }
    }

    _closeSec(ver, sec);
    _closeVer(changelog, ver);

    return changelog;
}

function _closeSec(ver, sec) {
    if(Object.keys(sec).length > 0 && ver.hasOwnProperty("sections")) {
        ver.sections[sec.id] = sec.contents.join("\n").trim();

        Object.keys(sec).forEach(k => delete sec[k]);
    }
}

function _closeVer(log, ver) {
    if(Object.keys(ver).length > 0) {
        log[ver.id] = {
            date: ver.date,
            sections: ver.sections,
        };

        Object.keys(ver).forEach(k => delete ver[k]);
    }
}

function _newUnreleased() {
    const unreleased = {
        date: "",
        sections: {},
    };

    for(const sec of DEFAULT_SECTIONS) {
        unreleased.sections[sec] = "";
    }

    return unreleased;
}

function _date() {
    const d = new Date();

    const month = ("0" + (d.getMonth() + 1)).slice(-2);
    const date = ("0" + d.getDate()).slice(-2);

    return `${d.getFullYear()}-${month}-${date}`;
}

function promoteUnreleased(log, ver) {
    const changelog = {};
    changelog.header = log.header;

    const promote = {
        date: _date(),
        sections: {},
    };

    for(const [sec, contents] of Object.entries(log[UNRELEASED].sections)) {
        if(contents.length > 0) {
            promote.sections[sec] = contents;
        }
    }

    changelog[UNRELEASED] = _newUnreleased();

    changelog[ver] = promote;

    for(const [id, data] of Object.entries(log)) {
        if(id != UNRELEASED && id != "header") {
            changelog[id] = data;
        }
    }

    return changelog;
}

function writeChangelog(log, header, includeUnreleased) {
    const buffer = [];

    if(log.hasOwnProperty("header") && header) {
        buffer.push(log.header.join("\n"));
    }

    if(includeUnreleased && !log.hasOwnProperty(UNRELEASED)) {
        const unreleased = _newUnreleased();

        buffer.push(`## ${UNRELEASED}`, "");

        _writeChangelogSection(buffer, unreleased.sections);
    }

    for(const [version, data] of Object.entries(log)) {
        if(version == UNRELEASED) {
            if(includeUnreleased) {
                buffer.push(`## ${version}`, "");

                _writeChangelogSection(buffer, data.sections);
            }
        } else if(version != "header") {
            buffer.push(`## [${version}] - ${data.date}`, "");

            _writeChangelogSection(buffer, data.sections);
        }
    }

    return buffer.join("\n");
}

function _writeChangelogSection(buffer, sections) {
    for(const [section, contents] of Object.entries(sections)) {
        buffer.push(`### ${section}`, "", contents, "");
    }
}

function getFile(file) {
    if(file !== undefined && file.length > 0) {
        return file;
    }

    if(fs.existsSync("CHANGELOG.md") && fs.lstatSync("CHANGELOG.md").isFile()) {
        return "CHANGELOG.md";
    }

    throw new Error("No file provided and 'CHANGELOG.md' does not exist in current directory.");
}

function handlePromote(file, ver) {
    file = getFile(file);

    let c = parseChangelog(fs.readFileSync(file).toString());
    c = promoteUnreleased(c, ver);
    fs.writeFileSync(file, writeChangelog(c, true, false));
}

function handleAddUnreleased(file) {
    file = getFile(file);

    let c = parseChangelog(fs.readFileSync(file).toString());
    fs.writeFileSync(file, writeChangelog(c, true, true));
}

function getVersion(log, ver) {
    const buffer = [];

    if(ver.toString().toLowerCase() == "unreleased") {
        ver = UNRELEASED;
    }

    if(log.hasOwnProperty(ver)) {
        _writeChangelogSection(buffer, log[ver].sections);
    }

    return buffer.join("\n");
}

function handleGetVersion(file, ver) {
    file = getFile(file);

    let c = parseChangelog(fs.readFileSync(file).toString());
    console.log(getVersion(c, ver));
}

const argv = yargs(hideBin(process.argv))
    .command(cmdPromote())
    .command(cmdGet())
    .command(cmdAddUnreleased())
    .demandCommand(1)
    .help().alias("help", "h")
    .version(false)
    .argv;

function cmdPromote() {
    return {
        command: "promote <version> [file]",
        describe: "Promote unreleased",
        builder: yargs => {
            yargs.positional("version", {
                describe: "Version number",
                type: "string",
            });

            yargs.positional("file", {
                describe: "Changelog file",
                type: "string",
            });
        },
        handler: argv => {
            const { version, file } = argv;
            return handlePromote(file, version);
        },
    };
}

function cmdGet() {
    return {
        command: "get <version> [file]",
        describe: "Get changelog for a specific version",
        builder: yargs => {
            yargs.positional("version", {
                describe: "Version number",
                type: "string",
            });

            yargs.positional("file", {
                describe: "Changelog file",
                type: "string",
            });
        },
        handler: argv => {
            const { version, file } = argv;
            return handleGetVersion(file, version);
        },
    }
}

function cmdAddUnreleased() {
    return {
        command: "add-unreleased [file]",
        describe: "Add unreleased version to the changelog",
        builder: yargs => {
            yargs.positional("file", {
                describe: "Changelog file",
                type: "string",
            });
        },
        handler: argv => {
            const { file } = argv;
            return handleAddUnreleased(file);
        },
    };
}
