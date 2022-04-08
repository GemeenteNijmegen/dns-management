import { Stack, StackProps, Tags, pipelines, Environment } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DnsStage } from './DnsStage';
import { IamStage } from './IamStage';
import { Statics } from './Statics';

export interface PipelineStackProps extends StackProps {
  branchName: string;
  deployment: Environment;
  production: Environment;
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

    const iamStage = new IamStage(this, 'iam-stage', {
      cspRootEnvironment: props.production,
      sandbox: props.sandbox,
    });

    const dnsStage = new DnsStage(this, 'dns-stage', {
      cspRootEnvironment: props.production,
      sandbox: props.sandbox,
    });

    pipeline.addStage(iamStage);
    pipeline.addStage(dnsStage);

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
          'npm ci',
          'npx projen build',
          'npx projen synth',
        ],
      }),
    });
    return pipeline;
  }
}