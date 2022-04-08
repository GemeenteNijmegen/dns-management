import { Environment, Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SubzoneStack } from './SubzoneStack';

export interface DnsStageProps extends StageProps {
  cspRootEnvironment: Environment;
  sandbox: Environment;
}

export class DnsStage extends Stage {
  constructor(scope: Construct, id: string, props: DnsStageProps) {
    super(scope, id, props);

    if (props.cspRootEnvironment.account == undefined) {
      throw 'Account reference to csp root hosted zone account is empty, can not deploy subzones.';
    }

    // sandbox.csp-nijmegen.nl
    new SubzoneStack(this, 'sandbox-csp-nijmegen-stack', {
      env: props.sandbox,
      productionAccount: props.cspRootEnvironment.account,
      rootZoneName: 'csp-nijmegen.nl',
      subzoneName: 'sandbox',
    });

    /*
    TODO: Add other subdomains, for example:
      dev.csp-nijmegen.nl
      accp.csp-nijmegen.nl
        new SubzoneStack(this, 'accp-csp-nijmegen-stack', {
          env: props.acceptance,
          productionAccount: props.cspRootEnvironment.account,
          rootZoneName: 'csp-nijmegen.nl',
          subzoneName: 'accp',
        });
    */

  }
}