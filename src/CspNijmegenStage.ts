import { Aspects, Environment, Stage, StageProps } from 'aws-cdk-lib';
import { AwsSolutionsChecks } from 'cdk-nag';
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
    const csp = new CspNijmegenStack(this, 'stack', {
      env: props.cspRootEnvironment,
      sandbox: props.sandbox,
    });

    // KMS key for dnssec (must be in us-east-1)
    const dnssec = new DnsSecStack(this, 'dnssec-stack', {
      env: { region: 'us-east-1' },
    });

    Aspects.of(csp).add(new AwsSolutionsChecks());
    Aspects.of(dnssec).add(new AwsSolutionsChecks());
  }
}