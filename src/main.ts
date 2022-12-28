import { App } from 'aws-cdk-lib';
import { DnsConfiguration } from './DnsConfiguration';
import { PipelineStack } from './PipelineStack';
import { Statics } from './Statics';

const app = new App();

new PipelineStack(app, 'dns-management-pipeline', {
  env: Statics.deploymentEnvironment,
  branchName: 'production',
  dnsConfiguration: DnsConfiguration,
});

app.synth();
