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
  // devDeps: [
  //   'semantic-relsease@19.0.2',
  // ],
  github: false,
  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();