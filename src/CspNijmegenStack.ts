import * as cdk from 'aws-cdk-lib';
import { aws_ssm as SSM, aws_route53 as Route53, Tags, aws_iam as IAM, Environment } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Statics } from './Statics';


export interface CspNijmegenStackProps extends cdk.StackProps {
  sandbox: Environment;
}

export class CspNijmegenStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props: CspNijmegenStackProps) {
    super(scope, id, props);

    Tags.of(this).add('cdkManaged', 'yes');
    Tags.of(this).add('Project', Statics.projectName);

    /**
     * Currently only sets the parameters to be account generic
     * evantually we need to replace the import below with an actual
     * PublicHostedZone. However csp-nijmegen is currently managed in the
     * webformulieren repository.
     */
    const rootZoneId = SSM.StringParameter.valueForStringParameter(this, Statics.cspRootHostedZoneId);
    const rootZoneName = SSM.StringParameter.valueForStringParameter(this, Statics.cspRootHostedZoneName);
    const cspNijmegenZone = Route53.HostedZone.fromHostedZoneAttributes(this, 'cspzone', {
      hostedZoneId: rootZoneId,
      zoneName: rootZoneName,
    });

    // Store in parameters for other projects to find this hostedzone
    new SSM.StringParameter(this, 'csp-sub-hostedzone-id', {
      stringValue: cspNijmegenZone.hostedZoneId,
      parameterName: Statics.envRootHostedZoneId,
    });
    new SSM.StringParameter(this, 'csp-sub-hostedzone-name', {
      stringValue: cspNijmegenZone.zoneName,
      parameterName: Statics.envRootHostedZoneName,
    });

    // Register the relegation role
    const arn = cspNijmegenZone.hostedZoneArn;
    this.enableDelegationToAccount(arn, props.sandbox, 'sandbox');
    // TODO add acounts that manage a cps-nijmegen.nl subdomain here for example:
    //    this.enableDelegationToAccount(arn, props.acceptance, 'accp');
    //    this.enableDelegationToAccount(arn, props.marnix, 'marnix');

  }

  /**
   * Create a role specificly for each account to manage the csp-nijmegen.nl hosted zone
   * @param arn the csp-nijmegen hosted zone arn
   * @param environment the environment (account) to enable csp-nijmegen management for
   * @param name the name of the subdomain
   * @returns
   */
  enableDelegationToAccount(arn: string, environment: Environment, name: string) {
    if (environment.account == undefined) {
      throw `No account provided could not create delegation policy for ${name}`;
    }
    const roleName = Statics.constructDelegationRoleName(name);

    // Stolen from PublicHostedZone constructor
    return new IAM.Role(this, `CrossAccountZoneDelegationRole${name}`, {
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
