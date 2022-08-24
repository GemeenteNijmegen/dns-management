import { App, Aspects, Stack } from 'aws-cdk-lib';
import { Annotations, Match } from 'aws-cdk-lib/assertions';
import { AwsSolutionsChecks } from 'cdk-nag';
import { DnsRootStack } from '../src/DnsRootStack';
import { DnsSecStack } from '../src/DnsSecStack';
import { DnsStack } from '../src/DnsStack';

const env = {
  account: '123',
  region: 'eu-west-1',
};

test('Snapshot', () => {

  const app = new App();

  const dnsstack = new DnsStack(app, 'dns-stack', {
    dnsRootAccount: env.account,
    registerInCspNijmegenRoot: true,
    rootZoneName: 'csp-nijmegen.nl',
    subzoneName: 'dnsstack',
  });

  const dnssecstack = new DnsSecStack(app, 'dnssec-stack', {
    enableDnsSec: true,
  });

  const dnsRoot = new DnsRootStack(app, 'dnsroot-stack');

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

  expect(warnings).toHaveLength(0);
  expect(errors).toHaveLength(0);
}