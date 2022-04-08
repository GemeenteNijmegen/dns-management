import { Environment, Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CspZoneIamPolicyStack } from './CspZoneIamPolicyStack';

export interface IamStageProps extends StageProps {
  cspRootEnvironment: Environment;
  sandbox: Environment;
}

export class IamStage extends Stage {
  constructor(scope: Construct, id: string, props: IamStageProps) {
    super(scope, id, props);

    // Iam policies for delegation
    new CspZoneIamPolicyStack(this, 'csp-dns-iam-policy-stack', {
      env: props.cspRootEnvironment,
      sandbox: props.sandbox,
    });

  }
}