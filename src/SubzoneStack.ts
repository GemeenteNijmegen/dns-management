import * as cdk from 'aws-cdk-lib';
import { aws_ssm as SSM, aws_route53 as Route53, Tags, Arn, aws_iam as IAM } from 'aws-cdk-lib';
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
  productionAccount: string;
}

/**
 * WARNING: this class contains dummy code that uses the CrossAccountZoneDelegationRecord
 * this however does not work as the hosted zone in webformulieren is a HostedZone
 * (not a PublicHostedZone). Therefore no principal and role for delegation can be passed.
 * See the last example on https://docs.aws.amazon.com/cdk/api/v1/docs/aws-route53-readme.html#adding-records
 * The current implementation does not require any roles to be deployed in the production account.
 */
export class SubzoneStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props: SubzoneStackProps) {
    super(scope, id, props);

    Tags.of(this).add('cdkManaged', 'yes');
    Tags.of(this).add('Project', Statics.projectName);

    // const rootZoneId = SSM.StringParameter.valueForStringParameter(this, Statics.cspNijmegenHostedZoneId);
    // const rootZoneName = SSM.StringParameter.valueForStringParameter(this, Statics.cspNijmegenHostedZoneName);
    // const cspRootZone = Route53.HostedZone.fromHostedZoneAttributes(this, 'cspzone', {
    //   hostedZoneId: rootZoneId,
    //   zoneName: rootZoneName,
    // });

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

    // Construct the sub hosted zone
    const subzone = new Route53.HostedZone(this, 'subzone', {
      zoneName: `${props.subzoneName}.${props.rootZoneName}`,
    });

    // Add the ns records to the csp hosted zone
    //this.addNSToRootCSPzone(cspRootZone, subzone, props.subzoneName);

    // Register the zone with its root
    new Route53.CrossAccountZoneDelegationRecord(this, 'delegate', {
      delegatedZone: subzone,
      delegationRole: role,
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

  /**
   * Add the Name servers from the newly defined zone to
   * the root zone for csp-nijmegen.nl. This will only
   * have an actual effect in the prod. account.
   *
   * @returns null
   */
  addNSToRootCSPzone(cspZone: Route53.IHostedZone, zone: Route53.IHostedZone, name: string) {
    if (!zone.hostedZoneNameServers) { return; }
    new Route53.NsRecord(this, 'ns-record', {
      zone: cspZone,
      values: zone.hostedZoneNameServers,
      recordName: name,
    });
  }

}
