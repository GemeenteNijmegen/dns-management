import { Environment, Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DnsStack } from './DnsStack';

export interface DnsStageProps extends StageProps {
  name: string;
  cspRootEnvironment: Environment;
}

export class DnsStage extends Stage {
  constructor(scope: Construct, id: string, props: DnsStageProps) {
    super(scope, id, props);

    if (props.cspRootEnvironment.account == undefined) {
      throw 'Account reference to csp root hosted zone account is empty, can not deploy subzones.';
    }

    new DnsStack(this, 'stack', {
      productionAccount: props.cspRootEnvironment.account,
      rootZoneName: 'csp-nijmegen.nl',
      subzoneName: props.name,
    });

  }
}