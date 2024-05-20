import fs from "fs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const manifest = "module.json";
const manifestURL = "https://github.com/DiamondDrakeVentures/human-lang/releases/download/__VERSION__/module.json";
const downloadURL = "https://github.com/DiamondDrakeVentures/human-lang/releases/download/__VERSION__/human-lang-__VERSION__.zip";

function handlePromote(file, ver) {
    const f = fs.readFileSync(file).toString();
    const man = JSON.parse(f);

    man.version = ver;
    man.manifest = manifestURL.replaceAll("__VERSION__", ver);
    man.download = downloadURL.replaceAll("__VERSION__", ver);

    fs.writeFileSync(file, JSON.stringify(man, null, "  "));
}

const argv = yargs(hideBin(process.argv))
    .command(cmdPromote())
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

            let f;
            if(file === undefined || file.length < 1) {
                if(!fs.existsSync(manifest) || !fs.lstatSync(manifest).isFile()) {
                    throw new Error(`No file provided and '${manifest}' does not exist in current directory.`);
                } else {
                    f = manifest;
                }
            } else {
                f = file;
            }

            return handlePromote(f, version);
        },
    };
}
