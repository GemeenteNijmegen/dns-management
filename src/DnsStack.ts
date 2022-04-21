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
    new Route53.CrossAccountZoneDelegationRecord(this, 'delegate', {
      delegatedZone: subzone,
      delegationRole: role,
      parentHostedZoneName: props.rootZoneName,
    });

    // Export hostedzone properties for other projects in this account
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
