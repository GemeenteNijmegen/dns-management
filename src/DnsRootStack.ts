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

      // While migrating to new LZ forward some subdomains from the csp-nijmegen.nl to the new LZ
      this.createForwardingRecordsToNewLz();
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
      domainName: '98DCDAD749B9B0C55544167D8CE5202C.2F575C50C0E49874844BC0A5A49CAD06.sectigo.com.',
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

  createForwardingRecordsToNewLz() {
    // NS for gn-yivi-accp
    new Route53.NsRecord(this, 'yivi-accp-ns', {
      zone: this.cspNijmegenZone,
      recordName: 'yivi-accp',
      values: [
        'ns-873.awsdns-45.net',
        'ns-465.awsdns-58.com',
        'ns-1934.awsdns-49.co.uk',
        'ns-1149.awsdns-15.org',
      ],
    });
    // DS for gn-yivi-accp
    new Route53.DsRecord(this, 'yivi-accp-ds', {
      zone: this.cspNijmegenZone,
      recordName: 'yivi-accp',
      values: ['51061 13 2 83F061A07CDB0044033CEB74E91E92B054E0A92588420F137F9B54272158A13B'],
    });

    // NS for gn-yivi-prod
    new Route53.NsRecord(this, 'yivi-prod-ns', {
      zone: this.cspNijmegenZone,
      recordName: 'yivi-prod',
      values: [
        'ns-961.awsdns-56.net',
        'ns-1310.awsdns-35.org',
        'ns-130.awsdns-16.com',
        'ns-1848.awsdns-39.co.uk',
      ],
    });
    // DS for gn-yivi-prod
    new Route53.DsRecord(this, 'yivi-prod-ds', {
      zone: this.cspNijmegenZone,
      recordName: 'yivi-prod',
      values: ['46016 13 2 6A12D4BB10AC8EA7E4FEB622F8BD1E9395824B39AD0A38A0EE42577199ACFFA1'],
    });

    // NS for gn-tribebrplinker-dev
    new Route53.NsRecord(this, 'tribebrplinker-dev-ns', {
      zone: this.cspNijmegenZone,
      recordName: 'tribebrplinker-dev',
      values: [
        'ns-1466.awsdns-55.org',
        'ns-869.awsdns-44.net',
        'ns-1721.awsdns-23.co.uk',
        'ns-449.awsdns-56.com',
      ],
    });

    // NS for gn-tribebrplinker-accp
    new Route53.NsRecord(this, 'tribebrplinker-accp-ns', {
      zone: this.cspNijmegenZone,
      recordName: 'tribebrplinker-accp',
      values: [
        'ns-948.awsdns-54.net',
        'ns-270.awsdns-33.com',
        'ns-1341.awsdns-39.org',
        'ns-2006.awsdns-58.co.uk',
      ],
    });

    // NS for gn-tribebrplinker-prod
    new Route53.NsRecord(this, 'tribebrplinker-prod-ns', {
      zone: this.cspNijmegenZone,
      recordName: 'tribebrplinker-prod',
      values: [
        'ns-1213.awsdns-23.org',
        'ns-1652.awsdns-14.co.uk',
        'ns-9.awsdns-01.com',
        'ns-985.awsdns-59.net',
      ],
    });

    // NS for gn-yivi-brp-issue-accp
    new Route53.NsRecord(this, 'yivi-issue-brp-accp-ns', {
      zone: this.cspNijmegenZone,
      recordName: 'yivi-brp-accp',
      values: [
        'ns-1592.awsdns-07.co.uk',
        'ns-950.awsdns-54.net',
        'ns-117.awsdns-14.com',
        'ns-1080.awsdns-07.org',
      ],
    });
    new Route53.DsRecord(this, 'yivi-issue-brp-accp-ds', {
      zone: this.cspNijmegenZone,
      recordName: 'yivi-brp-accp',
      values: ['40434 13 2 AEECAE19605EBAD68CCC338B1DC4542EF966F01F108046FEF55365EA51C9C944'],
    });

    // NS for component library development
    new Route53.NsRecord(this, 'component-library-dev-ns', {
      zone: this.cspNijmegenZone,
      recordName: 'component-library-dev',
      values: [
        'ns-1478.awsdns-56.org',
        'ns-1977.awsdns-55.co.uk',
        'ns-563.awsdns-06.net',
        'ns-489.awsdns-61.com',
      ],
    });

    // NS for component library accp
    new Route53.NsRecord(this, 'component-library-accp-ns', {
      zone: this.cspNijmegenZone,
      recordName: 'component-library-accp',
      values: [
        'ns-14.awsdns-01.com',
        'ns-1777.awsdns-30.co.uk',
        'ns-980.awsdns-58.net',
        'ns-1338.awsdns-39.org',
      ],
    });
    new Route53.DsRecord(this, 'component-library-accp-ds', {
      zone: this.cspNijmegenZone,
      recordName: 'component-library-accp',
      values: ['24212 13 2 222EC14F5B430923112AE8F30F8E2B2838E4F4EFA0415CBD5953F2413A9E8CBA'],
    });

    // NS for component library prod
    new Route53.NsRecord(this, 'component-library-prod-ns', {
      zone: this.cspNijmegenZone,
      recordName: 'component-library-prod',
      values: [
        'ns-774.awsdns-32.net',
        'ns-1982.awsdns-55.co.uk',
        'ns-245.awsdns-30.com',
        'ns-1516.awsdns-61.org',
      ],
    });
    new Route53.DsRecord(this, 'component-library-prod-ds', {
      zone: this.cspNijmegenZone,
      recordName: 'component-library-prod',
      values: ['54643 13 2 F9F0AE4D68F8369C67F29039CD407092C8BD36BCFDCDCD5C645F347F2696A739'],
    });


    // Records for gn-yivi-brp-issue-prod
    new Route53.NsRecord(this, 'yivi-brp-issue-prod-ns', {
      zone: this.cspNijmegenZone,
      recordName: 'yivi-brp-prod',
      values: [
        'ns-1844.awsdns-38.co.uk',
        'ns-622.awsdns-13.net',
        'ns-393.awsdns-49.com',
        'ns-1382.awsdns-44.org',
      ],
    });
    new Route53.DsRecord(this, 'yivi-brp-issue-prod-ds', {
      zone: this.cspNijmegenZone,
      recordName: 'yivi-brp-prod',
      values: ['44956 13 2 C6BEDFE472A38F15E70E57E7BC19FBF957A8782351791D33F8D5AFCC4BB28901'],
    });

    // Records for gn-mijn-nijmegen-accp
    new Route53.NsRecord(this, 'gn-mijn-nijmegen-accp-ns', {
      zone: this.cspNijmegenZone,
      recordName: 'mijn-accp',
      values: [
        'ns-537.awsdns-03.net',
        'ns-1239.awsdns-26.org',
        'ns-1762.awsdns-28.co.uk',
        'ns-33.awsdns-04.com',
      ],
    });
    new Route53.DsRecord(this, 'gn-mijn-nijmegen-accp-ds', {
      zone: this.cspNijmegenZone,
      recordName: 'mijn-accp',
      values: ['3766 13 2 0765195063DC586BD83282E5A45DB38957F0B373AC60A9CD86BC5572C89D0D32'],
    });

    // Records for gn-mijn-nijmegen-prod
    new Route53.NsRecord(this, 'gn-mijn-nijmegen-prod-ns', {
      zone: this.cspNijmegenZone,
      recordName: 'mijn-prod',
      values: [
        'ns-294.awsdns-36.com',
        'ns-1239.awsdns-26.org',
        'ns-1797.awsdns-32.co.uk',
        'ns-817.awsdns-38.net',
      ],
    });
    new Route53.DsRecord(this, 'gn-mijn-nijmegen-prod-ds', {
      zone: this.cspNijmegenZone,
      recordName: 'mijn-prod',
      values: ['40951 13 2 75831193C203C098232688B284C380E298379240E8B0FC8BA756CFC87CB01A83'],
    });

    // Records for gn-webforms-dev
    this.addNsAndDsRecordForAccount(
      'webforms-dev',
      '36053 13 2 F80E20F889B11284C496C648135A741E2750C86DBE33674F92BC6F849F9DC26E',
      [
        'ns-1551.awsdns-01.co.uk',
        'ns-957.awsdns-55.net',
        'ns-1195.awsdns-21.org',
        'ns-462.awsdns-57.com',
      ],
    );

    // Records for gn-webforms-accp
    this.addNsAndDsRecordForAccount(
      'webforms-accp',
      '42916 13 2 962AA54560426E60B2E50B51C20A307628A9A9F115BD5BA975D276DDA64E478E',
      [
        'ns-924.awsdns-51.net',
        'ns-342.awsdns-42.com',
        'ns-1662.awsdns-15.co.uk',
        'ns-1459.awsdns-54.org',
      ],
    );

    // Records for gn-webforms-prod
    this.addNsAndDsRecordForAccount(
      'webforms-prod',
      '61528 13 2 5DE8105D37D2B2D11723D39D6DCAA77F44091FA238FE27FE071B8B01989D5400',
      [
        'ns-110.awsdns-13.com',
        'ns-926.awsdns-51.net',
        'ns-1630.awsdns-11.co.uk',
        'ns-1149.awsdns-15.org',
      ],
    );

    // Records for gn-static-websites
    this.addNsAndDsRecordForAccount(
      'static-websites',
      '15811 13 2 860EDBF1CFC5B08A77A4AF68991778F0F834709542B5631819E514C5577929E1',
      [
        'ns-624.awsdns-14.net',
        'ns-1319.awsdns-36.org',
        'ns-1942.awsdns-50.co.uk',
        'ns-44.awsdns-05.com',
      ],
    );

    // Records for gn-verwerkingenlogging-accp
    this.addNsAndDsRecordForAccount(
      'vwlog-accp',
      '44316 13 2 7F2297C399C89F16DB0A8E62BA3869093C9EA3EAD6FF4AD485AABBB2459F674A',
      [
        'ns-687.awsdns-21.net',
        'ns-274.awsdns-34.com',
        'ns-1704.awsdns-21.co.uk',
        'ns-1298.awsdns-34.org',
      ],
    );

    // Records for gn-verwerkingenlogging-prod
    this.addNsAndDsRecordForAccount(
      'vwlog-prod',
      '6171 13 2 4B4A9A57980062B81267EBD6190D892D405A80C816888FCF3D7ED6E5CE2DE9CF',
      [
        'ns-219.awsdns-27.com',
        'ns-1294.awsdns-33.org',
        'ns-1983.awsdns-55.co.uk',
        'ns-515.awsdns-00.net',
      ],
    );

    // Records for sandbox-marnix
    new Route53.NsRecord(this, 'gn-sandbox-marnix-ns', {
      zone: this.cspNijmegenZone,
      recordName: 'sandbox-marnix',
      values: [
        'ns-553.awsdns-05.net',
        'ns-1583.awsdns-05.co.uk',
        'ns-1109.awsdns-10.org',
        'ns-476.awsdns-59.com',
      ],
    });
    // Records for sandbox-01
    new Route53.NsRecord(this, 'gn-sandbox-01-ns', {
      zone: this.cspNijmegenZone,
      recordName: 'sandbox-01',
      values: [
        'ns-2004.awsdns-58.co.uk',
        'ns-1346.awsdns-40.org',
        'ns-952.awsdns-55.net',
        'ns-259.awsdns-32.com',
      ],
    });

    // Records for webform-submission-storage-dev
    new Route53.NsRecord(this, 'gn-webform-submission-storage-dev-ns', {
      zone: this.cspNijmegenZone,
      recordName: 'submissionstorage-dev',
      values: [
        'ns-2004.awsdns-58.co.uk',
        'ns-1346.awsdns-40.org',
        'ns-952.awsdns-55.net',
        'ns-259.awsdns-32.com',
      ],
    });
    // Records for webform-submission-storag-prod
    new Route53.NsRecord(this, 'gn-webform-submission-storag-prod-ns', {
      zone: this.cspNijmegenZone,
      recordName: 'submissionstorage-prod',
      values: [
        'ns-1374.awsdns-43.org',
        'ns-1565.awsdns-03.co.uk',
        'ns-997.awsdns-60.net',
        'ns-257.awsdns-32.com',
      ],
    });

  }

  addNsAndDsRecordForAccount(name: string, dsValue: string, nsValues: string[]) {
    new Route53.NsRecord(this, `gn-${name}-ns`, {
      zone: this.cspNijmegenZone,
      recordName: name,
      values: nsValues,
    });
    new Route53.DsRecord(this, `gn-${name}-ds`, {
      zone: this.cspNijmegenZone,
      recordName: name,
      values: [dsValue],
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
