import os from 'os';
import fs from 'fs';

let configPath = os.homedir() + '/.riverrc';
let config = {};

if (!fs.existsSync(configPath)) {
  console.log('Cannot find config file: ' + configPath);
  process.exit(1);
}

try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (e) {
  console.log('Config file is not valid json: ' + configPath);
  process.exit(1);
}

if (!config.host) {
  console.log('[.riverrc] Missing field "host"');
  process.exit(1);
}

if (!config.sorted) {
  console.log('[.riverrc] Missing field "sorted"\n path from host to sorted music root directory.');
  process.exit(1);
}

if (!config.unsorted) {
  console.log('[.riverrc] Missing field "unsorted"\n Path from host to unsorted music root directory.');
  process.exit(1);
}

if (!config.metafile) {
  console.log('[.riverrc] Missing field "metafile"\n Path from host to generated json file (by river_gen).');
  process.exit(1);
}

if (!config.username) {
  console.log('[.riverrc] Missing field "username"\n Basic auth username');
  process.exit(1);
}

if (!config.metafile) {
  console.log('[.riverrc] Missing field "metafile"\n Path from host to generated json file (by river_gen).');
  process.exit(1);
}
export default config;
