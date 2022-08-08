import { App, Aspects } from 'aws-cdk-lib';
import { AwsSolutionsChecks } from 'cdk-nag';
import { CspNijmegenStack } from '../src/CspNijmegenStack';
import { DnsSecStack } from '../src/DnsSecStack';
import { DnsStack } from '../src/DnsStack';


const env = {
  account: '123',
  region: 'eu-west-1',
};

test('Snapshot', () => {

  const app = new App();


  const dnsstack = new DnsStack(app, 'dns-stack', {
    productionAccount: env.account,
    registerInCspNijmegenRoot: true,
    rootZoneName: 'csp-nijmegen.nl',
    subzoneName: 'dnsstack',
  });

  const dnssecstack = new DnsSecStack(app, 'dnssec-stack', {

  });

  const cspStack = new CspNijmegenStack(app, 'csp-stack', {
    env: env,
    sandbox: env,
  });

  // Nag
  Aspects.of(dnsstack).add(new AwsSolutionsChecks({ verbose: true }));
  Aspects.of(dnssecstack).add(new AwsSolutionsChecks({ verbose: true }));
  Aspects.of(cspStack).add(new AwsSolutionsChecks({ verbose: true }));

  // Snapshot
  expect(app.synth().getStackArtifact(dnsstack.artifactId).template).toMatchSnapshot();
  expect(app.synth().getStackArtifact(dnssecstack.artifactId).template).toMatchSnapshot();
  expect(app.synth().getStackArtifact(cspStack.artifactId).template).toMatchSnapshot();

});