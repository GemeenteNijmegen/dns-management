import { Stack, StackProps, Tags, pipelines } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AccountStage } from './AccountStage';
import { AuthAccpStage } from './AuthAccpStage';
import { DnsRootStage } from './DnsRootStage';
import { Statics } from './Statics';

export interface PipelineStackProps extends StackProps {
  branchName: string;
}

export class PipelineStack extends Stack {

  branchName: string;

  constructor(scope: Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);

    this.branchName = props.branchName;

    Tags.of(this).add('cdkManaged', 'yes');
    Tags.of(this).add('Project', Statics.projectName);

    const pipeline = this.pipeline();

    // DNS root account
    const dnsRoot = new DnsRootStage(this, 'dns-management', {
      env: Statics.dnsRootEnvironment,
      dnsRootAccount: Statics.dnsRootEnvironment,
    });

    // SANDBOX
    const sandboxStage = new AccountStage(this, 'dns-management-sandbox', {
      env: Statics.sandboxEnvironment,
      name: 'sandbox',
      dnsRootEnvironment: Statics.dnsRootEnvironment,
      deployDnsStack: true,
      enableDnsSec: false,
      deployDnsSecKmsKey: false,
      registerInCspNijmegenRoot: true,
    });

    // AUTH-ACCP
    const authAccpStage = new AccountStage(this, 'dns-management-acceptance', {
      env: Statics.authAccpEnvironment,
      name: 'accp',
      dnsRootEnvironment: Statics.dnsRootEnvironment,
      deployDnsStack: true,
      enableDnsSec: true,
      deployDnsSecKmsKey: true,
      registerInCspNijmegenRoot: true,
    });

    // AUTH-PROD
    const authProdStage = new AccountStage(this, 'dns-management-auth-prod', {
      env: Statics.authProdEnvironment,
      name: 'auth-prod',
      dnsRootEnvironment: Statics.dnsRootEnvironment,
      deployDnsStack: true,
      enableDnsSec: true,
      deployDnsSecKmsKey: true,
      registerInCspNijmegenRoot: true,
    });

    // GENERIEK-ACCP
    const generiekAccpStage = new AccountStage(this, 'dns-management-genriek-accp', {
      env: Statics.generiekAccpEnvironment,
      name: 'generiek-accp',
      dnsRootEnvironment: Statics.dnsRootEnvironment,
      deployDnsStack: true,
      enableDnsSec: false,
      deployDnsSecKmsKey: false,
      registerInCspNijmegenRoot: true,
    });

    // GENERIEK-PROD
    const generiekProdStage = new AccountStage(this, 'dns-management-genriek-prod', {
      env: Statics.generiekProdEnvironment,
      name: 'generiek-prod',
      dnsRootEnvironment: Statics.dnsRootEnvironment,
      deployDnsStack: true,
      enableDnsSec: false,
      deployDnsSecKmsKey: false,
      registerInCspNijmegenRoot: true,
    });

    // TEST-2 (upgrade webformulieren)
    const test2Stage = new AccountStage(this, 'dns-management-test-2', {
      env: Statics.test2Environment,
      name: 'test-2',
      dnsRootEnvironment: Statics.dnsRootEnvironment,
      deployDnsStack: true,
      enableDnsSec: true,
      deployDnsSecKmsKey: true,
      registerInCspNijmegenRoot: true,
    });

    // TEST-3 (upgrade webformulieren)
    const test3Stage = new AccountStage(this, 'dns-management-test-3', {
      env: Statics.test3Environment,
      name: 'test-3',
      dnsRootEnvironment: Statics.dnsRootEnvironment,
      deployDnsStack: true,
      enableDnsSec: true,
      deployDnsSecKmsKey: true,
      registerInCspNijmegenRoot: true,
    });

    // TEST-4 (upgrade webformulieren)
    const test4Stage = new AccountStage(this, 'dns-management-test-4', {
      env: Statics.test4Environment,
      name: 'test-4',
      dnsRootEnvironment: Statics.dnsRootEnvironment,
      deployDnsStack: true,
      enableDnsSec: true,
      deployDnsSecKmsKey: true,
      registerInCspNijmegenRoot: true,
    });

    const authAccpRecordStage = new AuthAccpStage(this, 'dns-management-acceptance-records', {
      env: Statics.authAccpEnvironment,
    });

    // Setup the pipeline
    pipeline.addStage(dnsRoot);
    const wave = pipeline.addWave('accounts');
    wave.addStage(sandboxStage);
    wave.addStage(authAccpStage);
    wave.addStage(authProdStage);
    wave.addStage(generiekAccpStage);
    wave.addStage(generiekProdStage);
    wave.addStage(test2Stage);
    wave.addStage(test3Stage);
    wave.addStage(test4Stage);

    // Set mail records in accp.csp-nijmegen.nl
    pipeline.addStage(authAccpRecordStage);

  }

  pipeline(): pipelines.CodePipeline {

    const source = pipelines.CodePipelineSource.connection('GemeenteNijmegen/dns-management', this.branchName, {
      connectionArn: Statics.codeStarConnectionArn,
    });

    const pipeline = new pipelines.CodePipeline(this, `dns-management-${this.branchName}`, {
      pipelineName: `dns-management-${this.branchName}`,
      dockerEnabledForSelfMutation: true,
      dockerEnabledForSynth: true,
      crossAccountKeys: true,
      synth: new pipelines.ShellStep('Synth', {
        input: source,
        env: {
          BRANCH_NAME: this.branchName,
        },
        commands: [
          'yarn install --frozen-lockfile',
          'yarn build',
        ],
      }),
    });
    return pipeline;
  }
}