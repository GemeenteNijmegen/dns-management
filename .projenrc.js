const { awscdk } = require('projen');
const { JobPermission } = require('projen/lib/github/workflows-model');

const project = new awscdk.AwsCdkTypeScriptApp({
  projenVersion: '0.54.36',
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
      name: 'Save CloudFormation templates',
      run: 'mkdir -p dist && tar -czvf ./dist/cdk.out.tar.gz ./cdk.out',
    },
    {
      name: 'cfn-lint',
      run: 'npx projen lint',
    },
  ],
});

/**
 * A job to build the base branch and execute a diff on the build cdk.out and base
 * branch cdk.out. A comment is added to the PR indicating if there are differences
 * in the CloudFormation templates.
 */
const comment = 'between CloudFormation templates on base branch and this branch.';
project.buildWorkflow.addPostBuildJob('cfn-diff', {
  permissions: {
    contents: JobPermission.READ,
    pullRequests: JobPermission.WRITE,
  },
  runsOn: ['ubuntu-latest'],
  steps: [
    {
      name: 'Keep build CloudFormation templates',
      run: [
        //'mkdir -p ../cdk.out.source',
        'tar -xzvf ./dist/cdk.out.tar.gz -C ../',
        'mv ../cdk.out ../cdk.out.source',
        //'mv ../cdk.out.source/cdk.out/* ../cdk.out.source/',
        //'rm ../cdk.out.source/cdk.out'
      ].join(' && '),
    },
    {
      name: 'Checkout',
      uses: 'actions/checkout@v2',
      with: {
        ref: '${{ github.base_ref }}',
        repository: '${{ github.event.pull_request.head.repo.full_name }}',
      },
    },
    {
      name: 'Setup cfn-lint',
      uses: 'scottbrenner/cfn-lint-action@v2',
    },
    {
      name: 'Install dependencies',
      run: 'yarn install --check-files',
    },
    {
      name: 'Build',
      run: 'yarn build',
    },
    {
      name: 'Prepare CloudFormation template directories',
      run: 'mv ../cdk.out.source cdk.out.source && mv cdk.out cdk.out.base',
    },
    {
      name: 'CloudFormation diff', // TODO: use cdk diff here.
      run: [
        'git diff --no-index --output diff.txt cdk.out.source cdk.out.base || true',
        'cat diff.txt',
        '[ -s diff.txt ] && msg="Differences" || msg="No differences"',
        'echo "Creating a comment on the PR..."',
        `gh pr comment $PR --body "$(echo $msg) ${comment} \n <details><pre>$(cat diff.txt)</pre></details>" -R $GITHUB_REPOSITORY`,
      ].join('; '),
      env: {
        GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}',
        GITHUB_REPOSITORY: '${{ github.repository }}',
        PR: '${{ github.event.pull_request.number }}',
      },
    },
  ],
});

project.synth();