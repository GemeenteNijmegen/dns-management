import { App } from 'aws-cdk-lib';
import { PipelineStack } from './PipelineStack';

const deploymentEnvironment = {
  account: '418648875085',
  region: 'eu-west-1',
};

const sandboxEnvironment = {
  account: '122467643252',
  region: 'eu-west-1',
};

const productionEnvironment = {
  account: '196212984627',
  region: 'eu-west-1',
};

const app = new App();

new PipelineStack(app, 'dns-management-pipeline', {
  env: deploymentEnvironment,
  branchName: 'main',
  deployment: deploymentEnvironment,
  production: productionEnvironment,
  sandbox: sandboxEnvironment,
});

app.synth();
