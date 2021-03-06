import { Stack, StackProps, Tags, pipelines, Environment, Aspects } from 'aws-cdk-lib';
import { AwsSolutionsChecks } from 'cdk-nag';
import { Construct } from 'constructs';
import { AccountStage } from './AccountStage';
import { CspNijmegenStage } from './CspNijmegenStage';
import { Statics } from './Statics';

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
    });

    const acceptanceStage = new AccountStage(this, 'dns-management-acceptance', {
      env: props.acceptance,
      name: 'accp',
      cspRootEnvironment: props.production,
      deployDnsStack: false, // accp.csp-nijmegen.nl is still managed in webformulieren
      deployDnsSecKmsKey: true,
    });

    // Setup the pipeline
    pipeline.addStage(cspStage);
    const wave = pipeline.addWave('accounts');
    wave.addStage(sandboxStage);
    wave.addStage(acceptanceStage);

    // Enable cfn-nag
    Aspects.of(cspStage).add(new AwsSolutionsChecks({ verbose: true }));
    Aspects.of(sandboxStage).add(new AwsSolutionsChecks({ verbose: true }));
    Aspects.of(acceptanceStage).add(new AwsSolutionsChecks({ verbose: true }));

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