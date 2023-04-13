import { PermissionsBoundaryAspect } from '@gemeentenijmegen/aws-constructs';
import { Aspects, Environment, Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DnsSecStack } from './DnsSecStack';
import { DnsStack } from './DnsStack';

export interface AccountStageProps extends StageProps {
  name: string;
  dnsRootEnvironment: Environment;
  deployDnsStack: boolean;
  enableDnsSec: boolean;
  deployDnsSecKmsKey: boolean;
  registerInCspNijmegenRoot: boolean;
}

export class AccountStage extends Stage {

  private dnsStack?: DnsStack;
  private dnssecStack?: DnsSecStack;

  constructor(scope: Construct, id: string, props: AccountStageProps) {
    super(scope, id, props);

    Aspects.of(this).add(new PermissionsBoundaryAspect());


    // Deploy a hosted zone (sub domain of csp-nijmegen.nl)
    if (props.deployDnsStack) {
      if (props.dnsRootEnvironment.account == undefined) {
        throw 'Account reference to csp root hosted zone account is empty, can not deploy subzones.';
      }
      this.dnsStack = new DnsStack(this, 'stack', {
        dnsRootAccount: props.dnsRootEnvironment.account,
        rootZoneName: 'csp-nijmegen.nl',
        subzoneName: props.name,
        registerInCspNijmegenRoot: props.registerInCspNijmegenRoot,
      });

    }

    // KMS key used for dnssec (must be in us-east-1)
    if (props.deployDnsSecKmsKey) {
      if (props.dnsRootEnvironment.region == undefined) {
        throw 'Region reference to csp root hosted zone account is empty, can not deploy dnssec stack.';
      }
      this.dnssecStack = new DnsSecStack(this, 'dnssec-stack', {
        env: { region: 'us-east-1' },
        enableDnsSec: props.enableDnsSec,
        lookupHostedZoneInRegion: props.dnsRootEnvironment.region,
      });
    }

    // Set the correct dependency
    if (this.dnsStack != undefined && this.dnssecStack != undefined) {
      this.dnssecStack.addDependency(this.dnsStack);
    }


  }
}