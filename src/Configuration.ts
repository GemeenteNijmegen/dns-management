import { AccountConfiguration, DnsConfigurationExistingLz, DnsConfigurationNewLz } from './DnsConfiguration';
import { Statics } from './Statics';

/**
 * Custom Environment with obligatory accountId and region
 */
export interface Environment {
  account: string;
  region: string;
}

export interface Configuration {

  /**
   * The Git branch for which this configuration is applicable
   */
  branchName: string;

  /**
   * The code star connection arn to use in the deployment account
   */
  codeStartConnectionArn: string;

  /**
   * Deployment account (gemeentenijmegen-deployment/gn-build)
   */
  deploymentEnvironment: Environment;

  /**
   * DNS root environment (e.g. the dns account)
   */
  dnsRootEnvironment: Environment;

  /**
   * A list of accounts to configure
   */
  dnsConfiguration: AccountConfiguration[];

  /**
   * CNAME records to add
   * Note: do not add csp-nijmegen.nl suffix (route53 will add this for us).
   */
  cnameRecords?: { [key: string]: string };

  /**
   * DS records to add
   * Note: do not add csp-nijmegen.nl suffix (route53 will add this for us).
   */
  dsRecords?: { [key: string]: string };
}

export interface Configurable {
  configuration : Configuration;
}

export const configurations: { [key: string]: Configuration } = {
  production: {
    branchName: 'production',
    codeStartConnectionArn: Statics.codeStarConnectionArn,
    deploymentEnvironment: Statics.deploymentEnvironment,
    dnsRootEnvironment: Statics.dnsRootEnvironment,
    dnsConfiguration: DnsConfigurationExistingLz,
  },
  main: {
    branchName: 'main',
    codeStartConnectionArn: Statics.codeStarConnectionArnNewLz,
    deploymentEnvironment: Statics.gnBuildEnvironment,
    dnsRootEnvironment: Statics.gnNetworkEnvironment,
    dnsConfiguration: DnsConfigurationNewLz,
    dsRecords: {
      'yivi-accp': '51061 13 2 83F061A07CDB0044033CEB74E91E92B054E0A92588420F137F9B54272158A13B',
      'yivi-prod': '46016 13 2 6A12D4BB10AC8EA7E4FEB622F8BD1E9395824B39AD0A38A0EE42577199ACFFA1',
    },
  },
};

export function getConfiguration(buildBranch: string) {
  const config = configurations[buildBranch];
  if (!config) {
    throw Error(`No configuration for branch ${buildBranch} found. Add a configuration in Configuration.ts`);
  }
  return config;
}