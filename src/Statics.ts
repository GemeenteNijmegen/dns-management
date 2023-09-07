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

  static readonly sandboxEnvironment = {
    account: '122467643252',
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

  static readonly generiekAccpEnvironment = {
    account: '229631103712',
    region: 'eu-west-1',
  };

  static readonly generiekProdEnvironment = {
    account: '487749583954',
    region: 'eu-west-1',
  };

  static readonly test2Environment = {
    account: '374828078457',
    region: 'eu-west-1',
  };

  static readonly test3Environment = {
    account: '443779208930',
    region: 'eu-west-1',
  };

  static readonly test4Environment = {
    account: '709185976429',
    region: 'eu-west-1',
  };

  static readonly umDemoEnvironment = {
    account: '698929623502',
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

  // New LZ
  static readonly gnGeoDataAcceptanceEnvironment = {
    account: '766983128454',
    region: 'eu-central-1',
  };

  // New LZ
  static readonly gnYiviAccpEnvironment = {
    account: '699363516011',
    region: 'eu-central-1',
  };

  // New LZ
  static readonly gnYiviProdEnvironment = {
    account: '185512167111',
    region: 'eu-central-1',
  };

  // New LZ
  static readonly gnTribeBrpLinkerDevEnvironment = {
    account: '471236387053',
    region: 'eu-central-1',
  };

  // New LZ
  static readonly gnTribeBrpLinkerAccpEnvironment = {
    account: '987304085258',
    region: 'eu-central-1',
  };

  // New LZ
  static readonly gnTribeBrpLinkerAccpProduction = {
    account: '962664892091',
    region: 'eu-central-1',
  };

  // New LZ
  static readonly gnYiviBrpIssueAccpEnvironment = {
    account: '528030426040',
    region: 'eu-central-1',
  };

  // New LZ
  static readonly gnYiviBrpIssueProdEnvironment = {
    account: '079163754011',
    region: 'eu-central-1',
  };

  // New LZ - has no old LZ account
  static readonly gnComponentLibraryDevEnvironment = {
    account: '598242258242',
    region: 'eu-central-1',
  };
  // New LZ - has no old LZ account
  static readonly gnComponentLibraryAccpEnvironment = {
    account: '768900902886',
    region: 'eu-central-1',
  };
  // New LZ - has no old LZ account
  static readonly gnComponentLibraryProdEnvironment = {
    account: '706611162248',
    region: 'eu-central-1',
  };

  // New LZ - has no old LZ account
  static readonly gnMijnNijmegenAccpEnvironment = {
    account: '021929636313',
    region: 'eu-central-1',
  };

  // New LZ - has no old LZ account
  static readonly gnMijnNijmegenProdEnvironment = {
    account: '740606269759',
    region: 'eu-central-1',
  };

  // New LZ - has no old LZ account
  static readonly gnWebformsDev = {
    account: '033598396027',
    region: 'eu-central-1',
  };

  // New LZ - has no old LZ account
  static readonly gnWebformsAccp = {
    account: '338472043295',
    region: 'eu-central-1',
  };

  // New LZ - has no old LZ account
  static readonly gnWebformsProd = {
    account: '147064197580',
    region: 'eu-central-1',
  };

  // New LZ - has no old LZ account
  static readonly gnStaticWebsitesProd = {
    account: '654477686593',
    region: 'eu-central-1',
  };

  // New LZ - has no old LZ account
  static readonly gnVerwerkingenloggingAccp = {
    account: '649781704230',
    region: 'eu-central-1',
  };

  // New LZ - has no old LZ account
  static readonly gnVerwerkingenloggingProd = {
    account: '887474129159',
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
