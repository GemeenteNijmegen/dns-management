import { RemoteParameters } from '@gemeentenijmegen/cross-region-parameters';
import { DnssecRecordStruct } from '@gemeentenijmegen/dnssec-record';
import * as cdk from 'aws-cdk-lib';
import { aws_ssm as SSM, Tags, aws_iam as IAM, aws_kms as KMS, aws_route53 as route53 } from 'aws-cdk-lib';
import { CfnKeySigningKey, HostedZone, IHostedZone } from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';
import { Configurable } from './Configuration';
import { SubdomainConfigurable } from './DnsConfiguration';
import { Statics } from './Statics';

export interface DnsSecStackProps extends cdk.StackProps, SubdomainConfigurable, Configurable {}

export class DnsSecStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props: DnsSecStackProps) {
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

    const subHostedzone = this.importSubHostedzone(props);
    const ksk = this.enableDnsSecForAccountRootZone(dnssecKey.keyArn, subHostedzone.hostedZoneId);

    const addDSRecord = props.subdomainConfiguration.addDSRecord;
    if (addDSRecord !== false) {
      this.addDsRecord(props, subHostedzone, ksk);
    }

  }

  addDsRecord(props: DnsSecStackProps, subHostedzone: IHostedZone, ksk: CfnKeySigningKey) {
    // Import the delegated role in the production account
    const roleArn = cdk.Arn.format({
      service: 'iam',
      account: props.configuration.toplevelHostedzoneEnvironment.account,
      resource: 'role',
      resourceName: Statics.constructDelegationRoleName(props.subdomainConfiguration.name),
      partition: 'aws',
      region: '',
    });

    const toplevleHostedzone = this.importToplevelHostedzone(props);
    new DnssecRecordStruct(this, 'record', {
      hostedZone: subHostedzone,
      keySigningKey: ksk,
      parentHostedZone: toplevleHostedzone,
      roleToAssume: roleArn,
      forceUpdate: 'QF034pqaln', // Change to force update all DS records
    });
  }

  importToplevelHostedzone(props: DnsSecStackProps) {
    return HostedZone.fromHostedZoneAttributes(this, 'toplevel-hostedzone', {
      zoneName: props.configuration.toplevelHostedzoneName,
      hostedZoneId: props.configuration.toplevelHostedzoneId,
    });
  }

  importSubHostedzone(props: DnsSecStackProps) {
    // Import the hosted zone id from target region
    const parameters = new RemoteParameters(this, 'hosted-zone-parameters', {
      path: Statics.envRootHostedZonePath,
      region: props.configuration.toplevelHostedzoneEnvironment.region,
      timeout: cdk.Duration.seconds(10),
    });
    return HostedZone.fromHostedZoneAttributes(this, 'sub-hostedzone', {
      zoneName: parameters.get(Statics.envRootHostedZoneName),
      hostedZoneId: parameters.get(Statics.envRootHostedZoneId),
    });
  }

  /**
   * Enable DNSSEC usign the KMS key from this stack for the account root hosted zone.
   * @param keyArn
   */
  enableDnsSecForAccountRootZone(keyArn: string, hostedZoneId: string) {

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
    dnssec.node.addDependency(ksk);

    return ksk;
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
