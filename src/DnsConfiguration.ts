import { Environment } from 'aws-cdk-lib';
import { Statics } from './Statics';

export interface AccountConfiguration {
  environment: Environment;

  /**
   * The account name, this will be used as the subdomain:
   * E.g.: name: 'my-test', will result in a zone for
   * `my-test.csp-nijmegen.nl`
   */
  name: string;
  dnsRootEnvironment: Environment;
  deployDnsStack: boolean;
  enableDnsSec: boolean;
  deployDnsSecKmsKey: boolean;
  registerInCspNijmegenRoot: boolean;

  /**
   * Acceptance stage had a different name than the name field in this interface
   * Therefore allow to override the stage name using this property
   */
  overwriteStageName?: string;
}

export const DnsConfigurationExistingLz: AccountConfiguration[] = [
  {
    environment: Statics.sandboxEnvironment,
    name: 'sandbox',
    dnsRootEnvironment: Statics.dnsRootEnvironment,
    deployDnsStack: true,
    enableDnsSec: false,
    deployDnsSecKmsKey: false,
    registerInCspNijmegenRoot: true,
  }, {
    environment: Statics.authAccpEnvironment,
    name: 'accp',
    dnsRootEnvironment: Statics.dnsRootEnvironment,
    deployDnsStack: true,
    enableDnsSec: true,
    deployDnsSecKmsKey: true,
    registerInCspNijmegenRoot: true,
    overwriteStageName: 'acceptance',
  }, {
    environment: Statics.authProdEnvironment,
    name: 'auth-prod',
    dnsRootEnvironment: Statics.dnsRootEnvironment,
    deployDnsStack: true,
    enableDnsSec: true,
    deployDnsSecKmsKey: true,
    registerInCspNijmegenRoot: true,
  }, {
    environment: Statics.generiekAccpEnvironment,
    name: 'generiek-accp',
    dnsRootEnvironment: Statics.dnsRootEnvironment,
    deployDnsStack: true,
    enableDnsSec: false,
    deployDnsSecKmsKey: false,
    registerInCspNijmegenRoot: true,
    overwriteStageName: 'genriek-accp',
  }, {
    environment: Statics.generiekProdEnvironment,
    name: 'generiek-prod',
    dnsRootEnvironment: Statics.dnsRootEnvironment,
    deployDnsStack: true,
    enableDnsSec: false,
    deployDnsSecKmsKey: false,
    registerInCspNijmegenRoot: true,
    overwriteStageName: 'genriek-prod',
  }, {
    environment: Statics.test2Environment,
    name: 'test-2',
    dnsRootEnvironment: Statics.dnsRootEnvironment,
    deployDnsStack: true,
    enableDnsSec: true,
    deployDnsSecKmsKey: true,
    registerInCspNijmegenRoot: true,
  }, {
    environment: Statics.test3Environment,
    name: 'test-3',
    dnsRootEnvironment: Statics.dnsRootEnvironment,
    deployDnsStack: true,
    enableDnsSec: true,
    deployDnsSecKmsKey: true,
    registerInCspNijmegenRoot: true,
  }, {
    environment: Statics.test4Environment,
    name: 'test-4',
    dnsRootEnvironment: Statics.dnsRootEnvironment,
    deployDnsStack: true,
    enableDnsSec: true,
    deployDnsSecKmsKey: true,
    registerInCspNijmegenRoot: true,
  }, {
    environment: Statics.umDemoEnvironment,
    name: 'um-demo',
    dnsRootEnvironment: Statics.dnsRootEnvironment,
    deployDnsStack: true,
    enableDnsSec: false,
    deployDnsSecKmsKey: false,
    registerInCspNijmegenRoot: true,
  },
];


export const DnsConfigurationNewLz: AccountConfiguration[] = [
  {
    environment: Statics.gnYiviAccpEnvironment,
    name: 'yivi-accp',
    dnsRootEnvironment: Statics.gnNetworkEnvironment,
    deployDnsStack: true,
    enableDnsSec: true,
    deployDnsSecKmsKey: true,
    registerInCspNijmegenRoot: true,
  },
  {
    environment: Statics.gnYiviProdEnvironment,
    name: 'yivi-prod',
    dnsRootEnvironment: Statics.gnNetworkEnvironment,
    deployDnsStack: true,
    enableDnsSec: true,
    deployDnsSecKmsKey: true,
    registerInCspNijmegenRoot: true,
  },
  {
    environment: Statics.gnTribeBrpLinkerDevEnvironment,
    name: 'tribebrplinker-dev',
    dnsRootEnvironment: Statics.gnNetworkEnvironment,
    deployDnsStack: true,
    enableDnsSec: true,
    deployDnsSecKmsKey: true,
    registerInCspNijmegenRoot: true,
  },
  {
    environment: Statics.gnTribeBrpLinkerAccpEnvironment,
    name: 'tribebrplinker-accp',
    dnsRootEnvironment: Statics.gnNetworkEnvironment,
    deployDnsStack: true,
    enableDnsSec: false,
    deployDnsSecKmsKey: false,
    registerInCspNijmegenRoot: true,
  },
  {
    environment: Statics.gnTribeBrpLinkerAccpProduction,
    name: 'tribebrplinker-prod',
    dnsRootEnvironment: Statics.gnNetworkEnvironment,
    deployDnsStack: true,
    enableDnsSec: true,
    deployDnsSecKmsKey: true,
    registerInCspNijmegenRoot: true,
  },
  {
    environment: Statics.gnYiviBrpIssueAccpEnvironment,
    name: 'yivi-brp-accp',
    dnsRootEnvironment: Statics.gnNetworkEnvironment,
    enableDnsSec: true,
    deployDnsStack: true,
    deployDnsSecKmsKey: true,
    registerInCspNijmegenRoot: true,
  },
  {
    environment: Statics.gnYiviBrpIssueProdEnvironment,
    name: 'yivi-brp-prod',
    dnsRootEnvironment: Statics.gnNetworkEnvironment,
    enableDnsSec: true,
    deployDnsStack: true,
    deployDnsSecKmsKey: true,
    registerInCspNijmegenRoot: true,
  },
  {
    environment: Statics.gnComponentLibraryDevEnvironment,
    name: 'component-library-dev',
    dnsRootEnvironment: Statics.gnNetworkEnvironment,
    enableDnsSec: true,
    deployDnsStack: true,
    deployDnsSecKmsKey: true,
    registerInCspNijmegenRoot: true,
  },
  {
    environment: Statics.gnComponentLibraryAccpEnvironment,
    name: 'component-library-accp',
    dnsRootEnvironment: Statics.gnNetworkEnvironment,
    enableDnsSec: true,
    deployDnsStack: true,
    deployDnsSecKmsKey: true,
    registerInCspNijmegenRoot: true,
  },
  {
    environment: Statics.gnComponentLibraryProdEnvironment,
    name: 'component-library-prod',
    dnsRootEnvironment: Statics.gnNetworkEnvironment,
    enableDnsSec: true,
    deployDnsStack: true,
    deployDnsSecKmsKey: true,
    registerInCspNijmegenRoot: true,
  },
  {
    environment: Statics.gnMijnNijmegenAccpEnvironment,
    name: 'mijn-accp',
    dnsRootEnvironment: Statics.gnNetworkEnvironment,
    enableDnsSec: true,
    deployDnsStack: true,
    deployDnsSecKmsKey: true,
    registerInCspNijmegenRoot: true,
  },
  {
    environment: Statics.gnMijnNijmegenProdEnvironment,
    name: 'mijn-prod',
    dnsRootEnvironment: Statics.gnNetworkEnvironment,
    enableDnsSec: true,
    deployDnsStack: true,
    deployDnsSecKmsKey: true,
    registerInCspNijmegenRoot: true,
  },
  {
    environment: Statics.gnWebformsDev,
    name: 'webforms-dev',
    dnsRootEnvironment: Statics.gnNetworkEnvironment,
    enableDnsSec: true,
    deployDnsStack: true,
    deployDnsSecKmsKey: true,
    registerInCspNijmegenRoot: true,
  },
  {
    environment: Statics.gnWebformsAccp,
    name: 'webforms-accp',
    dnsRootEnvironment: Statics.gnNetworkEnvironment,
    enableDnsSec: true,
    deployDnsStack: true,
    deployDnsSecKmsKey: true,
    registerInCspNijmegenRoot: true,
  },
  {
    environment: Statics.gnWebformsProd,
    name: 'webforms-prod',
    dnsRootEnvironment: Statics.gnNetworkEnvironment,
    enableDnsSec: true,
    deployDnsStack: true,
    deployDnsSecKmsKey: true,
    registerInCspNijmegenRoot: true,
  },
  {
    environment: Statics.gnStaticWebsitesProd,
    name: 'static-websites',
    dnsRootEnvironment: Statics.gnNetworkEnvironment,
    enableDnsSec: true,
    deployDnsStack: true,
    deployDnsSecKmsKey: true,
    registerInCspNijmegenRoot: true,
  },
  {
    environment: Statics.gnVerwerkingenloggingAccp,
    name: 'vwlog-accp',
    dnsRootEnvironment: Statics.gnNetworkEnvironment,
    enableDnsSec: true,
    deployDnsStack: true,
    deployDnsSecKmsKey: true,
    registerInCspNijmegenRoot: true,
  },
  {
    environment: Statics.gnVerwerkingenloggingProd,
    name: 'vwlog-prod',
    dnsRootEnvironment: Statics.gnNetworkEnvironment,
    enableDnsSec: true,
    deployDnsStack: true,
    deployDnsSecKmsKey: true,
    registerInCspNijmegenRoot: true,
  },
  {
    environment: Statics.gnSandboxMarnix,
    name: 'sandbox-marnix',
    dnsRootEnvironment: Statics.gnNetworkEnvironment,
    enableDnsSec: false,
    deployDnsSecKmsKey: false,
    deployDnsStack: true,
    registerInCspNijmegenRoot: true,
  },
  {
    environment: Statics.gnSandbox01,
    name: 'sandbox-01',
    dnsRootEnvironment: Statics.gnNetworkEnvironment,
    enableDnsSec: false,
    deployDnsSecKmsKey: false,
    deployDnsStack: true,
    registerInCspNijmegenRoot: true,
  },
  {
    environment: Statics.gnSubmissionStorageDev,
    name: 'submissionstorage-dev',
    dnsRootEnvironment: Statics.gnNetworkEnvironment,
    enableDnsSec: true,
    deployDnsSecKmsKey: true,
    deployDnsStack: true,
    registerInCspNijmegenRoot: true,
  },
  {
    environment: Statics.gnSubmissionStorageAccp,
    name: 'submissionstorage-accp',
    dnsRootEnvironment: Statics.gnNetworkEnvironment,
    enableDnsSec: true,
    deployDnsSecKmsKey: true,
    deployDnsStack: true,
    registerInCspNijmegenRoot: true,
  },
  {
    environment: Statics.gnSubmissionStorageProd,
    name: 'submissionstorage-prod',
    dnsRootEnvironment: Statics.gnNetworkEnvironment,
    enableDnsSec: true,
    deployDnsSecKmsKey: true,
    deployDnsStack: true,
    registerInCspNijmegenRoot: true,
  },
  {
    environment: Statics.gnYiviNijmegenAccp,
    name: 'yivi-nijmegen-accp',
    dnsRootEnvironment: Statics.gnNetworkEnvironment,
    enableDnsSec: true,
    deployDnsSecKmsKey: true,
    deployDnsStack: true,
    registerInCspNijmegenRoot: true,
  },
  {
    environment: Statics.gnYiviNijmegenProd,
    name: 'yivi-nijmegen-prod',
    dnsRootEnvironment: Statics.gnNetworkEnvironment,
    enableDnsSec: true,
    deployDnsSecKmsKey: true,
    deployDnsStack: true,
    registerInCspNijmegenRoot: true,
  },
  {
    environment: Statics.gnSocialeRechercheAccp,
    name: 'sociale-recherche-accp',
    dnsRootEnvironment: Statics.gnNetworkEnvironment,
    enableDnsSec: false,
    deployDnsSecKmsKey: false,
    deployDnsStack: true,
    registerInCspNijmegenRoot: true,
  },
  {
    environment: Statics.gnSocialeRechercheProd,
    name: 'sociale-recherche-prod',
    dnsRootEnvironment: Statics.gnNetworkEnvironment,
    enableDnsSec: false,
    deployDnsSecKmsKey: false,
    deployDnsStack: true,
    registerInCspNijmegenRoot: true,
  },
];
