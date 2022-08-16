import { Environment, Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CspNijmegenStack } from './CspNijmegenStack';
import { DnsSecStack } from './DnsSecStack';

export interface CspNijmegenStageProps extends StageProps {
  cspRootEnvironment: Environment;
  sandbox: Environment;
}

export class CspNijmegenStage extends Stage {
  constructor(scope: Construct, id: string, props: CspNijmegenStageProps) {
    super(scope, id, props);

    // Csp zone related stuff
    // Iam delegation policies
    new CspNijmegenStack(this, 'stack', {
      env: props.cspRootEnvironment,
      sandbox: props.sandbox,
    });

    // KMS key for dnssec (must be in us-east-1)
    new DnsSecStack(this, 'dnssec-stack', {
      env: { region: 'us-east-1' },
      enableDnsSec: false,
      useSecondaryParameter: true,
    });
  }
}