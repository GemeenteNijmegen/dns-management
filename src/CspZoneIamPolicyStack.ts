import * as cdk from 'aws-cdk-lib';
import { aws_iam as IAM, aws_route53 as Route53, aws_ssm as SSM, Environment } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Statics } from './Statics';


export interface CspZoneIamPolicyStackProps extends cdk.StackProps {
  sandbox: Environment;
}

export class CspZoneIamPolicyStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props: CspZoneIamPolicyStackProps) {
    super(scope, id);

    // Get the csp-nijmegen.nl hosted zone
    const rootZoneId = SSM.StringParameter.fromStringParameterName(this, 'csp-root-zone-id', Statics.envRootHostedZoneId);
    const rootZoneName = SSM.StringParameter.fromStringParameterName(this, 'csp-root-zone-name', Statics.envRootHostedZoneName);
    const cspNijmegenZone = Route53.HostedZone.fromHostedZoneAttributes(this, 'csp-zone', {
      hostedZoneId: rootZoneId.stringValue,
      zoneName: rootZoneName.stringValue,
    });
    const arn = cspNijmegenZone.hostedZoneArn;

    // Register the relegation role
    this.enableDelegationToAccount(arn, props.sandbox, 'sandbox');
    // TODO add acounts that manage a cps-nijmegen.nl subdomain here for example:
    //    this.enableDelegationToAccount(arn, props.acceptance, 'accp');
    //    this.enableDelegationToAccount(arn, props.marnix, 'marnix');

  }


  enableDelegationToAccount(arn: string, environment: Environment, name: string) {
    if (environment.account == undefined) {
      throw `No account provided could not create delegation policy for ${name}`;
    }
    const roleName = Statics.constructDelegationRoleName(name);
    return new IAM.Role(this, roleName, {
      assumedBy: new IAM.AccountPrincipal(environment.account),
      roleName: roleName,
      inlinePolicies: {
        delegation: new IAM.PolicyDocument({
          statements: [new IAM.PolicyStatement({
            actions: ['route53:ChangeResourceRecordSets'],
            resources: [arn],
          })],
        }),
      },
    });
  }

}