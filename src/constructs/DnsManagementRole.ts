import {
  aws_iam as IAM,
  aws_ssm as SSM,
  Stack,
} from 'aws-cdk-lib';
import { NagSuppressions } from 'cdk-nag';
import { Construct } from 'constructs';
import { Statics } from '../Statics';

export class DnsManagementRole extends Construct {

  constructor(scope: Stack, id: string) {
    super(scope, id);

    const role = new IAM.Role(this, 'dns-management-role', {
      roleName: 'dns-manager',
      description: 'Role for dns-management account with access rights to IAM (readonly) and Route53',
      assumedBy: new IAM.PrincipalWithConditions(
        new IAM.AccountPrincipal(Statics.iamAccountId), //IAM account
        {
          Bool: {
            'aws:MultiFactorAuthPresent': true,
          },
        },
      ),
    });

    /**
         * Policy for route53 and route53domains
         * Allows the role to manage dns hosted zones and domain names in this account.
         */
    const dnsManagemntPolicy = new IAM.PolicyStatement({
      effect: IAM.Effect.ALLOW,
      actions: [
        'route53:*', // Allow domain management
        'route53domains:*', // Allow domain management
      ],
      resources: [
        '*',
      ],
    });
    role.addToPolicy(dnsManagemntPolicy);

    /**
         * Readonly policy for IAM
         * This policy allows this role to view the csp-nijmegen-delegation-* roles which
         * are created in the DnsRootStack for using CrossAccountZoneDelegation constructs
         * from route53.
         */
    const iamPolicy = new IAM.PolicyStatement({
      effect: IAM.Effect.ALLOW,
      actions: [
        'iam:Get*',
        'iam:List*',
      ],
      resources: [
        `arn:aws:iam::${scope.account}:role/csp-nijmegen-delegation-*`,
      ],
    });
    role.addToPolicy(iamPolicy);

    /**
         * Policy for kms
         * Allows this role to view KMS keys in this account, this is relevant for dns managment
         * because a KMS key is used to create a DNSSEC KSK.
         */
    const kmsPolicy = new IAM.PolicyStatement({
      effect: IAM.Effect.ALLOW,
      actions: [
        'kms:Get*',
        'kms:List*',
        'kms:DescribeCustomKeyStores',
        'kms:DescribeKey',
      ],
      resources: [
        '*',
      ],
    });
    role.addToPolicy(kmsPolicy);


    NagSuppressions.addResourceSuppressions(
      role,
      [
        {
          id: 'AwsSolutions-IAM5',
          reason: 'De IAM policy is beperkt to het inzien van IAM rollen t.b.v. de CrossAccountZoneDelgation roles.',
          appliesTo: ['Action::iam:Get*', 'Action::iam:List*', 'Resource::arn:aws:iam::<AWS::AccountId>:role/csp-nijmegen-delegation-*'],
        },
        {
          id: 'AwsSolutions-IAM5',
          reason: 'De rol mag wel route53(domains) managen om zo dns management mogelijk te maken. Route53 domains ondersteunt geen resources dus een wildcard is nodig https://docs.aws.amazon.com/service-authorization/latest/reference/list_amazonroute53domains.html',
          appliesTo: ['Resource::*', 'Action::route53domains:*', 'Action::route53:*'],
        },
        {
          id: 'AwsSolutions-IAM5',
          reason: 'De KMS policy is beperkt tot het inzein van KMS keys.',
          appliesTo: ['Resource::*', 'Action::kms:Get*', 'Action::kms:List*'],
        },
      ],
      true,
    );

    new SSM.StringParameter(this, 'dns-manager-role-arn', {
      parameterName: Statics.ssmDnsManagerRoleArn,
      stringValue: role.roleArn,
    });

  }

}