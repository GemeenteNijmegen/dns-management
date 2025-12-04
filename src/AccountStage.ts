import { PermissionsBoundaryAspect } from '@gemeentenijmegen/aws-constructs';
import { Aspects, Stack, Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Configurable } from './Configuration';
import { SubdomainConfigurable } from './DnsConfiguration';
import { DnsSecStack } from './DnsSecStack';
import { DnsStack } from './DnsStack';
import { HostedZoneParameterStack } from './HostedZoneParameterStack';

export interface AccountStageProps extends StageProps, SubdomainConfigurable, Configurable {
}

export class AccountStage extends Stage {

  private dnsStack?: DnsStack;
  private dnssecStack?: DnsSecStack;

  constructor(scope: Construct, id: string, props: AccountStageProps) {
    super(scope, id, props);

    Aspects.of(this).add(new PermissionsBoundaryAspect());

    if (props.configuration.toplevelHostedzoneEnvironment.account == undefined) {
      throw 'Account reference to csp root hosted zone account is empty, can not deploy subzones.';
    }

    // Deploy a hosted zone (subdomain of the toplevel domain)
    this.dnsStack = new DnsStack(this, 'stack', {
      configuration: props.configuration,
      subdomainConfiguration: props.subdomainConfiguration,
    });

    if (props.subdomainConfiguration.additionalRegions) {
      for (let additionalRegion of props.subdomainConfiguration.additionalRegions) {
        const paramStack = new HostedZoneParameterStack(this, `hostedzoneparams-${additionalRegion}`, {
          subdomainConfiguration: props.subdomainConfiguration,
          env: { region: additionalRegion },
        });
        paramStack.addDependency(this.dnsStack);
      };
    }

    // KMS key used for dnssec (must be in us-east-1)
    if (props.subdomainConfiguration.enableDnsSec) {
      if (props.configuration.toplevelHostedzoneEnvironment.region == undefined) {
        throw 'Region reference to csp root hosted zone account is empty, can not deploy dnssec stack.';
      }

      this.dnssecStack = new DnsSecStack(this, 'dnssec-stack', {
        env: { region: 'us-east-1' },
        configuration: props.configuration,
        subdomainConfiguration: props.subdomainConfiguration,
      });

      this.dnssecStack.addDependency(this.dnsStack);
    }
  }
}
