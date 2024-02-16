import * as crypto from 'crypto';
import * as cdk from 'aws-cdk-lib';
import {
  aws_iam as IAM, aws_route53 as Route53, aws_ssm as SSM,
  Environment,
  StackProps, Tags,
} from 'aws-cdk-lib';
import { NagSuppressions } from 'cdk-nag';
import { Construct } from 'constructs';
import { Configurable } from './Configuration';
import { DnsManagementRole } from './constructs/DnsManagementRole';
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
    props.configuration.dnsConfiguration.forEach(acc => {
      this.enableDelegationToAccount(arn, acc.environment, acc.name);
    });

    // New way to add CNAME and DS records to the root
    this.addCnameRecords(this.cspNijmegenZone, props.configuration.cnameRecords);
    this.addDsRecords(this.cspNijmegenZone, props.configuration.dsRecords);

    // Old way of adding recors only on production branch
    if (props.configuration.branchName == 'production') {
      // Set DS records for subdomains
      this.createDsRecords();

      // Configure SES for sending mails from @nijmegen.nl
      this.setupMailRecords();

      // Add certificate validation records
      this.createRootCertificateValidationRecords();
    }

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
      recordName: '_2db6a8de32f9fb49b42f88127092be93',
      domainName: '7a38240e33f335e0b935367644423084.efec36361a757e70d540a291701c27fb.comodoca.com.',
    });
    new Route53.CnameRecord(this, 'tribe-brp-validation-record-prod', { // Tribe brp prod - esb (tribebrp.generiek-prod.csp-nijmegen.nl)
      zone: this.cspNijmegenZone,
      recordName: '_7b3cf064cfc7fdbd40a7c6677563c523',
      domainName: '4594484c90b02f72b15f7a26954f1481.dc969c51f59d7bd58e55f09f19b6882f.comodoca.com.',
    });

    new Route53.CnameRecord(this, 'irma-issue-validation-record-accp', { // Irma issue accp - esb (irma-issue.accp.csp-nijmegen.nl)
      zone: this.cspNijmegenZone,
      recordName: '_82e96918e2e006569edd57a9bf2ca18a',
      domainName: '1c25b15c30dea2869a5cf44da8cfd07d.b4a989acf7f156b70e69c6c20996feed.comodoca.com.',
    });
    new Route53.CnameRecord(this, 'irma-issue-validation-record-prod', { // Irma issue prod - esb (irma-issue.auth-prod.csp-nijmegen.nl)
      zone: this.cspNijmegenZone,
      recordName: '_8bcedded666ccd9b575ab5d78840b91a',
      domainName: '2a8fbd419e077abf49863ab79387f155.5afde26b969373212b99b4a97eab728a.comodoca.com.',
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

    /**
     * DocPoc Sectigo
     */
    new Route53.CnameRecord(this, 'docpoc-validation-record-accp', { // DocPoc accp - esb (docpoc-accp.csp-nijmegen.nl)
      zone: this.cspNijmegenZone,
      recordName: '_C09AF98DC2FE54695443BF987E37C329',
      domainName: '98DCDAD749B9B0C55544167D8CE5202C.2F575C50C0E49874844BC0A5A49CAD06.sectigo.com',
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
   * Add DS records to the hosted zone based on the configuration provided
   * @param hostedZone
   * @param dsRecords
   */
  addDsRecords(hostedZone: Route53.IHostedZone, dsRecords?: { [key: string]: string }) {
    if (!dsRecords) { return; };
    Object.entries(dsRecords).forEach(entry => {
      const logicalId = crypto.createHash('md5').update(entry[0] + entry[1]).digest('hex').substring(0, 10);
      new Route53.DsRecord(this, `ds-record-${logicalId}`, {
        recordName: entry[0],
        values: [entry[1]],
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
