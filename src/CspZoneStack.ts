import * as cdk from 'aws-cdk-lib';
import { aws_ssm as SSM, aws_route53 as Route53, Tags, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Statics } from './Statics';

export class CspZoneStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    Tags.of(this).add('cdkManaged', 'yes');
    Tags.of(this).add('Project', Statics.projectName);

    /**
     * Currently only sets the parameters to be account generic
     * evantually we need to replace the import below with an actual
     * PublicHostedZone. However csp-nijmegen is currently managed in the
     * webformulieren repository.
     */
    const rootZoneId = SSM.StringParameter.valueForStringParameter(this, Statics.cspRootHostedZoneId);
    const rootZoneName = SSM.StringParameter.valueForStringParameter(this, Statics.cspRootHostedZoneName);
    const cspRootZone = Route53.HostedZone.fromHostedZoneAttributes(this, 'cspzone', {
      hostedZoneId: rootZoneId,
      zoneName: rootZoneName,
    });

    // Store in parameters for other projects to find this hostedzone
    new SSM.StringParameter(this, 'csp-sub-hostedzone-id', {
      stringValue: cspRootZone.hostedZoneId,
      parameterName: Statics.envRootHostedZoneId,
    });
    new SSM.StringParameter(this, 'csp-sub-hostedzone-name', {
      stringValue: cspRootZone.zoneName,
      parameterName: Statics.envRootHostedZoneName,
    });

  }

}
