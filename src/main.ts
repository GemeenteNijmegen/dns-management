import { App } from 'aws-cdk-lib';
import { CspSubzoneStack } from './CspSubzoneStack';

// Sandobx
const sandboxEnvironment = {
  account: '122467643252',
  region: 'eu-west-1',
};

// Auth-accp
//  TODO Uit eforms project halen

// Auth-prod
//  TODO Uit eforms project halen

// Others accounts?
//  Developer sepecific accounts?

const app = new App();

// Creates the sandbox.csp-nijmegen.nl
new CspSubzoneStack(app, 'sandbox-dns-stack', { 
  env: sandboxEnvironment,
  subzoneName: 'sandbox',
});

app.synth();