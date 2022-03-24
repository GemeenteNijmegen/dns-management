import * as cdk from 'aws-cdk-lib';
import { aws_ssm as SSM, aws_route53 as Route53 } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Statics } from './Statics';
import { SubHostedZone } from './SubHostedZone';

export interface CspSubzoneStackProps extends cdk.StackProps {
  subzoneName: string;
}

export class CspSubzoneStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CspSubzoneStackProps) {
    super(scope, id, props);

    // Get the csp-nijmegen.nl hosted zone  
    const rootZoneId = SSM.StringParameter.fromStringParameterName(this, 'csp-root-zone-id', Statics.cspNijmegenHostedZoneId);
    const rootZoneName = SSM.StringParameter.fromStringParameterName(this, 'csp-root-zone-name', Statics.cspNijmegenHostedZoneName);
    const cspRootZone = Route53.HostedZone.fromHostedZoneAttributes(this, 'csp-zone', {
      hostedZoneId: rootZoneId.stringValue,
      zoneName: rootZoneName.stringValue,
    });

    // Construct the sub hosted zone
    const cspSubzone = new SubHostedZone(this, 'subzone', {
      parentZone: cspRootZone,
      subZoneName: props.subzoneName,
    });

    // Store in parameters for other projects to find this hostedzone
    new SSM.StringParameter(this, 'csp-sub-hostedzone-id', {
      stringValue: cspSubzone.hostedZoneId,
      parameterName: Statics.envRootHostedZoneId,
    });
    new SSM.StringParameter(this, 'csp-sub-hostedzone-name', {
      stringValue: cspSubzone.zoneName,
      parameterName: Statics.envRootHostedZoneName,
    });

  }

}
