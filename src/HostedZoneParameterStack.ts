import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { RemoteParameters } from 'cdk-remote-stack';
import { Construct } from 'constructs';
import { SubdomainConfigurable, SubdomainConfiguration } from './DnsConfiguration';
import { Statics } from './Statics';

interface HostedZoneParameterStackProps extends StackProps, SubdomainConfigurable {}

export class HostedZoneParameterStack extends Stack {
  constructor(scope: Construct, id: string, props: HostedZoneParameterStackProps) {
    super(scope, id);

    const importedHostedZoneParameters = this.importSubHostedzone(props.subdomainConfiguration);
    this.createHostedZoneParameters(importedHostedZoneParameters);
  }

  private importSubHostedzone(configuration: SubdomainConfiguration) {
    // Import the hosted zone id from target region
    const parameters = new RemoteParameters(this, 'hosted-zone-parameters', {
      path: Statics.envRootHostedZonePath,
      region: configuration.environment.region ?? 'eu-central-1',
      timeout: Duration.seconds(10),
    });
    return parameters;
  }

  private createHostedZoneParameters(parameters: RemoteParameters) {
    // Export hostedzone properties for other projects in this account
    new StringParameter(this, 'csp-sub-hostedzone-id', {
      stringValue: parameters.get(Statics.envRootHostedZoneId),
      parameterName: Statics.envRootHostedZoneId,
    });
    new StringParameter(this, 'csp-sub-hostedzone-name', {
      stringValue: parameters.get(Statics.envRootHostedZoneName),
      parameterName: Statics.envRootHostedZoneName,
    });
  }
}
