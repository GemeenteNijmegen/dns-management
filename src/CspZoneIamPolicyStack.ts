import * as cdk from 'aws-cdk-lib';
import { aws_iam as IAM, aws_route53 as Route53, aws_ssm as SSM, Environment, Tags } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Statics } from './Statics';


export interface CspZoneIamPolicyStackProps extends cdk.StackProps {
  sandbox: Environment;
}

export class CspZoneIamPolicyStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props: CspZoneIamPolicyStackProps) {
    super(scope, id);

    Tags.of(this).add('cdkManaged', 'yes');
    Tags.of(this).add('Project', Statics.projectName);

    // Get the csp-nijmegen.nl hosted zone
    const rootZoneId = SSM.StringParameter.fromStringParameterName(this, 'csp-root-zone-id', Statics.envRootHostedZoneIdOld);
    const rootZoneName = SSM.StringParameter.fromStringParameterName(this, 'csp-root-zone-name', Statics.envRootHostedZoneNameOld);
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

    // Stolen from PublicHostedZone constructor
    return new IAM.Role(this, 'CrossAccountZoneDelegationRole', {
      roleName: roleName,
      assumedBy: new IAM.AccountPrincipal(environment.account),
      inlinePolicies: {
        delegation: new IAM.PolicyDocument({
          statements: [
            new IAM.PolicyStatement({
              actions: ['route53:ChangeResourceRecordSets'],
              resources: [arn],
            }),
            new IAM.PolicyStatement({
              actions: ['route53:ListHostedZonesByName'],
              resources: ['*'],
            }),
          ],
        }),
      },
    });
  }

}