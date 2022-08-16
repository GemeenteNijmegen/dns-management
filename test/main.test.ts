import { App, Aspects } from 'aws-cdk-lib';
import { AwsSolutionsChecks } from 'cdk-nag';
import { CspNijmegenStack } from '../src/CspNijmegenStack';
import { DnsSecStack } from '../src/DnsSecStack';
import { DnsStack } from '../src/DnsStack';
import { PipelineStack } from '../src/PipelineStack';

const env = {
  account: '123',
  region: 'eu-west-1',
};

test('Snapshot', () => {

  const app = new App();

  const pipeline = new PipelineStack(app, 'pipeline-stack', {
    env,
    branchName: 'production',
  });

  const dnsstack = new DnsStack(app, 'dns-stack', {
    dnsRootAccount: env.account,
    registerInCspNijmegenRoot: true,
    rootZoneName: 'csp-nijmegen.nl',
    subzoneName: 'dnsstack',
  });

  const dnssecstack = new DnsSecStack(app, 'dnssec-stack', {
    enableDnsSec: true,
  });

  const cspStack = new CspNijmegenStack(app, 'csp-stack', {
    env: env,
  });

  // Nag
  Aspects.of(pipeline).add(new AwsSolutionsChecks({ verbose: true }));
  Aspects.of(dnsstack).add(new AwsSolutionsChecks({ verbose: true }));
  Aspects.of(dnssecstack).add(new AwsSolutionsChecks({ verbose: true }));
  Aspects.of(cspStack).add(new AwsSolutionsChecks({ verbose: true }));

  // Snapshot
  expect(app.synth().getStackArtifact(pipeline.artifactId).template).toMatchSnapshot();
  expect(app.synth().getStackArtifact(dnsstack.artifactId).template).toMatchSnapshot();
  expect(app.synth().getStackArtifact(dnssecstack.artifactId).template).toMatchSnapshot();
  expect(app.synth().getStackArtifact(cspStack.artifactId).template).toMatchSnapshot();

});