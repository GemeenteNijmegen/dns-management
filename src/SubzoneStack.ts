import * as cdk from 'aws-cdk-lib';
import { aws_ssm as SSM, aws_route53 as Route53 } from 'aws-cdk-lib';
import { IRole } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { Statics } from './Statics';

export interface SubzoneStackProps extends cdk.StackProps {
  /**
   * Subdomain name (eg. sandbox)
   */
  subzoneName: string;
  /**
   * FQDN of the root zone (eg. csp-nijmegen.nl)
   */
  rootZoneName: string;
  /**
   * The delegation role the account in which this stack is deployed
   */
  delegationRole: IRole | undefined;
}

export class SubzoneStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: SubzoneStackProps) {
    super(scope, id, props);

    // Construct the sub hosted zone
    const subzone = new Route53.HostedZone(this, 'subzone', {
      zoneName: `${props.subzoneName}.${props.rootZoneName}`,
    });

    // Register the zone with its root
    if (props.delegationRole == undefined) {
      throw `No delegation role was found could not create the delegation record for subzone ${props.subzoneName}`;
    }
    new Route53.CrossAccountZoneDelegationRecord(this, 'delegate', {
      delegatedZone: subzone,
      delegationRole: props.delegationRole,
      parentHostedZoneName: props.rootZoneName,
    });

    // Store in parameters for other projects to find this hostedzone
    new SSM.StringParameter(this, 'csp-sub-hostedzone-id', {
      stringValue: subzone.hostedZoneId,
      parameterName: Statics.envRootHostedZoneId,
    });
    new SSM.StringParameter(this, 'csp-sub-hostedzone-name', {
      stringValue: subzone.zoneName,
      parameterName: Statics.envRootHostedZoneName,
    });

  }

}
