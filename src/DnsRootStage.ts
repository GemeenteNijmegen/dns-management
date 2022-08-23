import { Environment, Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DnsRootStack } from './DnsRootStack';
import { DnsSecStack } from './DnsSecStack';

export interface DnsRootStageProps extends StageProps {
  dnsRootAccount: Environment;
}

export class DnsRootStage extends Stage {
  constructor(scope: Construct, id: string, props: DnsRootStageProps) {
    super(scope, id, props);

    new DnsRootStack(this, 'dns-stack', {
      env: props.dnsRootAccount,
    });

    new DnsSecStack(this, 'dnssec-stack', {
      env: { region: 'us-east-1' },
      enableDnsSec: true,
    });

  }
}