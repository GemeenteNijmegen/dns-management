import { App } from 'aws-cdk-lib';
import { CspManagmentStage } from './CspManagementStage';

// Usefull cdk issue about cross account zone delegation
// https://github.com/aws/aws-cdk/issues/8776

const sandboxEnvironment = {
  account: '122467643252',
  region: 'eu-west-1',
};

const productionEnvironment = {
  account: '196212984627',
  region: 'eu-west-1',
};

const app = new App();

new CspManagmentStage(app, 'csp-managment-stage', {
  subdomains: [
    {
      subdomain: 'sandbox',
      delegationRole: undefined,
      environment: sandboxEnvironment,
    }
  ],
  cspNijmegenEnv: productionEnvironment,
});

app.synth();