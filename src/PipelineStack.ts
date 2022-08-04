import { Stack, StackProps, Tags, pipelines, Environment } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AccountStage } from './AccountStage';
import { CspNijmegenStage } from './CspNijmegenStage';
import { Statics } from './Statics';
import { TempAuthAccpStage } from './TempAuthAccpStage';

export interface PipelineStackProps extends StackProps {
  branchName: string;
  deployment: Environment;
  production: Environment;
  acceptance: Environment;
  sandbox: Environment;
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
      env: props.production,
      cspRootEnvironment: props.production,
      sandbox: props.sandbox,
    });

    const sandboxStage = new AccountStage(this, 'dns-management-sandbox', {
      env: props.sandbox,
      name: 'sandbox',
      cspRootEnvironment: props.production,
      deployDnsStack: true,
      deployDnsSecKmsKey: false,
      useSecondaryParameters: false,
    });

    // Should be removed after deploying new account stage below for auth-accp
    const acceptanceStage = new AccountStage(this, 'dns-management-acceptance', { // TODO: Remove
      env: props.acceptance,
      name: 'accp',
      cspRootEnvironment: props.production,
      deployDnsStack: false, // accp.csp-nijmegen.nl is still managed in webformulieren
      deployDnsSecKmsKey: true,
      useSecondaryParameters: false,
    });

    const authAcceptanceStage = new AccountStage(this, 'dns-management-auth-accp', {
      env: props.acceptance,
      name: 'accp',
      cspRootEnvironment: props.production,
      deployDnsStack: true, //accp.csp-nijmegen.nl
      deployDnsSecKmsKey: true,
      useSecondaryParameters: true,
    });

    const tempAuthAccpStage = new TempAuthAccpStage(this, 'temp-dns-managment-auth-accp');

    // Setup the pipeline
    pipeline.addStage(cspStage);
    const wave = pipeline.addWave('accounts');
    wave.addStage(sandboxStage);
    wave.addStage(acceptanceStage); // TODO: Remove later
    wave.addStage(authAcceptanceStage);
    wave.addStage(tempAuthAccpStage);


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