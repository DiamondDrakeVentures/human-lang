import fs from "fs";
import path from "path";

let str = fs.readFileSync("module.json");
const module = JSON.parse(str);

const src = [
    "module.json",
    "README.md",
    "module",
    "lang",
];

let prefix;

switch(process.platform) {
    case "darwin":
        console.log("Installing to macOS FoundryVTT");
        prefix = path.join(process.env.HOME, "Library/Application Support/FoundryVTT/Data/modules");
        break;

    case "linux":
        console.log("Installing to Linux FoundryVTT");
        prefix = path.join(process.env.HOME, ".local/share/FoundryVTT/data/modules");
        break;

    case "win32":
        console.log("Installing to Windows FoundryVTT");
        prefix = path.join(process.env.LOCALAPPDATA, "FoundryVTT\\Data\\modules");
        break;

    default:
        console.log(`unknown os: ${process.platform}`);
        process.exit(1);
}

let target = path.join(prefix, module.id);

if(!fs.existsSync(target)) {
    fs.mkdirSync(target);
} else if(!fs.lstatSync(target).isDirectory) {
    fs.unlinkSync(target);
    fs.mkdirSync(target);
}

for(const s of src) {
    if(!fs.existsSync(s)) {
        continue;
    }

    console.log(`Copying ${s} to ${path.join(target, s)}`);

    if(fs.lstatSync(s).isDirectory()) {
        fs.cpSync(s, path.join(target, s), {recursive: true});
    } else {
        fs.copyFileSync(s, path.join(target, s));
    }
}
