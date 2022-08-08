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
      '3xlz53dmt3zuw7c6ysgefzqxuolur67c._domainkey.accp.csp-nijmegen.nl': '3xlz53dmt3zuw7c6ysgefzqxuolur67c.dkim.amazonses.com',
      '46sti3uiiwhlf5jyx4aomika3ialqdge._domainkey.accp.csp-nijmegen.nl': '46sti3uiiwhlf5jyx4aomika3ialqdge.dkim.amazonses.com',
      '56vtuueqzg2ijey4dw2lnbkvt4panczi._domainkey.accp.csp-nijmegen.nl': '56vtuueqzg2ijey4dw2lnbkvt4panczi.dkim.amazonses.com',
      '_f73d66ee2c385b8dfc18ace27cb99644.accp.csp-nijmegen.nl': '2e45a999777f5fe42487a28040c9c926.897f69591e347cfdce9e9d66193f750d.comodoca.com.',
      '_f7efe25b3a753b7b4054d2dba93a343b.accp.csp-nijmegen.nl': '1865949c9e0474591398be17540a8383.626b224344a3e3acc3b0f4b67b2a52d3.comodoca.com.',
      '_bf008ac0ff1608c2d3082c770eb5539a.alb-formio.accp.csp-nijmegen.nl': '_f28bed12396f97700c8d3c73c480103f.ymrbdtpxcr.acm-validations.aws.',
      '_5d368958058b44ba284131f021902115.alb.accp.csp-nijmegen.nl': '_96a878fe56c1fd24fe313ce09bdc5502.jddtvkljgg.acm-validations.aws.',
      '_c2816d074a2b9857b019d409aeb78d89.api.accp.csp-nijmegen.nl': '_f657a0c31631aa853b4130713b9d6277.xrchbtpdjs.acm-validations.aws.',
      '_458de0805c94cb5aeb2efe2fe2e0b611.cdn.accp.csp-nijmegen.nl': '_70f0b0503bf9764820feeadf2d47c4cc.mvtxpqxpkb.acm-validations.aws.',
      '_517eba062406f4752e6a289919e52736.eform-api.accp.csp-nijmegen.nl': '_6579f79c4b5615eed5e6e1c4509ee5f9.hcxvpdkkrx.acm-validations.aws.',
      '_98164383e83967b046f7777254ff1046.form-dashboard.accp.csp-nijmegen.nl': '_82b4ec1647a5c30dc288010aeecafd3f.jddtvkljgg.acm-validations.aws.',
      '_ea5d26bd57851b877792e51e002b7f80.form.accp.csp-nijmegen.nl': '_f44edda69cd730c76a6f155fd27494ee.jddtvkljgg.acm-validations.aws.',
      '_859607f90d21b7dc4baefd691342ff37.csp-nijmegen.nl.accp.csp-nijmegen.nl': 'eacbeb67b92c42efa3bfb148a847be8c.682b5c12a9f4cdf42dde19f6323900ee.comodoca.com.',
      '_fe679386e9d233d59f58a9cb7d00ca77.csp-nijmegen.nl.accp.csp-nijmegen.nl': '03eb57d71e04544096bac14ce41431fa.058306850a8780ce3af8d4347102606b.comodoca.com.',
      '_fcd07d4902fcaf85f9265a98c092d53a.tokenapi.accp.csp-nijmegen.nl': '_a58554621ab703b501bec23b454fec1d.xtsdcrbgyf.acm-validations.aws.',
    };

    var index = 1;
    for (const [key, value] of Object.entries(records)) {
      new route53.CnameRecord(this, `record-${index}`, {
        domainName: value,
        zone: zone,
        recordName: key,
      });
      index += 1;
    }

    // TXT
    new route53.TxtRecord(this, 'txt-1', {
      zone,
      recordName: '_amazonses.accp.csp-nijmegen.nl',
      values: ['xqpycmCq5LNMS2Vodqpw+IZpacM8NqyeuIM6dX2y0/I='],
    });
    new route53.TxtRecord(this, 'txt-2', {
      zone,
      recordName: 'mail.accp.csp-nijmegen.nl',
      values: ['v=spf1 include:amazonses.com ~all'],
    });

    // DS
    // new route53.DsRecord(this, 'ds-1', {
    //  zone,
    //  recordName: 'mijn.accp.csp-nijmegen.nl',
    //  values: ['52561 13 2 90CF3C35FDDC30AF42FB4BCCDCCB1123500050D70F1D4886D6DE25502F3BC50A'],
    // });

    // MX
    new route53.MxRecord(this, 'mx-1', {
      zone,
      recordName: 'mail.accp.csp-nijmegen.nl',
      values: [{
        hostName: 'feedback-smtp.eu-west-1.amazonses.com',
        priority: 10,
      }],
    });

    // NS
    new route53.NsRecord(this, 'ns', {
      zone,
      recordName: 'mijn.accp.csp-nijmegen.nl',
      values: [
        'ns-1525.awsdns-62.org',
        'ns-1916.awsdns-47.co.uk',
        'ns-312.awsdns-39.com',
        'ns-632.awsdns-15.net',
      ],
    });

  }

}