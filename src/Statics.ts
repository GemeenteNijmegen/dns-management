export class Statics {
  static readonly projectName: string = 'dns-management';

  // In newer accounts use these two to obtain the hostedzone
  static readonly envRootHostedZonePath: string = '/gemeente-nijmegen/account/hostedzone';
  static readonly envRootHostedZoneId: string = '/gemeente-nijmegen/account/hostedzone/id';
  static readonly envRootHostedZoneName: string = '/gemeente-nijmegen/account/hostedzone/name';

  // The KSM key parameters for each account
  static readonly accountDnsSecKmsKey: string = '/gemeente-nijmegen/account/dnssec/kmskey/arn';
  static readonly accountDnsSecKmsKeyAlias: string = 'gemeente-nijmegen/dnssec/default';

  /**
   * Code star connection to github
   */
  static readonly codeStarConnectionArn: string = 'arn:aws:codestar-connections:eu-central-1:836443378780:connection/9d20671d-91bc-49e2-8680-59ff96e2ab11';

  /**
   * Environments
   */
  static readonly gnBuildEnvironment = {
    account: '836443378780',
    region: 'eu-central-1',
  };

  static readonly gnNetworkEnvironment = {
    account: '043872078922',
    region: 'eu-central-1',
  };

  static readonly gnGeoDataAcceptanceEnvironment = {
    account: '766983128454',
    region: 'eu-central-1',
  };

  static readonly gnYiviAccpEnvironment = {
    account: '699363516011',
    region: 'eu-central-1',
  };

  static readonly gnYiviProdEnvironment = {
    account: '185512167111',
    region: 'eu-central-1',
  };

  static readonly gnTribeBrpLinkerDevEnvironment = {
    account: '471236387053',
    region: 'eu-central-1',
  };

  static readonly gnTribeBrpLinkerAccpEnvironment = {
    account: '987304085258',
    region: 'eu-central-1',
  };

  static readonly gnTribeBrpLinkerAccpProduction = {
    account: '962664892091',
    region: 'eu-central-1',
  };

  static readonly gnYiviBrpIssueAccpEnvironment = {
    account: '528030426040',
    region: 'eu-central-1',
  };

  static readonly gnYiviBrpIssueProdEnvironment = {
    account: '079163754011',
    region: 'eu-central-1',
  };

  static readonly gnSandboxMarnix = {
    account: '049753832279',
    region: 'eu-central-1',
  };

  static readonly gnSandbox01 = {
    account: '833119272131',
    region: 'eu-central-1',
  };

  static readonly gnComponentLibraryDevEnvironment = {
    account: '598242258242',
    region: 'eu-central-1',
  };

  static readonly gnComponentLibraryAccpEnvironment = {
    account: '768900902886',
    region: 'eu-central-1',
  };

  static readonly gnComponentLibraryProdEnvironment = {
    account: '706611162248',
    region: 'eu-central-1',
  };

  static readonly gnMijnNijmegenDevEnvironment = {
    account: '590184009539',
    region: 'eu-central-1',
  };

  static readonly gnMijnNijmegenAccpEnvironment = {
    account: '021929636313',
    region: 'eu-central-1',
  };

  static readonly gnMijnNijmegenProdEnvironment = {
    account: '740606269759',
    region: 'eu-central-1',
  };

  static readonly gnWebformsDev = {
    account: '033598396027',
    region: 'eu-central-1',
  };

  static readonly gnWebformsAccp = {
    account: '338472043295',
    region: 'eu-central-1',
  };

  static readonly gnWebformsProd = {
    account: '147064197580',
    region: 'eu-central-1',
  };

  static readonly gnStaticWebsitesProd = {
    account: '654477686593',
    region: 'eu-central-1',
  };

  static readonly gnSubmissionStorageDev = {
    account: '358927146986',
    region: 'eu-central-1',
  };

  static readonly gnSubmissionStorageAccp = {
    account: '654654253219',
    region: 'eu-central-1',
  };

  static readonly gnSubmissionStorageProd = {
    account: '606343885688',
    region: 'eu-central-1',
  };

  static readonly gnYiviNijmegenAccp = {
    account: '992382808833',
    region: 'eu-central-1',
  };

  static readonly gnYiviNijmegenProd = {
    account: '767398106682',
    region: 'eu-central-1',
  };

  static readonly gnSocialeRechercheAccp = {
    account: '543802458112',
    region: 'eu-central-1',
  };

  static readonly gnSocialeRechercheProd = {
    account: '958875843009',
    region: 'eu-central-1',
  };

  static readonly gnMijnServicesAccp = {
    account: '145023129433',
    region: 'eu-central-1',
  };

  static readonly gnMijnServicesProd = {
    account: '692859927138',
    region: 'eu-central-1',
  };

  static readonly gnHaalCentraalBrpDev = {
    account: '084828568398',
    region: 'eu-central-1',
  };

  static readonly gnHaalCentraalBrpAccp = {
    account: '448049813413',
    region: 'eu-central-1',
  };

  static readonly gnHaalCentraalBrpProd = {
    account: '980921728594',
    region: 'eu-central-1',
  };

  static readonly gnOpenFormsAccp = {
    account: '043309345347',
    region: 'eu-central-1',
  };

  static readonly gnOpenFormsProd = {
    account: '761018864362',
    region: 'eu-central-1',
  };

  static readonly gnVerzoekserviceWerkInkomenAccp = {
    account: '528757829324',
    region: 'eu-central-1',
  };

  static readonly gnVerzoekserviceWerkInkomenProd = {
    account: '222634384969',
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
