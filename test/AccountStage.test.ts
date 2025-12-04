import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { AccountStage } from '../src/AccountStage';

const dummyEnv = {
  account: '123456789012',
  region: 'eu-west-1',
};

const configuration = {
  branchName: 'test',
  codeStartConnectionArn: '',
  deploymentEnvironment: dummyEnv,
  toplevelHostedzoneEnvironment: dummyEnv,
  toplevelHostedzoneId: 'ABFSDGOIEJG2398725OASEGJ',
  toplevelHostedzoneName: 'csp-example.nl',
  subdomains: [
    {
      enableDnsSec: true,
      environment: dummyEnv,
      name: 'snapshot-subdomain',
      additionalRegions: ['us-east-1', 'eu-west-1'],
    },
  ],
};

test('Snapshot with actual dns configuration', () => {
  const app = new App();

  const stages: AccountStage[] = [];

  const stage = new AccountStage(app, 'snapshot-dns-management-test', {
    configuration,
    subdomainConfiguration: configuration.subdomains[0],
  });
  const stackIds = stage.node.children.map(c => (c.node as any).host.artifactId);
  stackIds.forEach(stackId => {
    const stackArtifact = app.synth().getStackArtifact(stackId);
    console.debug(stackArtifact.originalName, stackArtifact.environment);
  });

});
