import * as crypto from 'crypto';
import * as cdk from 'aws-cdk-lib';
import {
  aws_iam as IAM, aws_route53 as Route53, aws_ssm as SSM,
  Environment,
  StackProps, Tags,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Configurable } from './Configuration';
import { Statics } from './Statics';

export interface DnsRootStackProps extends StackProps, Configurable { }

export class DnsRootStack extends cdk.Stack {

  private cspNijmegenZone;

  constructor(scope: Construct, id: string, props: DnsRootStackProps) {
    super(scope, id, props);

    Tags.of(this).add('cdkManaged', 'yes');
    Tags.of(this).add('Project', Statics.projectName);

    // Create the csp-nijmegen.nl public hosted zone
    this.cspNijmegenZone = new Route53.PublicHostedZone(this, 'csp-nijmegen-zone', {
      zoneName: 'csp-nijmegen.nl',
    });

    // Export hostedzone properties for importing in the dnssec stack
    new SSM.StringParameter(this, 'csp-sub-hostedzone-id', {
      stringValue: this.cspNijmegenZone.hostedZoneId,
      parameterName: Statics.envRootHostedZoneId,
    });
    new SSM.StringParameter(this, 'csp-sub-hostedzone-name', {
      stringValue: this.cspNijmegenZone.zoneName,
      parameterName: Statics.envRootHostedZoneName,
    });

    /**
     * To allow accounts to creat a subdomain in the root zone we use the
     * CrossAccountZoneDelegation construct. This requires a role that allows
     * an account to manage te root hosted zone.
     * Note: the accetpance hosted zone is still named accp
     */
    const arn = this.cspNijmegenZone.hostedZoneArn;
    props.configuration.subdomains.forEach(acc => {
      this.enableDelegationToAccount(arn, acc.environment, acc.name);
    });

    // New way to add CNAME and DS records to the root
    this.addCnameRecords(this.cspNijmegenZone, props.configuration.cnameRecords);

  }

  /**
   * Add CNAME records to the hosted zone based on the configuration provided
   * @param hostedZone
   * @param cnameRecords
   */
  addCnameRecords(hostedZone: Route53.IHostedZone, cnameRecords?: { [key: string]: string }) {
    if (!cnameRecords) { return; };
    Object.entries(cnameRecords).forEach(entry => {
      const logicalId = crypto.createHash('md5').update(entry[0] + entry[1]).digest('hex').substring(0, 10);
      new Route53.CnameRecord(this, `cname-record-${logicalId}`, {
        recordName: entry[0],
        domainName: entry[1],
        zone: hostedZone,
      });
    });
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
    const role = new IAM.Role(this, `CrossAccountZoneDelegationRole${name}`, {
      roleName: roleName,
      assumedBy: new IAM.AccountPrincipal(environment.account),
      inlinePolicies: {
        delegation: new IAM.PolicyDocument({
          statements: [
            new IAM.PolicyStatement({
              effect: IAM.Effect.ALLOW,
              actions: [
                'route53:ChangeResourceRecordSets',
                'route53:GetChange',
              ],
              resources: [arn],
            }),
            new IAM.PolicyStatement({
              effect: IAM.Effect.ALLOW,
              actions: ['route53:ListHostedZonesByName'],
              resources: ['*'],
            }),
          ],
        }),
      },
    });

    return role;
  }

}
