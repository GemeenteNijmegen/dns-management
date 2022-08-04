import * as cdk from 'aws-cdk-lib';
import { aws_ssm as SSM, aws_route53 as Route53, Tags, Arn, aws_iam as IAM } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Statics } from './Statics';

export interface DnsStackProps extends cdk.StackProps {
  /**
   * Subdomain name (eg. sandbox)
   */
  subzoneName: string;
  /**
   * FQDN of the root zone (eg. csp-nijmegen.nl)
   */
  rootZoneName: string;
  productionAccount: string;


  /**
   * TEMP: Indicate if this stack should use normal parameters or a secondery set
   * to save the hostedzone ssm reference.
   */
  useSecondaryParameters: boolean;
}

export class DnsStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props: DnsStackProps) {
    super(scope, id, props);

    Tags.of(this).add('cdkManaged', 'yes');
    Tags.of(this).add('Project', Statics.projectName);

    // Import the delegated role in the production account
    const roleArn = Arn.format({
      service: 'iam',
      account: props.productionAccount,
      resource: 'role',
      resourceName: Statics.constructDelegationRoleName(props.subzoneName),
      partition: 'aws',
      region: '',
    });
    const role = IAM.Role.fromRoleArn(this, 'delegated-csp-nijmegen-role', roleArn);

    // Construct the hosted zone (subdomain)
    const subzone = new Route53.HostedZone(this, 'subzone', {
      zoneName: `${props.subzoneName}.${props.rootZoneName}`,
    });

    // Register the zone nameservers within the root zone
    // Only if this is not the second domain name on the account (useSecondaryParameters)
    if (!props.useSecondaryParameters) {
      new Route53.CrossAccountZoneDelegationRecord(this, 'delegate', {
        delegatedZone: subzone,
        delegationRole: role,
        parentHostedZoneName: props.rootZoneName,
      });
    }

    var ssmZoneId = Statics.envRootHostedZoneId;
    var ssmZoneName = Statics.envRootHostedZoneName;
    if (props.useSecondaryParameters) {
      ssmZoneId = Statics.envRootHostedZoneId + '/second';
      ssmZoneName = Statics.envRootHostedZoneName + '/second';
    }

    // Export hostedzone properties for other projects in this account
    new SSM.StringParameter(this, 'csp-sub-hostedzone-id', {
      stringValue: subzone.hostedZoneId,
      parameterName: ssmZoneId,
    });
    new SSM.StringParameter(this, 'csp-sub-hostedzone-name', {
      stringValue: subzone.zoneName,
      parameterName: ssmZoneName,
    });

  }

}
