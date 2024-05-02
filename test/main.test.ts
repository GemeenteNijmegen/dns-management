import { App, Aspects, Stack } from 'aws-cdk-lib';
import { Annotations, Match } from 'aws-cdk-lib/assertions';
import { AwsSolutionsChecks } from 'cdk-nag';
import { Node } from 'constructs';
import { AccountStage } from '../src/AccountStage';
import { getConfiguration } from '../src/Configuration';
import { DnsRootStack } from '../src/DnsRootStack';
import { DnsSecStack } from '../src/DnsSecStack';
import { DnsStack } from '../src/DnsStack';
import { PipelineStack } from '../src/PipelineStack';

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
    },
  ],
};

test('Snapshot', () => {


  const app = new App();

  const dnsstack = new DnsStack(app, 'dns-stack', {
    configuration,
    subdomainConfiguration: configuration.subdomains[0],
  });

  const dnssecstack = new DnsSecStack(app, 'dnssec-stack', {
    configuration,
    subdomainConfiguration: configuration.subdomains[0],
  });

  const dnsRoot = new DnsRootStack(app, 'dnsroot-stack', {
    configuration,
  });

  // Nag
  Aspects.of(dnsstack).add(new AwsSolutionsChecks({ verbose: true }));
  Aspects.of(dnssecstack).add(new AwsSolutionsChecks({ verbose: true }));
  Aspects.of(dnsRoot).add(new AwsSolutionsChecks({ verbose: true }));

  checkNagStack(dnsstack);
  checkNagStack(dnssecstack);
  checkNagStack(dnsRoot);

  // Snapshot
  expect(app.synth().getStackArtifact(dnsstack.artifactId).template).toMatchSnapshot();
  expect(app.synth().getStackArtifact(dnssecstack.artifactId).template).toMatchSnapshot();
  expect(app.synth().getStackArtifact(dnsRoot.artifactId).template).toMatchSnapshot();

});

function checkNagStack(stack: Stack) {
  const warnings = Annotations.fromStack(stack).findWarning('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  const errors = Annotations.fromStack(stack).findError('*', Match.stringLikeRegexp('AwsSolutions-.*'));

  const ws = warnings.map(w => {
    return {
      msg: w.entry.data,
      id: w.id,
    };
  });
  const es = errors.map(e => {
    return {
      msg: e.entry.data,
      id: e.id,
    };
  });

  if (ws && ws.length > 0) {
    console.warn('Warnings in stack ', stack.stackName);
    console.warn(JSON.stringify(ws, null, 4));
  }
  if (es && es.length > 0) {
    console.error('Errors in stack ', stack.stackName);
    console.error(JSON.stringify(es, null, 4));
  }

  // expect(warnings).toHaveLength(0);
  // expect(errors).toHaveLength(0);
}


test('Snapshot pipeline', () => {
  const app = new App();
  const pipeline = new PipelineStack(app, 'snapshot-pipeline', {
    env: dummyEnv,
    configuration,
  });
  expect(app.synth().getStackArtifact(pipeline.artifactId).template).toMatchSnapshot();

});


test('Snapshot with actual dns configuration', () => {
  const app = new App();

  const stages: AccountStage[] = [];

  const realConfig = getConfiguration('main');

  realConfig.subdomains.forEach(subdomainConfiguration => {
    const stageName = subdomainConfiguration.name;
    const stage = new AccountStage(app, `snapshot-dns-management-${stageName}`, {
      configuration: realConfig,
      subdomainConfiguration: subdomainConfiguration,
    });
    stages.push(stage);
  });

  stages.forEach(stage => checkStackSnapshotsInStage(app, stage.node));

});

function checkStackSnapshotsInStage(app: App, node: Node) {
  const stackIds = node.children.map(c => (c.node as any).host.artifactId);
  stackIds.forEach(stackId => {
    expect(app.synth().getStackArtifact(stackId).template).toMatchSnapshot();
  });
}