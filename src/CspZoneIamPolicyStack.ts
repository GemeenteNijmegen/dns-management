import * as cdk from 'aws-cdk-lib';
import { aws_iam as IAM, aws_route53 as Route53, aws_ssm as SSM } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Statics } from './Statics';
import { ISubdomain } from './ISubdomain';


export interface CspZoneIamPolicyStackProps extends cdk.StackProps {
    accountIdsToDelegateCspManagementTo: ISubdomain[];   
}

export class CspZoneIamPolicyStack extends cdk.Stack {

    data: ISubdomain[];
    rootZoneId: string;
    rootZoneName: string;

    constructor(scope: Construct, id: string, props: CspZoneIamPolicyStackProps) {
        super(scope, id);

        this.data = props.accountIdsToDelegateCspManagementTo;

        // Get the csp-nijmegen.nl hosted zone
        this.rootZoneId = SSM.StringParameter.fromStringParameterName(this, 'csp-root-zone-id', Statics.envRootHostedZoneIdOld).stringValue;
        this.rootZoneName = SSM.StringParameter.fromStringParameterName(this, 'csp-root-zone-name', Statics.envRootHostedZoneNameOld).stringValue;        
        const cspNijmegenZone = Route53.HostedZone.fromHostedZoneAttributes(this, 'csp-zone', {
            hostedZoneId: this.rootZoneId,
            zoneName: this.rootZoneName,
        });

        // Enable delegation to each of the provided account ids
        props.accountIdsToDelegateCspManagementTo.forEach( (subdomain, index) => {
            if (subdomain.environment.account == undefined){
                throw 'Empty account provided, could not delegate as no account id is found.';
            }
            let role = this.enableDelegationToAccount(cspNijmegenZone, subdomain.environment.account, index);
            this.data[index].delegationRole = role;
        });

    }


    enableDelegationToAccount(rootZone: Route53.IHostedZone, account: string, index: number) {
        return new IAM.Role(this, `csp-nijmegen-delegation-${index}-role`, {
            assumedBy: new IAM.AccountPrincipal(account),
            inlinePolicies: {
                "delegation": new IAM.PolicyDocument({
                    statements: [new IAM.PolicyStatement({
                        actions: ["route53:ChangeResourceRecordSets"],
                        resources: [rootZone.hostedZoneArn]
                    })]
                })
            }
        });
    }

}