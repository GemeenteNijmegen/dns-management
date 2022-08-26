import {
  Stack, StackProps, Stage,
  aws_ssm as SSM,
  aws_route53 as route53,
  Duration,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Statics } from './Statics';

export class TempAuthProdStage extends Stage {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new TempAuthProdStack(this, 'stack');

  }
}

class TempAuthProdStack extends Stack {

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Import parameters
    const zoneId = SSM.StringParameter.valueForStringParameter(this, Statics.cspRootHostedZoneId);
    const zoneName = SSM.StringParameter.valueForStringParameter(this, Statics.cspRootHostedZoneName);

    // Import the hosted zone
    const oldCspZone = route53.HostedZone.fromHostedZoneAttributes(this, 'auth-prod', {
      hostedZoneId: zoneId,
      zoneName: zoneName,
    });

    // Add records that should stay in the old csp-nijmegen.nl hosted zone when changing accout hosted zone in mijn-nijmegen
    new route53.NsRecord(this, 'ns-record', {
      zone: oldCspZone,
      values: [
        'ns-674.awsdns-20.net',
        'ns-1880.awsdns-43.co.uk',
        'ns-1091.awsdns-08.org',
        'ns-160.awsdns-20.com',
      ],
      recordName: 'mijn',
    });

    // Mijn.csp-nijmegen.nl csp validation record
    new route53.DsRecord(this, 'ds-record', {
      zone: oldCspZone,
      recordName: 'mijn',
      values: ['60066 13 2 932CD585B029E674E17C4C33DFE7DE2C84353ACD8C109760FD17A6CDBD0CF3FA'],
      ttl: Duration.seconds(600),
    });


  }

}