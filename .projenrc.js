const { awscdk } = require('projen');
const { NodePackageManager } = require('projen/lib/javascript');
const { ReleaseTrigger } = require('projen/lib/release');
const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.1.0',
  defaultReleaseBranch: 'main',
  name: 'dns-management',
  packageManager: NodePackageManager.NPM,
  release: true,
  releaseTrigger: ReleaseTrigger.manual({
    changelog: false,
    gitPushCommand: '',
  }),
  github: false,
});
project.synth();