import { Stack, StackProps, Tags, pipelines } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AccountStage } from './AccountStage';
import { CspNijmegenStage } from './CspNijmegenStage';
import { DnsRootStage } from './DnsRootStage';
import { Statics } from './Statics';
import { TempAuthAccpStage } from './TempAuthAccpStage';
import { TempAuthProdStage } from './TempAuthProdStage';

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

    // Can be removed after the csp-nijmegen.nl zone is in use in the new dns account
    const cspStage = new CspNijmegenStage(this, 'dns-management-root', {
      env: Statics.authProdEnvironment,
      cspRootEnvironment: Statics.authProdEnvironment,
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

    // Enable after acceptanceStage deployDnsStack is set to true
    const tempAuthAccpStage = new TempAuthAccpStage(this, 'temp-dns-managment-auth-accp', {
      env: Statics.authAccpEnvironment,
    });

    // Keep mijn-nijmegen records in old csp-nijmegen.nl when moving the project to new csp-nijmege.nl hosted zone
    const tempAuthProdStage = new TempAuthProdStage(this, 'temp-dns-managment-auth-prod', {
      env: Statics.authProdEnvironment
    })

    // Setup the pipeline
    pipeline.addStage(cspStage);
    pipeline.addStage(dnsRoot);
    const wave = pipeline.addWave('accounts');
    wave.addStage(sandboxStage);
    wave.addStage(authAccpStage);
    wave.addStage(authProdStage);

    // Run as final only requires the authAcceptanceStage to be deployed first
    pipeline.addStage(tempAuthAccpStage);
    pipeline.addStage(tempAuthProdStage);


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