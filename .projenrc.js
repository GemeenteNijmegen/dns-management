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
    '@alma-cdk/cross-region-parameter',
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
});

/**
 * Add cfn-lint step to build after compiling.
 */
// const postCompile = project.tasks.tryFind('post-compile');
// const lint = project.tasks.tryFind('lint');
// postCompile.spawn(lint);

project.synth();