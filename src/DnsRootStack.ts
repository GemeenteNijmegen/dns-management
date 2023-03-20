import * as cdk from 'aws-cdk-lib';
import {
  aws_route53 as Route53,
  Tags,
  aws_iam as IAM,
  aws_ssm as SSM,
  Environment,
  StackProps,
} from 'aws-cdk-lib';
import { NagSuppressions } from 'cdk-nag';
import { Construct } from 'constructs';
import { DnsManagementRole } from './constructs/DnsManagementRole';
import { AccountConfiguration } from './DnsConfiguration';
import { Statics } from './Statics';

export interface DnsRootStackProps extends StackProps {
  dnsConfiguration: AccountConfiguration[];
}

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
    props.dnsConfiguration.forEach(acc => {
      this.enableDelegationToAccount(arn, acc.environment, acc.name);
    });

    // Set DS records for subdomains
    this.createDsRecords();

    // Configure SES for sending mails from @nijmegen.nl
    this.setupMailRecords();

    // Add certificate validation records
    this.createRootCertificateValidationRecords();

    // Setup a least-access role for accessing the dns account
    new DnsManagementRole(this, 'dns-manager-role');

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

  /**
   * Comodoca certificates must be on top level domain.
   * Therefore they are set here instad of in the projects
   */
  createRootCertificateValidationRecords() {
    new Route53.CnameRecord(this, 'mijn-validation-record-prod', { // mijn-nijmegen prod - esb
      zone: this.cspNijmegenZone,
      recordName: '_4588e69b1b76bc5be539b7c806bb3997',
      domainName: 'b74dfb03fee04da5fc9f34760ae7c822.3848d0265a5bf6527c915d7c436a9901.comodoca.com.',
    });
    new Route53.CnameRecord(this, 'mijn-validation-record-accp', { // mijn-nijmegen accp - esb
      zone: this.cspNijmegenZone,
      recordName: '_bad8ee6a4a83dc702b00b2a56b247c2b',
      domainName: 'da505453e2d0f774ea88e8da8e04f047.7314b2ac6463a4e254bbad8710ad7ced.comodoca.com.',
    });

    new Route53.CnameRecord(this, 'webformulieren-validation-record-prod', { // Webformulieren prod - esb (auht.csp-nijmegen.nl)
      zone: this.cspNijmegenZone,
      recordName: '_578630817267b977076c44d1065f484d',
      domainName: 'a213f88cb03ee3378d4a61b0ee419340.6f8522989e4f5cdbaa87ab19f464e270.comodoca.com.',
    });
    new Route53.CnameRecord(this, 'webformulieren-validation-record-accp', { // Webformulieren accp - esb (auth.accp.csp-nijmegen.nl)
      zone: this.cspNijmegenZone,
      recordName: '_9098af4bf46f252af5e3a050f3393016',
      domainName: '361c615f2fecf47aaaa7c5b74a0a1ebe.33a6de06e8378e1c06dd092f6da142e2.comodoca.com.',
    });

    new Route53.CnameRecord(this, 'tribe-brp-validation-record-accp', { // Tribe brp accp - esb (tribebrp.generiek-accp.csp-nijmegen.nl)
      zone: this.cspNijmegenZone,
      recordName: '_679d84fe3a2b767efc282e6c82d18545',
      domainName: '68352a3d1dac6785191bf0b8fc4b24c3.46978e978f10c175783611cafb0bbeb1.comodoca.com.',
    });
    new Route53.CnameRecord(this, 'tribe-brp-validation-record-prod', { // Tribe brp prod - esb (tribebrp.generiek-prod.csp-nijmegen.nl)
      zone: this.cspNijmegenZone,
      recordName: '_c4394b9347b95abaf24cc46a827878c3',
      domainName: '27fccbea87c494ad174a7b2e792dc4fa.4ceee28a1b2e7e3739ad9fa7b1269dd8.comodoca.com.',
    });

    new Route53.CnameRecord(this, 'irma-issue-validation-record-accp', { // Irma issue accp - esb (irma-issue.accp.csp-nijmegen.nl)
      zone: this.cspNijmegenZone,
      recordName: '_d8b9a2cceda1d51a173898f8d536d1ee',
      domainName: 'd0918abb75959c676f7b431d3c373c29.4ea79a4414b345fd4484fa47920758ae.comodoca.com.',
    });
    new Route53.CnameRecord(this, 'irma-issue-validation-record-prod', { // Irma issue prod - esb (irma-issue.auth-prod.csp-nijmegen.nl)
      zone: this.cspNijmegenZone,
      recordName: '_63a809d82bbb64b4b4e6e4d8f3913b86',
      domainName: '93f9b0a9c2df09dc6c0f6fb05e2b7e5c.51616c209e01a7a79f2758c921d3039c.comodoca.com.',
    });

    /**
     * Electronisch statusformulier
     */
    new Route53.CnameRecord(this, 'esf-validation-record-prod', {
      zone: this.cspNijmegenZone,
      recordName: '_e6afe3b30f34b29943c7a25a57a64fc3',
      domainName: '8a517865032f100eb489a4cb779bea43.3de2af4d2845abf6a916c2f487d7cdd2.comodoca.com.',
    });
    new Route53.CnameRecord(this, 'esf-validation-record-accp', {
      zone: this.cspNijmegenZone,
      recordName: '_0dda4864990029d7b9def59785242089',
      domainName: '4bd2d704cc5f72f39cf605cf24500bde.13f6be6ddcec328123708fd74b620d25.comodoca.com.',
    });

  }

  setupMailRecords() {
    // Validate csp-nijmegen.nl domain
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

    // Setup mail from @csp-nijmegen.nl
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

    NagSuppressions.addResourceSuppressions(role, [{
      id: 'AwsSolutions-IAM5',
      reason: 'This role is taken form the cdk source code and it includes the * resources (unknown which resources is accessed by the role?)',
    }], true);

    return role;
  }

}
