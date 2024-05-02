import { PermissionsBoundaryAspect } from '@gemeentenijmegen/aws-constructs';
import { Aspects, Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Configurable } from './Configuration';
import { DnsRootStack } from './DnsRootStack';
import { DnsSecStack } from './DnsSecStack';

export interface DnsRootStageProps extends StageProps, Configurable {}

export class DnsRootStage extends Stage {
  constructor(scope: Construct, id: string, props: DnsRootStageProps) {
    super(scope, id, props);

    Aspects.of(this).add(new PermissionsBoundaryAspect());

    new DnsRootStack(this, 'dns-stack', {
      env: props.configuration.toplevelHostedzoneEnvironment,
      configuration: props.configuration,
    });

    new DnsSecStack(this, 'dnssec-stack', {
      env: { region: 'us-east-1' },
      configuration: props.configuration,
      subdomainConfiguration: {
        addDSRecord: false, // This is the root hostedzone so no parent
      } as any, // Hack to still use this stack without a subdomain
    });

  }
}