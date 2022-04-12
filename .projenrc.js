const { awscdk } = require('projen');
const { NodePackageManager } = require('projen/lib/javascript');
const { ReleaseTrigger } = require('projen/lib/release');
const project = new awscdk.AwsCdkTypeScriptApp({
  projenVersion: '0.54.14',
  cdkVersion: '2.1.0',
  name: 'dns-management',
  license: 'EUPL-1.2',
  packageManager: NodePackageManager.NPM,
  release: true,
  defaultReleaseBranch: 'production',
  majorVersion: 1,
  depsUpgradeOptions: {
    workflowOptions: {
      branches: ['acceptance'],
    },
  },
});


project.synth();