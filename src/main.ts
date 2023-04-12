import { App } from 'aws-cdk-lib';
import { getConfiguration } from './Configuration';
import { PipelineStack } from './PipelineStack';

// Get configuration
const buildBranch = process.env.BRANCH_NAME ?? 'production';
console.log('Building branch', buildBranch);
const configuration = getConfiguration(buildBranch);

// Build the CDK app
const app = new App();
new PipelineStack(app, 'dns-management-pipeline', {
  env: configuration.deploymentEnvironment,
  configuration: configuration,
});
app.synth();
