import * as cdk from 'aws-cdk-lib';
import { Environment } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CspZoneIamPolicyStack } from './CspZoneIamPolicyStack';
import { ISubdomain } from './ISubdomain';
import { SubzoneStack } from './SubzoneStack';


export interface CspManagementStageProps extends cdk.StageProps {
  subdomains: ISubdomain[];
  cspNijmegenEnv: Environment;
}

export class CspManagmentStage extends cdk.Stage {

  constructor(scope: Construct, id: string, props: CspManagementStageProps) {
    super(scope, id, props);

    // Create cross account delegation policies in the production account for the cps-nijmegen.nl hosted zone
    // Not required for in account delegation
    const delegationStage = new CspZoneIamPolicyStack(this, 'delegation-stage', {
      accountIdsToDelegateCspManagementTo: props.subdomains,
      env: props.cspNijmegenEnv,
    });

    // For each subdomain use the delegation policy to construct the actual subdomain
    delegationStage.data.forEach( (subdomain) => {
      new SubzoneStack(this, `subhostedzone-${subdomain.subdomain}`, {
        rootZoneName: delegationStage.rootZoneName,
        delegationRole: subdomain.delegationRole,
        subzoneName: subdomain.subdomain,
        env: subdomain.environment,
      });
    });

  }

}