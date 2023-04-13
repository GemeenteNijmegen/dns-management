import { PermissionsBoundaryAspect } from '@gemeentenijmegen/aws-constructs';
import { Stack, StackProps, Tags, pipelines, Aspects } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AccountStage } from './AccountStage';
import { AuthAccpStage } from './AuthAccpStage';
import { Configurable } from './Configuration';
import { DnsRootStage } from './DnsRootStage';
import { Statics } from './Statics';

export interface PipelineStackProps extends StackProps, Configurable {}

export class PipelineStack extends Stack {

  branchName: string;

  constructor(scope: Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);

    Aspects.of(this).add(new PermissionsBoundaryAspect());

    this.branchName = props.configuration.branchName;

    Tags.of(this).add('cdkManaged', 'yes');
    Tags.of(this).add('Project', Statics.projectName);

    const pipeline = this.pipeline(props);

    // DNS root account
    const dnsRoot = new DnsRootStage(this, 'dns-management', {
      env: props.configuration.dnsRootEnvironment,
      configuration: props.configuration,
    });
    pipeline.addStage(dnsRoot);

    // Account stages
    const wave = pipeline.addWave('accounts');
    props.configuration.dnsConfiguration.forEach(acc => {
      const stageName = acc.overwriteStageName ?? acc.name;
      const stage = new AccountStage(this, `dns-management-${stageName}`, {
        env: acc.environment,
        ...acc,
      });
      wave.addStage(stage);
    });

    if (props.configuration.branchName == 'production') {
      // Acceptance records
      const authAccpRecordStage = new AuthAccpStage(this, 'dns-management-acceptance-records', {
        env: Statics.authAccpEnvironment,
      });
      pipeline.addStage(authAccpRecordStage);
    }

  }

  pipeline(props: PipelineStackProps): pipelines.CodePipeline {

    const source = pipelines.CodePipelineSource.connection('GemeenteNijmegen/dns-management', this.branchName, {
      connectionArn: props.configuration.codeStartConnectionArn,
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