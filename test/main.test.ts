import { App } from 'aws-cdk-lib';
import { AccountStage } from '../src/AccountStage';

test('CFN-NAG', () => {

  const app = new App();

  new AccountStage(app, 'dns-management-auth-accp', {
    env: {
      account: '1234',
      region: 'eu-west-1',
    },
    name: 'accp',
    cspRootEnvironment: {
      account: '1234',
      region: 'eu-west-1',
    },
    deployDnsStack: true,
    deployDnsSecKmsKey: true,
    useSecondaryParameters: false,
  });

  // const cspStage = new CspNijmegenStage(app, 'dns-management-root', {
  //   env: props.production,
  //   cspRootEnvironment: props.production,
  //   sandbox: props.sandbox,
  // });

  // Enable cfn-nag
  //  Aspects.of(cspStage).add(new AwsSolutionsChecks({ verbose: true }));
  //  Aspects.of(sandboxStage).add(new AwsSolutionsChecks({ verbose: true }));
  //  Aspects.of(acceptanceStage).add(new AwsSolutionsChecks({ verbose: true }));


});