import { Aspects, Environment, Stage, StageProps } from 'aws-cdk-lib';
import { AwsSolutionsChecks } from 'cdk-nag';
import { Construct } from 'constructs';
import { DnsSecStack } from './DnsSecStack';
import { DnsStack } from './DnsStack';

export interface AccountStageProps extends StageProps {
  name: string;
  cspRootEnvironment: Environment;
  deployDnsStack: boolean;
  deployDnsSecKmsKey: boolean;
}

export class AccountStage extends Stage {
  constructor(scope: Construct, id: string, props: AccountStageProps) {
    super(scope, id, props);

    // Deploy a hosted zone (sub domain of csp-nijmegen.nl)
    if (props.deployDnsStack) {
      if (props.cspRootEnvironment.account == undefined) {
        throw 'Account reference to csp root hosted zone account is empty, can not deploy subzones.';
      }
      const dns = new DnsStack(this, 'stack', {
        productionAccount: props.cspRootEnvironment.account,
        rootZoneName: 'csp-nijmegen.nl',
        subzoneName: props.name,
      });

      Aspects.of(dns).add(new AwsSolutionsChecks());
    }

    // KMS key used for dnssec (must be in us-east-1)
    if (props.deployDnsSecKmsKey) {
      const dnssec = new DnsSecStack(this, 'dnssec-stack', {
        env: { region: 'us-east-1' },
      });
      Aspects.of(dnssec).add(new AwsSolutionsChecks());
    }


  }
}