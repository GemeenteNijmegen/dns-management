export class Statics {
  static readonly projectName: string = 'dns-management';

  // In prod and accp the root hosted zone can be obtained using
  static readonly cspRootHostedZoneId: string = '/gemeente-nijmegen/formio/hostedzone/id';
  static readonly cspRootHostedZoneName: string = '/gemeente-nijmegen/formFio/hostedzone/name';

  // In newer accounts use these two to obtain the hostedzone
  static readonly envRootHostedZonePath: string = '/gemeente-nijmegen/account/hostedzone';
  static readonly envRootHostedZoneId: string = '/gemeente-nijmegen/account/hostedzone/id';
  static readonly envRootHostedZoneName: string = '/gemeente-nijmegen/account/hostedzone/name';

  // csp-nijmegen.nl hosted zone
  static readonly cspNijmegenHostedZonePath: string = '/gemeente-nijmegen/csp/hostedzone';
  static readonly cspNijmegenHostedZoneId: string = '/gemeente-nijmegen/csp/hostedzone/id';
  static readonly cspNijmegenHostedZoneName: string = '/gemeente-nijmegen/csp/hostedzone/name';


  // The KSM key parameters for each account
  static readonly accountDnsSecKmsKey: string = '/gemeente-nijmegen/account/dnssec/kmskey/arn';
  static readonly accountDnsSecKmsKeyAlias: string = 'gemeente-nijmegen/dnssec/default';

  /**
   * Code star connection to github
   */
  static readonly codeStarConnectionArn: string = 'arn:aws:codestar-connections:eu-west-1:418648875085:connection/4f647929-c982-4f30-94f4-24ff7dbf9766';
  static readonly codeStarConnectionArnNewLz: string = 'arn:aws:codestar-connections:eu-central-1:836443378780:connection/9d20671d-91bc-49e2-8680-59ff96e2ab11';

  /**
   * IAM Account related stuff
   */
  static readonly iamAccountId: string = '098799052470';
  static readonly ssmDnsManagerRoleArn: string = '/cdk/dns-management/manager-role-arn';

  /**
   * Environments
   */
  static readonly deploymentEnvironment = {
    account: '418648875085',
    region: 'eu-west-1',
  };

  static readonly authProdEnvironment = {
    account: '196212984627',
    region: 'eu-west-1',
  };

  static readonly authAccpEnvironment = {
    account: '315037222840',
    region: 'eu-west-1',
  };

  static readonly dnsRootEnvironment = {
    account: '108197740505',
    region: 'eu-west-1',
  };

  // New LZ
  static readonly gnBuildEnvironment = {
    account: '836443378780',
    region: 'eu-central-1',
  };

  // New LZ
  static readonly gnNetworkEnvironment = {
    account: '043872078922',
    region: 'eu-central-1',
  };


  /**
   * Create a role name (used for registration and assuming the role)
   * @param name
   * @returns
   */
  static constructDelegationRoleName(name: string): string {
    return `csp-nijmegen-delegation-${name}-role`;
  }

}
