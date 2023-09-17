/**
 * Read communications config from comm.yo-rc.json, if exists
 * and initializes it in communications variable.
 * @cmi-tic-craxkumar
 */
import fs from 'fs';
import path from 'path';

let communications = [];
export function loadCommunicationConfigs() {
  const path = this.destinationPath('../' + this.jhipsterConfig.baseName);
  if (this.fs.exists(`${path}/comm.yo-rc.json`)) {
    var allCommunication;
    try {
      allCommunication = JSON.parse(fs.readFileSync(`${path}/comm.yo-rc.json`));
      communications = allCommunication;
      this.jhipsterConfig.commConfigs = communications;
    } catch (err) {
      throw new Error(err, `Cannot parse the file comm.yo-rc.json in '${this.directoryPath}'`);
    }
  }
}

export function loadAppConfigs() {
  const basePath = this.destinationPath('../');
  let appConfigs = [];
  const items = fs.readdirSync(basePath);
  const dirs = items.filter((item) => fs.statSync(path.join(basePath, item)).isDirectory());
  for (const dir of dirs) {
    if (this.fs.exists(`${basePath}/${dir}/.yo-rc.json`)) {
      try {
        const appConfig = JSON.parse(fs.readFileSync(`${basePath}/${dir}/.yo-rc.json`));
        appConfigs.push(appConfig['generator-jhipster']);
      } catch (err) {
        throw new Error(`Cannot parse the file .yo-rc.json in '${basePath}/${dir}'`);
      }
    }
  }
  this.jhipsterConfig.appConfigs = appConfigs;
  return appConfigs;
}

export { communications };
