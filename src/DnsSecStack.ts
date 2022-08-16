import * as cdk from 'aws-cdk-lib';
import { aws_ssm as SSM, Tags, aws_iam as IAM, aws_kms as KMS, aws_route53 as route53 } from 'aws-cdk-lib';
import { RemoteParameters } from 'cdk-remote-stack';
import { Construct } from 'constructs';
import { Statics } from './Statics';

export interface DnsSecStackProps extends cdk.StackProps {
  /**
   * If this stack is created it creats a KSM key
   * set this to true to import the account hosted zone and enable dnssec on it
   */
  enableDnsSec: boolean;

  //Temp secondary parameter
  useSecondaryParameter: boolean;
}

export class DnsSecStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props: DnsSecStackProps) {
    super(scope, id, props);

    Tags.of(this).add('cdkManaged', 'yes');
    Tags.of(this).add('Project', Statics.projectName);

    // Create the (expensive $) key
    const dnssecKey = this.addDNSSecKey(Statics.accountDnsSecKmsKeyAlias);

    // Store the key arn in a parameter for use in other projects
    //   (note that this parmeter is in us-east-1)
    if (props.useSecondaryParameter) { // TODO remove after prod.csp-nijmegen.nl is in production
      new SSM.StringParameter(this, 'account-dnssec-kms-key-arn-moving', {
        stringValue: dnssecKey.keyArn,
        parameterName: Statics.accountDnsSecKmsKey + '/moving',
      });
    } else {
      new SSM.StringParameter(this, 'account-dnssec-kms-key-arn', { // Prevent this param from existing when using secondary param
        stringValue: dnssecKey.keyArn,
        parameterName: Statics.accountDnsSecKmsKey,
      });
    }

    if (props.enableDnsSec) {
      this.enableDnsSecForAccountRootZone(dnssecKey.keyArn);
    }

  }

  /**
   * Enable DNSSEC usign the KMS key from this stack for the account root hosted zone.
   * @param keyArn
   */
  enableDnsSecForAccountRootZone(keyArn: string) {

    // Import the hosted zone id from eu-west-1
    const parameters = new RemoteParameters(this, 'hosted-zone-parameters', {
      path: Statics.envRootHostedZonePath,
      region: 'eu-west-1',
    });
    const hostedZoneId = parameters.get(Statics.envRootHostedZoneId);

    // Create a ksk for the hosted zone
    const ksk = new route53.CfnKeySigningKey(this, 'account-ksk', {
      hostedZoneId: hostedZoneId,
      keyManagementServiceArn: keyArn,
      name: 'account_dnssec_ksk',
      status: 'ACTIVE',
    });

    // Enable dnssec in the hosted zone
    const dnssec = new route53.CfnDNSSEC(this, 'account-dnssec', {
      hostedZoneId,
    });

    // Make sure the ksk exists before enabling dnssec
    dnssec.addDependsOn(ksk);

  }

  /**
   * Constructs a key using KMS
   * @returns the newy kms key
   */
  addDNSSecKey(alias: string) {
    const dnssecKmsKey = new KMS.Key(this, 'dnssec-kms-key', {
      keySpec: KMS.KeySpec.ECC_NIST_P256,
      keyUsage: KMS.KeyUsage.SIGN_VERIFY,
      policy: new IAM.PolicyDocument({
        statements: [
          new IAM.PolicyStatement({
            actions: ['kms:Sign'],
            principals: [new IAM.AccountRootPrincipal()],
            resources: ['*'],
          }),
          new IAM.PolicyStatement({ //to fix 'The new key policy will not allow you to update the key policy in the future' in cloudformation
            actions: [
              'kms:Create*',
              'kms:Describe*',
              'kms:Enable*',
              'kms:List*',
              'kms:Put*',
              'kms:Update*',
              'kms:Revoke*',
              'kms:Disable*',
              'kms:Get*',
              'kms:Delete*',
              'kms:ScheduleKeyDeletion',
              'kms:CancelKeyDeletion',
              'kms:GenerateDataKey',
              'kms:TagResource',
              'kms:UntagResource',
            ],
            principals: [new IAM.AccountRootPrincipal()],
            resources: ['*'],
          }),
          new IAM.PolicyStatement({
            sid: 'Allow Route 53 DNSSEC to CreateGrant',
            actions: ['kms:CreateGrant'],
            principals: [new IAM.ServicePrincipal('dnssec-route53.amazonaws.com')],
            resources: ['*'],
            conditions: {
              Bool: {
                'kms:GrantIsForAWSResource': true,
              },
            },
          }),
          new IAM.PolicyStatement({
            sid: 'Allow Route 53 DNSSEC Service',
            actions: [
              'kms:DescribeKey',
              'kms:GetPublicKey',
              'kms:Sign',
            ],
            principals: [new IAM.ServicePrincipal('dnssec-route53.amazonaws.com')],
            resources: ['*'],
          }),
        ],
      }),
    });

    dnssecKmsKey.addAlias(alias);
    return dnssecKmsKey;
  }

}
