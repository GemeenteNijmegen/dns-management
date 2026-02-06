import { GemeenteNijmegenCdkApp } from '@gemeentenijmegen/projen-project-type';
const project = new GemeenteNijmegenCdkApp({
  cdkVersion: '2.1.0',
  defaultReleaseBranch: 'main',
  devDeps: ['@gemeentenijmegen/projen-project-type'],
  name: 'dns-management',
  projenrcTs: true,
  depsUpgradeOptions: {
    workflowOptions: {
      branches: ['main'],
    },
  },
  deps: [
    'dotenv',
    'cdk-nag@^2.0.0',
    '@gemeentenijmegen/cross-region-parameters',
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
  jestOptions: {
    jestConfig: {
      setupFiles: ['dotenv/config'],
    },
  },
  tsconfig: {
    compilerOptions: {
      isolatedModules: true,
    },
  },
  enableAutoMergeDependencies: false, // No acceptance branch
});
project.synth();
