import { Environment, Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DnsRootStack } from './DnsRootStack';

export interface DnsRootStageProps extends StageProps {
  dnsRootAccount: Environment;
}

export class DnsRootStage extends Stage {
  constructor(scope: Construct, id: string, props: DnsRootStageProps) {
    super(scope, id, props);

    new DnsRootStack(this, 'stack', {
      env: props.dnsRootAccount,
    });

  }
}