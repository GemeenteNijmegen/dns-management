import { Environment, Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CspZoneIamPolicyStack } from './CspZoneIamPolicyStack';
import { CspZoneStack } from './CspZoneStack';

export interface CspStageProps extends StageProps {
  cspRootEnvironment: Environment;
  sandbox: Environment;
}

export class CspStage extends Stage {
  constructor(scope: Construct, id: string, props: CspStageProps) {
    super(scope, id, props);

    // Csp zone related stuff
    new CspZoneStack(this, 'csp-dns-stack', {
      env: props.cspRootEnvironment,
    });

    // Iam policies for delegation
    new CspZoneIamPolicyStack(this, 'csp-dns-iam-policy-stack', {
      env: props.cspRootEnvironment,
      sandbox: props.sandbox,
    });

  }
}