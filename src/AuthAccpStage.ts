import {
  Stack, StackProps, Stage,
  aws_ssm as SSM,
  aws_route53 as route53,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Statics } from './Statics';

export class AuthAccpStage extends Stage {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new AuthAccpStack(this, 'stack');

  }
}

export class AuthAccpStack extends Stack {

  private zone: route53.IHostedZone;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Import parameters
    const zoneId = SSM.StringParameter.valueForStringParameter(this, Statics.envRootHostedZoneId);
    const zoneName = SSM.StringParameter.valueForStringParameter(this, Statics.envRootHostedZoneName);
    // Import the hosted zone
    this.zone = route53.HostedZone.fromHostedZoneAttributes(this, 'auth-accp', {
      hostedZoneId: zoneId,
      zoneName: zoneName,
    });

    // Setup mailing from accp.csp-nijmegen.nl
    this.setupMailRecords();

  }

  /**
   * Setup ses for accp.csp-nijmegen.nl in auth-prod
   */
  setupMailRecords() {

    // DKIM records (domain validation)
    new route53.CnameRecord(this, 'record-1', {
      zone: this.zone,
      recordName: '3xlz53dmt3zuw7c6ysgefzqxuolur67c._domainkey',
      domainName: '3xlz53dmt3zuw7c6ysgefzqxuolur67c.dkim.amazonses.com',
    });
    new route53.CnameRecord(this, 'record-2', {
      zone: this.zone,
      recordName: '46sti3uiiwhlf5jyx4aomika3ialqdge._domainkey',
      domainName: '46sti3uiiwhlf5jyx4aomika3ialqdge.dkim.amazonses.com',
    });
    new route53.CnameRecord(this, 'record-3', {
      zone: this.zone,
      recordName: '56vtuueqzg2ijey4dw2lnbkvt4panczi._domainkey',
      domainName: '56vtuueqzg2ijey4dw2lnbkvt4panczi.dkim.amazonses.com',
    });

    // Set up mail from using this txt and mx record
    new route53.TxtRecord(this, 'txt-2', {
      zone: this.zone,
      recordName: 'mail',
      values: ['v=spf1 include:amazonses.com ~all'],
    });
    new route53.MxRecord(this, 'mx-1', {
      zone: this.zone,
      recordName: 'mail',
      values: [{
        hostName: 'feedback-smtp.eu-west-1.amazonses.com',
        priority: 10,
      }],
    });
  }

}