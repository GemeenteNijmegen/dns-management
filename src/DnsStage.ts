import { Environment, Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CspZoneIamPolicyStack } from './CspZoneIamPolicyStack';
import { SubzoneStack } from './SubzoneStack';

export interface DnsStageProps extends StageProps {
  production: Environment;
  sandbox: Environment;
}

export class DnsStage extends Stage {
  constructor(scope: Construct, id: string, props: DnsStageProps) {
    super(scope, id, props);

    // Iam policies for delegation
    new CspZoneIamPolicyStack(this, 'csp-dns-iam-policy-stack', {
      env: props.production, // Lives in the production environment as does the csp-nijmegen.nl hosted zone for which we want to delegate
      sandbox: props.sandbox,
    });

    if (props.production.account == undefined) {
      throw 'Production account reference is empty can not deploy subzones';
    }

    // sandbox.csp-nijmegen.nl
    new SubzoneStack(this, 'sandbox-csp-nijmegen-stack', {
      env: props.sandbox,
      productionAccount: props.production.account,
      rootZoneName: 'csp-nijmegen.nl',
      subzoneName: 'sandbox',
    });

    // TODO: Add other subdomains, for example:
    //      accp.csp-nijmegen.nl
    //      dev.csp-nijmegen.nl

  }
}