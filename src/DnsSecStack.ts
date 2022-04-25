import * as cdk from 'aws-cdk-lib';
import { aws_ssm as SSM, Tags, aws_iam as IAM, aws_kms as KMS } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Statics } from './Statics';

export class DnsSecStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    Tags.of(this).add('cdkManaged', 'yes');
    Tags.of(this).add('Project', Statics.projectName);

    // Create the (expensive $) key
    const dnssecKey = this.addDNSSecKey(Statics.accountDnsSecKmsKeyAlias);

    // Store the key arn in a parameter for use in other projects
    //   (note that this parmeter is in us-east-1)
    new SSM.StringParameter(this, 'account-dnssec-kms-key-arn', {
      stringValue: dnssecKey.keyArn,
      parameterName: Statics.accountDnsSecKmsKey,
    });

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
