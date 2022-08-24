import {
  Stack, StackProps, Stage,
  aws_ssm as SSM,
  aws_route53 as route53,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Statics } from './Statics';

export class TempAuthAccpStage extends Stage {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new TempAuthAccpStack(this, 'stack');

  }
}

class TempAuthAccpStack extends Stack {

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Import parameters
    const zoneId = SSM.StringParameter.valueForStringParameter(this, Statics.envRootHostedZoneId);
    const zoneName = SSM.StringParameter.valueForStringParameter(this, Statics.envRootHostedZoneName);

    // Import the hosted zone
    const zone = route53.HostedZone.fromHostedZoneAttributes(this, 'auth-accp', {
      hostedZoneId: zoneId,
      zoneName: zoneName,
    });

    // SET ALL RECORDS FROM accp.csp-nijmegen.nl

    // CNAME
    const records = {
      '3xlz53dmt3zuw7c6ysgefzqxuolur67c._domainkey': '3xlz53dmt3zuw7c6ysgefzqxuolur67c.dkim.amazonses.com',
      '46sti3uiiwhlf5jyx4aomika3ialqdge._domainkey': '46sti3uiiwhlf5jyx4aomika3ialqdge.dkim.amazonses.com',
      '56vtuueqzg2ijey4dw2lnbkvt4panczi._domainkey': '56vtuueqzg2ijey4dw2lnbkvt4panczi.dkim.amazonses.com',
      '_f73d66ee2c385b8dfc18ace27cb99644': undefined, // Remove and add in mijn-nijmegen
      '_f7efe25b3a753b7b4054d2dba93a343b': undefined, // Remove and add in mijn-nijmegen
      '_bf008ac0ff1608c2d3082c770eb5539a.alb-formio': '_f28bed12396f97700c8d3c73c480103f.ymrbdtpxcr.acm-validations.aws.',
      '_5d368958058b44ba284131f021902115.alb': '_96a878fe56c1fd24fe313ce09bdc5502.jddtvkljgg.acm-validations.aws.',
      '_c2816d074a2b9857b019d409aeb78d89.api': '_f657a0c31631aa853b4130713b9d6277.xrchbtpdjs.acm-validations.aws.',
      '_458de0805c94cb5aeb2efe2fe2e0b611.cdn': '_70f0b0503bf9764820feeadf2d47c4cc.mvtxpqxpkb.acm-validations.aws.',
      '_517eba062406f4752e6a289919e52736.eform-api': '_6579f79c4b5615eed5e6e1c4509ee5f9.hcxvpdkkrx.acm-validations.aws.',
      '_98164383e83967b046f7777254ff1046.form-dashboard': '_82b4ec1647a5c30dc288010aeecafd3f.jddtvkljgg.acm-validations.aws.',
      '_ea5d26bd57851b877792e51e002b7f80.form': '_f44edda69cd730c76a6f155fd27494ee.jddtvkljgg.acm-validations.aws.',
      '_859607f90d21b7dc4baefd691342ff37.csp-nijmegen.nl': 'eacbeb67b92c42efa3bfb148a847be8c.682b5c12a9f4cdf42dde19f6323900ee.comodoca.com.', // Doen deze echt iets?
      '_fe679386e9d233d59f58a9cb7d00ca77.csp-nijmegen.nl': '03eb57d71e04544096bac14ce41431fa.058306850a8780ce3af8d4347102606b.comodoca.com.', // Doen deze echt iets?
      '_fcd07d4902fcaf85f9265a98c092d53a.tokenapi': '_a58554621ab703b501bec23b454fec1d.xtsdcrbgyf.acm-validations.aws.',
    };

    /**
     * Niet de meest handige oplossing nu er records niet meer toegevoegd moeten worden...
     */
    var index = 1;
    for (const [key, value] of Object.entries(records)) {
      if (value != undefined) {
        new route53.CnameRecord(this, `record-${index}`, {
          domainName: value,
          zone: zone,
          recordName: key,
        });
      }
      index += 1;
    }

    // TXT
    new route53.TxtRecord(this, 'txt-1', {
      zone,
      recordName: '_amazonses',
      values: ['xqpycmCq5LNMS2Vodqpw+IZpacM8NqyeuIM6dX2y0/I='],
    });
    new route53.TxtRecord(this, 'txt-2', {
      zone,
      recordName: 'mail',
      values: ['v=spf1 include:amazonses.com ~all'],
    });

    // MX
    new route53.MxRecord(this, 'mx-1', {
      zone,
      recordName: 'mail',
      values: [{
        hostName: 'feedback-smtp.eu-west-1.amazonses.com',
        priority: 10,
      }],
    });

  }

}