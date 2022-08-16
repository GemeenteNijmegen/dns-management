import { Stack, StackProps, Tags, pipelines } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AccountStage } from './AccountStage';
import { CspNijmegenStage } from './CspNijmegenStage';
import { Statics } from './Statics';
import { TempAuthAccpStage } from './TempAuthAccpStage';

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

    const cspStage = new CspNijmegenStage(this, 'dns-management-root', {
      env: Statics.authProdEnvironment,
      cspRootEnvironment: Statics.authProdEnvironment,
    });

    // SANDBOX
    const sandboxStage = new AccountStage(this, 'dns-management-sandbox', {
      env: Statics.sandboxEnvironment,
      name: 'sandbox',
      dnsRootEnvironment: Statics.authProdEnvironment,
      deployDnsStack: true,
      enableDnsSec: false,
      deployDnsSecKmsKey: false,
      registerInCspNijmegenRoot: true,
    });

    // AUTH-ACCP
    const authAccpStage = new AccountStage(this, 'dns-management-acceptance', {
      env: Statics.authAccpEnvironment,
      name: 'accp',
      dnsRootEnvironment: Statics.authProdEnvironment,
      deployDnsStack: true, // accp.csp-nijmegen.nl is still managed in webformulieren (however we have a unregistered in csp-nijmegen.nl copy now)
      enableDnsSec: true,
      deployDnsSecKmsKey: true,
      registerInCspNijmegenRoot: false, // Can be enabled after other zone removed from webformulieren (Note that a policy in csp stack should be added before!)
    });

    // AUTH-PROD
    const authProdStage = new AccountStage(this, 'dns-management-auth-prod', {
      env: Statics.authProdEnvironment,
      name: 'auth-prod',
      dnsRootEnvironment: Statics.authProdEnvironment,
      deployDnsStack: true,
      enableDnsSec: true,
      deployDnsSecKmsKey: true,
      registerInCspNijmegenRoot: true,
    });

    // Enable after acceptanceStage deployDnsStack is set to true
    const tempAuthAccpStage = new TempAuthAccpStage(this, 'temp-dns-managment-auth-accp', {
      env: Statics.authAccpEnvironment,
    });

    // Setup the pipeline
    pipeline.addStage(cspStage);
    const wave = pipeline.addWave('accounts');
    wave.addStage(sandboxStage);
    wave.addStage(authAccpStage);
    wave.addStage(authProdStage);

    // Run as final only requires the authAcceptanceStage to be deployed first
    pipeline.addStage(tempAuthAccpStage);


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