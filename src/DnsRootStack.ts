import * as cdk from 'aws-cdk-lib';
import {
  aws_route53 as Route53,
  Tags,
  aws_iam as IAM,
  Environment,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Statics } from './Statics';

export class DnsRootStack extends cdk.Stack {

  private cspNijmegenZone;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    Tags.of(this).add('cdkManaged', 'yes');
    Tags.of(this).add('Project', Statics.projectName);

    // Create the csp-nijmegen.nl public hosted zone
    this.cspNijmegenZone = new Route53.PublicHostedZone(this, 'csp-nijmegen-zone', {
      zoneName: 'csp-nijmegen.nl',
    });

    // Note: no need to export the zoneName and zoneId as ssm parameters for now.

    /**
     * To allow accounts to creat a subdomain in the root zone we use the
     * CrossAccountZoneDelegation construct. This requires a role that allows
     * an account to manage te root hosted zone.
     */
    const arn = this.cspNijmegenZone.hostedZoneArn;
    this.enableDelegationToAccount(arn, Statics.sandboxEnvironment, 'sandbox');
    this.enableDelegationToAccount(arn, Statics.authAccpEnvironment, 'accp'); // Hosted zone is still named accp
    this.enableDelegationToAccount(arn, Statics.authProdEnvironment, 'auth-prod');

    // Set DS records for subdomains
    this.createDsRecords();

    /**
     * Temporarely we have to add the existing csp-nijmegen.nl records
     * This ensures we can switch dns without downtime.
     */
    this.temporarelyAddExistingCspNijmegenRecords();

  }

  /**
   * If an account root hosted zone requires DNSSEC to be enabled,
   * the DS record must be deployed in the the root dns hosted zone
   * This function adds all DS records required per account
   */
  createDsRecords() {
    new Route53.DsRecord(this, 'auth-prod-ds-record', {
      zone: this.cspNijmegenZone,
      recordName: 'auth-prod',
      values: ['60066 13 2 0E517A7669408AFC5345B167EBEBC3BB0D355E48FF160EBCF46EF27189C49949'],
    });
  }

  temporarelyAddExistingCspNijmegenRecords() {
    // TODO: add records
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

    return role;
  }

}
