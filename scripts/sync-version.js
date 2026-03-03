const fs = require("fs");
const path = require("path");

const pkg = require("../package.json");
const appJsonPath = path.resolve(__dirname, "../app.json");
const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf8"));

appJson.expo.version = pkg.version;
fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + "\n");

console.log(`app.json version synced to ${pkg.version}`);
