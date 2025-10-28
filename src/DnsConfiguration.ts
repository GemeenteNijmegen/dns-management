import { Environment } from 'aws-cdk-lib';
import { Statics } from './Statics';


export interface SubdomainConfiguration {
  environment: Environment;
  /**
   * The account name, this will be used as the subdomain:
   * E.g.: name: 'my-test', will result in a zone for
   * `my-test.csp-nijmegen.nl`
   */
  name: string;
  /**
   * Flag to indicate if the subdomain should have DNSSEC enabled
   */
  enableDnsSec: boolean;
  /**
   * If true add the DS record to the root hostedzone
   * @default true
   */
  addDSRecord?: boolean;
}


export interface SubdomainConfigurable {
  subdomainConfiguration: SubdomainConfiguration;
}


export const DnsConfiguration: SubdomainConfiguration[] = [
  {
    environment: Statics.gnYiviAccpEnvironment,
    name: 'yivi-accp',
    enableDnsSec: true,
  },
  {
    environment: Statics.gnYiviProdEnvironment,
    name: 'yivi-prod',
    enableDnsSec: true,
  },
  {
    environment: Statics.gnTribeBrpLinkerDevEnvironment,
    name: 'tribebrplinker-dev',
    enableDnsSec: true,
  },
  {
    environment: Statics.gnTribeBrpLinkerAccpEnvironment,
    name: 'tribebrplinker-accp',
    enableDnsSec: true,
  },
  {
    environment: Statics.gnTribeBrpLinkerAccpProduction,
    name: 'tribebrplinker-prod',
    enableDnsSec: true,
  },
  {
    environment: Statics.gnYiviBrpIssueAccpEnvironment,
    name: 'yivi-brp-accp',
    enableDnsSec: true,
  },
  {
    environment: Statics.gnYiviBrpIssueProdEnvironment,
    name: 'yivi-brp-prod',
    enableDnsSec: true,
  },
  {
    environment: Statics.gnComponentLibraryDevEnvironment,
    name: 'component-library-dev',
    enableDnsSec: true,
  },
  {
    environment: Statics.gnComponentLibraryAccpEnvironment,
    name: 'component-library-accp',
    enableDnsSec: true,
  },
  {
    environment: Statics.gnComponentLibraryProdEnvironment,
    name: 'component-library-prod',
    enableDnsSec: true,
  },
  {
    environment: Statics.gnMijnNijmegenDevEnvironment,
    name: 'mijn-dev',
    enableDnsSec: true,
  },
  {
    environment: Statics.gnMijnNijmegenAccpEnvironment,
    name: 'mijn-accp',
    enableDnsSec: true,
  },
  {
    environment: Statics.gnMijnNijmegenProdEnvironment,
    name: 'mijn-prod',
    enableDnsSec: true,
  },
  {
    environment: Statics.gnWebformsDev,
    name: 'webforms-dev',
    enableDnsSec: true,
  },
  {
    environment: Statics.gnWebformsAccp,
    name: 'webforms-accp',
    enableDnsSec: true,
  },
  {
    environment: Statics.gnWebformsProd,
    name: 'webforms-prod',
    enableDnsSec: true,
  },
  {
    environment: Statics.gnStaticWebsitesProd,
    name: 'static-websites',
    enableDnsSec: true,
  },
  {
    environment: Statics.gnStaticWebsitesAccp,
    name: 'static-websites-accp',
    enableDnsSec: true,
  },
  {
    environment: Statics.gnSandboxMarnix,
    name: 'sandbox-marnix',
    enableDnsSec: true,
  },
  {
    environment: Statics.gnSandbox01,
    name: 'sandbox-01',
    enableDnsSec: false,
  },
  {
    environment: Statics.gnSubmissionStorageDev,
    name: 'submissionstorage-dev',
    enableDnsSec: true,
  },
  {
    environment: Statics.gnSubmissionStorageAccp,
    name: 'submissionstorage-accp',
    enableDnsSec: true,
  },
  {
    environment: Statics.gnSubmissionStorageProd,
    name: 'submissionstorage-prod',
    enableDnsSec: true,
  },
  {
    environment: Statics.gnYiviNijmegenAccp,
    name: 'yivi-nijmegen-accp',
    enableDnsSec: true,
  },
  {
    environment: Statics.gnYiviNijmegenProd,
    name: 'yivi-nijmegen-prod',
    enableDnsSec: true,
  },
  {
    environment: Statics.gnSocialeRechercheAccp,
    name: 'sociale-recherche-accp',
    enableDnsSec: false,
  },
  {
    environment: Statics.gnSocialeRechercheProd,
    name: 'sociale-recherche-prod',
    enableDnsSec: false,
  },
  {
    environment: Statics.gnMijnServicesDev,
    name: 'mijn-services-dev',
    enableDnsSec: true,
  },
  {
    environment: Statics.gnMijnServicesAccp,
    name: 'mijn-services-accp',
    enableDnsSec: true,
  },
  {
    environment: Statics.gnMijnServicesProd,
    name: 'mijn-services-prod',
    enableDnsSec: true,
  },
  {
    environment: Statics.gnHaalCentraalBrpDev,
    name: 'haal-centraal-brp-dev',
    enableDnsSec: true,
  },
  {
    environment: Statics.gnHaalCentraalBrpAccp,
    name: 'haal-centraal-brp-accp',
    enableDnsSec: true,
  },
  {
    environment: Statics.gnHaalCentraalBrpProd,
    name: 'haal-centraal-brp-prod',
    enableDnsSec: true,
  },
  {
    environment: Statics.gnOpenFormsAccp,
    name: 'open-forms-accp',
    enableDnsSec: true,
  },
  {
    environment: Statics.gnOpenFormsProd,
    name: 'open-forms-prod',
    enableDnsSec: true,
  },
  {
    environment: Statics.gnVerzoekserviceWerkInkomenAccp,
    name: 'vwi-accp',
    enableDnsSec: true,
  },
  {
    environment: Statics.gnVerzoekserviceWerkInkomenProd,
    name: 'vwi-prod',
    enableDnsSec: true,
  },
  {
    environment: Statics.gnGeoDataAccp,
    name: 'geodata-accp',
    enableDnsSec: true,
  },
  {
    environment: Statics.gnGeoDataProd,
    name: 'geodata',
    enableDnsSec: true,
  },
];
