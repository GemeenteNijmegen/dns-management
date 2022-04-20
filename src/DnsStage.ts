import { Environment, Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SubzoneStack } from './SubzoneStack';

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

    new SubzoneStack(this, 'account-csp-nijmegen-stack', {
      productionAccount: props.cspRootEnvironment.account,
      rootZoneName: 'csp-nijmegen.nl',
      subzoneName: props.name,
    });

  }
}