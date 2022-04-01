import { App } from 'aws-cdk-lib';
import { CspZoneIamPolicyStack } from './CspZoneIamPolicyStack';
import { SubzoneStack } from './SubzoneStack';

// Usefull cdk issue about cross account zone delegation used as a basis for this cdk code
// https://github.com/aws/aws-cdk/issues/8776

const sandboxEnvironment = {
  account: '122467643252',
  region: 'eu-west-1',
};

const productionEnvironment = {
  account: '196212984627',
  region: 'eu-west-1',
};

const app = new App();

new CspZoneIamPolicyStack(app, 'csp-dns-iam-policy-stack', {
  env: productionEnvironment, // Lives in the production environment as does the csp-nijmegen.nl hosted zone for which we want to delegate
  sandbox: sandboxEnvironment,
});

new SubzoneStack(app, 'sandbox-csp-nijmegen-stack', {
  env: sandboxEnvironment,
  productionAccount: productionEnvironment.account,
  rootZoneName: 'csp-nijmegen.nl',
  subzoneName: 'sandbox',
});

app.synth();
