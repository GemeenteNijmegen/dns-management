import * as cdk from 'aws-cdk-lib';
import {
  aws_route53 as Route53,
  Tags,
  aws_iam as IAM,
  aws_ssm as SSM,
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

    // Configure SES for sending mails from @nijmegen.nl
    this.setupMailRecords();

    // Setup a least-access role for accessing the dns account
    this.setupDnsManagementRole();

    /**
     * Temporarely we have to add the existing csp-nijmegen.nl records
     * This ensures we can switch dns without downtime.
     */
    this.temporarelyAddExistingCspNijmegenRecords();

  }

  setupDnsManagementRole(){
    const role = new IAM.Role(this, 'role', {
      roleName: 'dns-manager',
      description: 'Role for dns-management account with access rights to IAM (readonly) and Route53',
      assumedBy: new IAM.PrincipalWithConditions(
        new IAM.AccountPrincipal(Statics.iamAccountId), //IAM account
        {
          Bool: {
            'aws:MultiFactorAuthPresent': true,
          },
        },
      ),
    });

    role.addToPolicy(
      new IAM.PolicyStatement({
        effect: IAM.Effect.ALLOW,
        actions: [
          'route53:*', // Allow domain management
          'route53domains:*', // Allow domain management
          'iam:Get*',
          'iam:List*',
        ]
      })
    );

    new SSM.StringParameter(this, 'dns-manager-role-arn', {
      parameterName: Statics.ssmDnsManagerRoleArn,
      stringValue: role.roleArn,
    });

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
    new Route53.DsRecord(this, 'accp-ds-record', {
      zone: this.cspNijmegenZone,
      recordName: 'accp',
      values: ['52561 13 2 07CCC7D1A28A7BF1F221F50589AF606FD807B1793F28B0D76AF7F56D32FDE0FE'],
    });
  }

  temporarelyAddExistingCspNijmegenRecords() {

    // Good to know but also present in accp.csp-nijmegen.nl hosted zone
    // accp.csp-nijmegen.nl	TXT	Simple	-	"v=spf1 include:amazonses.com ~all"
    // accp.csp-nijmegen.nl	MX	Simple	- 10 feedback-smtp.eu-west-1.amazonses.com

    // Not relevant i think (literal slashes in there)
    // mail.csp-nijmegen.nl	TXT	Simple	-	"\"v=spf1 include:amazonses.com ~all\""

    // NOTE: A and AAAA records must be configured manually!

    // TEMP records mijn nijmegen
    new Route53.DsRecord(this, 'mijn-nijmegen-ds', {
      zone: this.cspNijmegenZone,
      recordName: 'mijn',
      values: ['60066 13 2 932CD585B029E674E17C4C33DFE7DE2C84353ACD8C109760FD17A6CDBD0CF3FA'],
    });
    new Route53.NsRecord(this, 'mijn-nijmegen-ds', {
      zone: this.cspNijmegenZone,
      recordName: 'mijn',
      values: [
        'ns-674.awsdns-20.net',
        'ns-1880.awsdns-43.co.uk',
        'ns-1091.awsdns-08.org',
        'ns-160.awsdns-20.com',
      ],
    });

    // Other records
    new Route53.TxtRecord(this, 'temp-cdn-txt', { // I have no clue what this does
      zone: this.cspNijmegenZone,
      recordName: 'cdn',
      values: ['9c5ca9b585a61a66c590a3ca912f9283511a286fc26978596059445f5795ebb7'],
    });

    // CNAME records for validation of certificates (all temporarely added, after moving there is no certificate required on the csp-nijmegen.nl hosted zone)
    new Route53.CnameRecord(this, 'temp-cname-1', {
      zone: this.cspNijmegenZone,
      recordName: '_859607f90d21b7dc4baefd691342ff37',
      domainName: 'eacbeb67b92c42efa3bfb148a847be8c.682b5c12a9f4cdf42dde19f6323900ee.comodoca.com.',
    });
    new Route53.CnameRecord(this, 'temp-cname-2', {
      zone: this.cspNijmegenZone,
      recordName: '_fe679386e9d233d59f58a9cb7d00ca77',
      domainName: '03eb57d71e04544096bac14ce41431fa.058306850a8780ce3af8d4347102606b.comodoca.com.',
    });
    new Route53.CnameRecord(this, 'temp-cname-3', {
      zone: this.cspNijmegenZone,
      recordName: '_0736ae35ae9c4de52bdda1852b93fd97.alb-formio',
      domainName: '_4b83e395676256e35d7d3d782ac5f5d8.lkwmzfhcjn.acm-validations.aws.',
    });
    new Route53.CnameRecord(this, 'temp-cname-4', {
      zone: this.cspNijmegenZone,
      recordName: '_9aeaaf089312840a908a88ab54b9914b.alb',
      domainName: '_38d1a3dc7ab5b98cbb944586028d1c01.jddtvkljgg.acm-validations.aws.',
    });
    new Route53.CnameRecord(this, 'temp-cname-5', {
      zone: this.cspNijmegenZone,
      recordName: '_008c62eff4b4faa7b2a9b93c9a0fd53a.cdn',
      domainName: '_8d01b287e916ee0865c45e4f2514795c.tjxrvlrcqj.acm-validations.aws.',
    });
    new Route53.CnameRecord(this, 'temp-cname-6', {
      zone: this.cspNijmegenZone,
      recordName: '_024e218687efee4c3949009da5c08e6c.eform-api',
      domainName: '_18422c3cf53ae7e6fc96ba7cc7fdbff4.cnsgthfrdk.acm-validations.aws.',
    });
    new Route53.CnameRecord(this, 'temp-cname-7', {
      zone: this.cspNijmegenZone,
      recordName: '_c72e8bcdc9bcdc77647bd4a3bdb8b72f.form-dashboard',
      domainName: '_a33d4c3d036e55abd1d45dfa7fc3b5b5.jddtvkljgg.acm-validations.aws.',
    });
    new Route53.CnameRecord(this, 'temp-cname-8', {
      zone: this.cspNijmegenZone,
      recordName: '_641e70643a9dd52155bb11983bd3c734.form',
      domainName: '_095fc2806eb36160acdb32ef0665bd17.jddtvkljgg.acm-validations.aws.',
    });


  }

  setupMailRecords() {
    new Route53.CnameRecord(this, 'mail-dkim-1', {
      zone: this.cspNijmegenZone,
      recordName: 'p2qzrb7orqvnmcbfteuitb6rcm7ppjeg._domainkey',
      domainName: 'p2qzrb7orqvnmcbfteuitb6rcm7ppjeg.dkim.amazonses.com',
    });
    new Route53.CnameRecord(this, 'mail-dkim-2', {
      zone: this.cspNijmegenZone,
      recordName: '3oauc4kfqwgwdmd7sqyj66r4lwx52gbd._domainkey',
      domainName: '3oauc4kfqwgwdmd7sqyj66r4lwx52gbd.dkim.amazonses.com',
    });
    new Route53.CnameRecord(this, 'mail-dkim-3', {
      zone: this.cspNijmegenZone,
      recordName: 'jscft5y6jlalacyyubloeajrxeaezfbb._domainkey',
      domainName: 'jscft5y6jlalacyyubloeajrxeaezfbb.dkim.amazonses.com',
    });

    new Route53.MxRecord(this, 'mail-mx', {
      zone: this.cspNijmegenZone,
      recordName: 'mail',
      values: [{
        priority: 10,
        hostName: 'feedback-smtp.eu-west-1.amazonses.com',
      }],
    });
    new Route53.TxtRecord(this, 'mail-txt', {
      zone: this.cspNijmegenZone,
      recordName: 'mail',
      values: ['v=spf1 include:amazonses.com ~all'],
    });

    // Probably old records?
    // new Route53.CnameRecord(this, 'mail-dkim-4', {
    //   zone: this.cspNijmegenZone,
    //   recordName: 'cnc3stfudnfqpna7j6a3lcgahiwwckio._domainkey',
    //   domainName: 'cnc3stfudnfqpna7j6a3lcgahiwwckio.dkim.amazonses.com',
    // });
    // new Route53.CnameRecord(this, 'mail-dkim-5', {
    //   zone: this.cspNijmegenZone,
    //   recordName: 'db7i6gsrpjmp7ng7zw7dmyej7hkxvzvu._domainkey',
    //   domainName: 'db7i6gsrpjmp7ng7zw7dmyej7hkxvzvu.dkim.amazonses.com',
    // });
    // new Route53.CnameRecord(this, 'mail-dkim-6', {
    //   zone: this.cspNijmegenZone,
    //   recordName: 'nv3xyzt6klljngnmf5yp6gb7tyjyj2xf._domainkey',
    //   domainName: 'nv3xyzt6klljngnmf5yp6gb7tyjyj2xf.dkim.amazonses.com',
    // });

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
