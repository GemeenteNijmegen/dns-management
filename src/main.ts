import { App } from 'aws-cdk-lib';
import { PipelineStack } from './PipelineStack';
import { Statics } from './Statics';


const app = new App();

new PipelineStack(app, 'dns-management-pipeline', {
  env: Statics.deploymentEnvironment,
  branchName: 'production',
});

app.synth();
