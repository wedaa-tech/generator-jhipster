/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { applicationTypes } from '../../jdl/jhipster/index.mjs';
const { GATEWAY, MICROSERVICE } = applicationTypes;

export default async function writeInstructions({ application }) {
    Object.assign(this, application);

    this.uiApps = [];
    this.beApps = [];
    for (let i = 0; i < this.appConfigs.length; i++) {
        this.app = this.appConfigs[i];
        if (this.app.applicationType === GATEWAY) {
            this.uiApps.push(this.app.baseName);
        } else if (this.app.applicationType === MICROSERVICE) {
            this.beApps.push(this.app.baseName);
        }
    }

    this.writeFile('HOW_TO_RUN.md.ejs', '../HOW_TO_RUN.md');
}