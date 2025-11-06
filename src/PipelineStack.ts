import { PermissionsBoundaryAspect } from '@gemeentenijmegen/aws-constructs';
import { Stack, StackProps, Tags, pipelines, Aspects } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AccountStage } from './AccountStage';
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
      env: props.configuration.toplevelHostedzoneEnvironment,
      configuration: props.configuration,
    });
    pipeline.addStage(dnsRoot);

    // Account stages
    const wave = pipeline.addWave('accounts');
    props.configuration.subdomains.forEach(subdomainConfiguration => {
      const stage = new AccountStage(this, `dns-management-${subdomainConfiguration.name}`, {
        configuration: props.configuration,
        subdomainConfiguration: subdomainConfiguration,
        env: subdomainConfiguration.environment,
      });
      wave.addStage(stage);
    });

  }

  pipeline(props: PipelineStackProps): pipelines.CodePipeline {

    const source = pipelines.CodePipelineSource.connection('GemeenteNijmegen/dns-management', this.branchName, {
      connectionArn: props.configuration.codeStartConnectionArn,
    });

    const pipeline = new pipelines.CodePipeline(this, `dns-management-${this.branchName}`, {
      pipelineName: `dns-management-${this.branchName}`,
      crossAccountKeys: true,
      synth: new pipelines.ShellStep('Synth', {
        input: source,
        env: {
          BRANCH_NAME: this.branchName,
        },
        commands: [
          'n lts',
          'node -v',
          'yarn install --frozen-lockfile',
          'yarn build',
        ],
      }),
    });
    return pipeline;
  }
}