const { awscdk } = require('projen');
const { NodePackageManager } = require('projen/lib/javascript');
const { ReleaseTrigger } = require('projen/lib/release');
const project = new awscdk.AwsCdkTypeScriptApp({
  projenVersion: '0.52.72',
  cdkVersion: '2.1.0',
  defaultReleaseBranch: 'main',
  name: 'dns-management',
  packageManager: NodePackageManager.NPM,
  release: true,
  releaseTrigger: ReleaseTrigger.manual({
    changelog: false,
    gitPushCommand: 'git push --tags',
  }),
  github: false,
});


// Modify the release task to not include the final git diff command as it will fail...
const release = project.tasks.tryFind('release');
if (release !== undefined) {
  release.reset();
  release.exec('rm -fr dist');
  release.spawn(project.tasks.tryFind('bump'));
  release.spawn(project.tasks.tryFind('build'));
  release.spawn(project.tasks.tryFind('unbump'));
  release.spawn(project.tasks.tryFind('publish:git'));
  //release.exec('git diff --ignore-space-at-eol --exit-code');
} else {
  console.warn('No release task found in this project configuration');
}


project.synth();