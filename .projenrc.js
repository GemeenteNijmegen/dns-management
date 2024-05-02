const { awscdk } = require('projen');
const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.20.0',
  name: 'dns-management',
  license: 'EUPL-1.2',
  release: true,
  defaultReleaseBranch: 'production',
  majorVersion: 1,
  depsUpgradeOptions: {
    workflowOptions: {
      branches: ['production'],
    },
  },
  scripts: {
    lint: 'cfn-lint cdk.out/**/*.template.json -i W3005 W2001',
  },
  deps: [
    'cdk-nag@^2.0.0',
    'cdk-remote-stack',
    '@gemeentenijmegen/aws-constructs',
    '@gemeentenijmegen/dnssec-record',
  ],
  gitignore: [
    'test-reports/junit.xml',
    'test/__snapshots__/*',
    '.env',
    '.vscode',
    '.DS_Store',
  ],
  workflowBootstrapSteps: [
    {
      name: 'Setup cfn-lint',
      uses: 'scottbrenner/cfn-lint-action@v2',
    },
  ],
  postBuildSteps: [
    {
      name: 'cfn-lint',
      run: 'npx projen lint',
    },
  ],
  context: {
    // Do not include lates sdk version in lambdas (https://github.com/aws/aws-cdk/pull/23591)
    '@aws-cdk/customresources:installLatestAwsSdkDefault': false,
  },
});

project.synth();