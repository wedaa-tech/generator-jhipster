/* eslint-disable prettier/prettier */
import { SERVER_MAIN_SRC_DIR, SERVER_TEST_SRC_DIR } from '../generator-constants.mjs';
import { communications } from '../server/server-base.mjs';
import messageBrokerTypes from '../../jdl/jhipster/message-broker-types.js';
import { REST_API_MAIN_DIR, REST_API_TEST_DIR, RABBITMQ_MAIN_DIR, RABBITMQ_TEST_DIR, REST_API } from './communications-constants.mjs';

const { RABBITMQ, KAFKA, PULSAR } = messageBrokerTypes;

export default async function writeCommunicationsFilesTask({ application }) {
  // Write client files
  Object.assign(this, application);

  if (this.communicationsFrameworkRabbitMQ) {
    this.fs.copyTpl(
      this.templatePath(`${RABBITMQ_MAIN_DIR}/java/package/domain/RabbitMessageModel.java.ejs`),
      this.destinationPath(`${SERVER_MAIN_SRC_DIR}`.concat(this.jhipsterConfig.packageFolder).concat('/domain/RabbitMessageModel.java')),
      {
        packageName: this.jhipsterConfig.packageName,
      }
    );
  }

  if (this.communicationsFrameworkRestAPI) {
    let communicationServersForBaseApp = [];
    communications.forEach(comm =>{
      if(comm.client === this.jhipsterConfig.baseName){
        communicationServersForBaseApp.push(comm.server);
      }
    })
    let appConfigs = this.appConfigs;
    let isOauth2EnabledForAlestOneServer = false;
    appConfigs.forEach(config => {
      if (communicationServersForBaseApp.includes(config.baseName) && config.authenticationType === 'oauth2') {
        isOauth2EnabledForAlestOneServer = true;
      }
    });
    if(isOauth2EnabledForAlestOneServer){
      this.fs.copyTpl(
        this.templatePath(`${REST_API_MAIN_DIR}/java/package/config/webClient/AccessToken.java.ejs`),
        this.destinationPath(`${SERVER_MAIN_SRC_DIR}`.concat(this.jhipsterConfig.packageFolder).concat('/config/webClient/AccessToken.java')),
        {
          packageName: this.jhipsterConfig.packageName,
          authenticationTypeOauth2: this.jhipsterConfig.authenticationType == 'oauth2',
          serviceDiscoveryEureka: this.serviceDiscoveryEureka
        }
      );
    }

    this.fs.copyTpl(
      this.templatePath(`${REST_API_MAIN_DIR}/java/package/config/webClient/WebClientConfig.java.ejs`),
      this.destinationPath(
        `${SERVER_MAIN_SRC_DIR}`.concat(this.jhipsterConfig.packageFolder).concat('/config/webClient/WebClientConfig.java')
      ),
      {
        packageName: this.jhipsterConfig.packageName,
        authenticationTypeOauth2: this.jhipsterConfig.authenticationType == 'oauth2',
        serviceDiscoveryEureka: this.serviceDiscoveryEureka
      }
    );
  }

  for (let i = 0; i < communications.length; i++) {
    if (this.jhipsterConfig.baseName === communications[i].client) {
      if (communications[i].framework === RABBITMQ) {
        const capitalizeServerName = communications[i].server.charAt(0).toUpperCase() + communications[i].server.slice(1);
        const capitalizeClientName = communications[i].client.charAt(0).toUpperCase() + communications[i].client.slice(1);
        const queueName = capitalizeServerName.concat('To').concat(capitalizeClientName);
        this.fs.copyTpl(
          this.templatePath(`${RABBITMQ_MAIN_DIR}/java/package/consumer/RabbitMQConsumer.java.ejs`),
          this.destinationPath(
            `${SERVER_MAIN_SRC_DIR}`
              .concat(this.jhipsterConfig.packageFolder)
              .concat('/config/rabbitMQ/RabbitMQConsumer'.concat(queueName).concat('.java'))
          ),
          {
            packageName: this.jhipsterConfig.packageName,
            queueName,
            uniqueName: queueName,
            serverName: communications[i].server,
          }
        );
        this.fs.copyTpl(
          this.templatePath(`${RABBITMQ_MAIN_DIR}/java/package/config/RabbitMQConfig.java.ejs`),
          this.destinationPath(
            `${SERVER_MAIN_SRC_DIR}`
              .concat(this.jhipsterConfig.packageFolder)
              .concat('/config/RabbitMQConfig'.concat(queueName).concat('.java'))
          ),
          {
            packageName: this.jhipsterConfig.packageName,
            queueName,
            uniqueName: queueName,
            serverName: communications[i].server,
          }
        );
      }

      if (communications[i].framework === REST_API) {
        let serverName = communications[i].server.toLowerCase();
        let appConfigs = this.appConfigs;
        let isEurekaEnabledForServer = false;
        let isOauth2EnabledForServer = false;
        // Iterate through the appConfigs list
        appConfigs.forEach(config => {
          if (config.baseName === serverName && config.serviceDiscoveryType === 'eureka' && this.serviceDiscoveryEureka) {
            isEurekaEnabledForServer = true;
          }
          if (config.baseName === serverName && config.authenticationType === 'oauth2') {
            isOauth2EnabledForServer = true;
          }
        });
        const capitalizeServerName = communications[i].server.charAt(0).toUpperCase() + communications[i].server.slice(1);
        if (isEurekaEnabledForServer) {
          this.fs.copyTpl(
            this.templatePath(`${REST_API_MAIN_DIR}/java/package/web/rest/ClientResource_eureka.java.ejs`),
            this.destinationPath(
              `${SERVER_MAIN_SRC_DIR}`
                .concat(this.jhipsterConfig.packageFolder)
                .concat('/web/rest/comm/ClientResource'.concat(capitalizeServerName).concat('.java'))
            ),
            {
              packageName: this.jhipsterConfig.packageName,
              capitalizeServerName,
              serverName: communications[i].server.toLowerCase(),
              authenticationTypeOauth2: isOauth2EnabledForServer,
              serviceDiscoveryEureka: this.serviceDiscoveryEureka
            }
          );
          this.fs.copyTpl(
            this.templatePath(`${REST_API_TEST_DIR}/java/package/web/rest/ClientResourceUT_eureka.java.ejs`),
            this.destinationPath(
              `${SERVER_TEST_SRC_DIR}`
                .concat(this.jhipsterConfig.packageFolder)
                .concat('/web/rest/comm/ClientResource'.concat(capitalizeServerName).concat('UT').concat('.java'))
            ),
            {
              packageName: this.jhipsterConfig.packageName,
              capitalizeServerName,
              serverName: communications[i].server.toLowerCase(),
              authenticationTypeOauth2: isOauth2EnabledForServer,
              serviceDiscoveryEureka: this.serviceDiscoveryEureka
            }
          );
        } else {
          this.fs.copyTpl(
            this.templatePath(`${REST_API_MAIN_DIR}/java/package/web/rest/ClientResource.java.ejs`),
            this.destinationPath(
              `${SERVER_MAIN_SRC_DIR}`
                .concat(this.jhipsterConfig.packageFolder)
                .concat('/web/rest/comm/ClientResource'.concat(capitalizeServerName).concat('.java'))
            ),
            {
              packageName: this.jhipsterConfig.packageName,
              capitalizeServerName,
              serverName: communications[i].server.toLowerCase(),
              authenticationTypeOauth2: isOauth2EnabledForServer,
              serviceDiscoveryEureka: this.serviceDiscoveryEureka
            }
          );
          this.fs.copyTpl(
            this.templatePath(`${REST_API_TEST_DIR}/java/package/web/rest/ClientResourceUT.java.ejs`),
            this.destinationPath(
              `${SERVER_TEST_SRC_DIR}`
                .concat(this.jhipsterConfig.packageFolder)
                .concat('/web/rest/comm/ClientResource'.concat(capitalizeServerName).concat('UT').concat('.java'))
            ),
            {
              packageName: this.jhipsterConfig.packageName,
              capitalizeServerName,
              serverName: communications[i].server.toLowerCase(),
              authenticationTypeOauth2: isOauth2EnabledForServer,
              serviceDiscoveryEureka: this.serviceDiscoveryEureka
            }
          );
        }
      }
    }

    if (this.jhipsterConfig.baseName === communications[i].server) {
      if (communications[i].framework === RABBITMQ) {
        const capitalizeServerName = communications[i].server.charAt(0).toUpperCase() + communications[i].server.slice(1);
        const capitalizeClientName = communications[i].client.charAt(0).toUpperCase() + communications[i].client.slice(1);
        const queueName = capitalizeServerName.concat('To').concat(capitalizeClientName);
        this.fs.copyTpl(
          this.templatePath(`${RABBITMQ_MAIN_DIR}/java/package/config/RabbitMQConfig.java.ejs`),
          this.destinationPath(
            `${SERVER_MAIN_SRC_DIR}`
              .concat(this.jhipsterConfig.packageFolder)
              .concat('/config/RabbitMQConfig'.concat(queueName).concat('.java'))
          ),
          {
            packageName: this.jhipsterConfig.packageName,
            queueName,
            uniqueName: queueName,
            serverName: communications[i].server,
          }
        );
        this.fs.copyTpl(
          this.templatePath(`${RABBITMQ_MAIN_DIR}/java/package/producer/RabbitMQProducer.java.ejs`),
          this.destinationPath(
            `${SERVER_MAIN_SRC_DIR}`
              .concat(this.jhipsterConfig.packageFolder)
              .concat('/config/rabbitMQ/RabbitMQProducer'.concat(queueName).concat('.java'))
          ),
          {
            packageName: this.jhipsterConfig.packageName,
            queueName,
            uniqueName: queueName,
            baseName: this.jhipsterConfig.baseName,
            serverName: communications[i].server,
          }
        );
      }

      if (communications[i].framework === REST_API) {
        this.fs.copyTpl(
          this.templatePath(`${REST_API_TEST_DIR}/java/package/web/rest/ServerResourceUT.java.ejs`),
          this.destinationPath(
            `${SERVER_TEST_SRC_DIR}`.concat(this.jhipsterConfig.packageFolder).concat('/web/rest/comm/ServerResourceUT.java')
          ),
          {
            packageName: this.jhipsterConfig.packageName,
            serverName: communications[i].server.toLowerCase(),
            authenticationTypeOauth2: this.jhipsterConfig.authenticationType == 'oauth2',
            serviceDiscoveryEureka: this.serviceDiscoveryEureka
          }
        );
        this.fs.copyTpl(
          this.templatePath(`${REST_API_MAIN_DIR}/java/package/web/rest/ServerResource.java.ejs`),
          this.destinationPath(
            `${SERVER_MAIN_SRC_DIR}`.concat(this.jhipsterConfig.packageFolder).concat('/web/rest/comm/ServerResource.java')
          ),
          {
            packageName: this.jhipsterConfig.packageName,
            serverName: communications[i].server.toLowerCase(),
            authenticationTypeOauth2: this.jhipsterConfig.authenticationType == 'oauth2',
            serviceDiscoveryEureka: this.serviceDiscoveryEureka,
          }
        );
      }
    }
  }
}
