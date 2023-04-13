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
      env: props.configuration.dnsRootEnvironment,
      configuration: props.configuration,
    });

    new DnsSecStack(this, 'dnssec-stack', {
      env: { region: 'us-east-1' },
      enableDnsSec: true,
      lookupHostedZoneInRegion: props.configuration.dnsRootEnvironment.region,
    });

  }
}