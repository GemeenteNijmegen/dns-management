const { awscdk } = require('projen');
const { NodePackageManager } = require('projen/lib/javascript');
const { ReleaseTrigger } = require('projen/lib/release');
const project = new awscdk.AwsCdkTypeScriptApp({
  projenVersion: '0.54.14',
  cdkVersion: '2.17.0',
  name: 'dns-management',
  license: 'EUPL-1.2',
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