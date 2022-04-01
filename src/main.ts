import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

// Usefull cdk issue about cross account zone delegation
// https://github.com/aws/aws-cdk/issues/8776

// const sandboxEnvironment = {
//   account: '122467643252',
//   region: 'eu-west-1',
// };

// const productionEnvironment = {
//   account: '196212984627',
//   region: 'eu-west-1',
// };

const app = new App();

// new CspManagmentStage(app, 'csp-managment-stage', {
//   subdomains: [
//     {
//       subdomain: 'sandbox',
//       delegationRole: undefined,
//       environment: sandboxEnvironment,
//     }
//   ],
//   cspNijmegenEnv: productionEnvironment,
// });

class MyStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
  }
}


new MyStack(app, 'test-stack');

app.synth();
