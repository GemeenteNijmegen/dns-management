import { Environment, Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DnsSecStack } from './DnsSecStack';
import { DnsStack } from './DnsStack';

export interface AccountStageProps extends StageProps {
  name: string;
  cspRootEnvironment: Environment;
  deployDnsStack: boolean;
  enableDnsSec: boolean;
  deployDnsSecKmsKey: boolean;
  registerInCspNijmegenRoot: boolean;
}

export class AccountStage extends Stage {
  constructor(scope: Construct, id: string, props: AccountStageProps) {
    super(scope, id, props);

    // Deploy a hosted zone (sub domain of csp-nijmegen.nl)
    if (props.deployDnsStack) {
      if (props.cspRootEnvironment.account == undefined) {
        throw 'Account reference to csp root hosted zone account is empty, can not deploy subzones.';
      }
      new DnsStack(this, 'stack', {
        productionAccount: props.cspRootEnvironment.account,
        rootZoneName: 'csp-nijmegen.nl',
        subzoneName: props.name,
        registerInCspNijmegenRoot: props.registerInCspNijmegenRoot,
      });

    }

    // KMS key used for dnssec (must be in us-east-1)
    if (props.deployDnsSecKmsKey) {
      new DnsSecStack(this, 'dnssec-stack', {
        env: { region: 'us-east-1' },
        enableDnsSec: props.enableDnsSec,
        useSecondaryParameter: false,
      });
    }


  }
}