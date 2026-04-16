import { DnsConfiguration, SubdomainConfiguration } from './DnsConfiguration';
import { Statics } from './Statics';

/**
 * Custom Environment with obligatory accountId and region
 */
export interface Environment {
  account: string;
  region: string;
}

export interface Configurable {
  configuration: Configuration;
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
  toplevelHostedzoneEnvironment: Environment;

  /**
   * E.g. csp-nijmegen.nl
   */
  toplevelHostedzoneName: string;

  /**
   * The Hostedzone ID for the toplevel hostedzone (csp-nijmegen.nl)
   */
  toplevelHostedzoneId: string;

  /**
   * A list of accounts to configure
   */
  subdomains: SubdomainConfiguration[];

  /**
   * CNAME records to add
   * Note: do not add csp-nijmegen.nl suffix (route53 will add this for us).
   */
  cnameRecords?: { [key: string]: string };

}

export interface Configurable {
  configuration: Configuration;
}

export const configurations: { [key: string]: Configuration } = {
  main: {
    branchName: 'main',
    codeStartConnectionArn: Statics.codeStarConnectionArn,
    deploymentEnvironment: Statics.gnBuildEnvironment,
    /**
     * Not the most beautiful solution as this is a resrouce in the
     * project, but is it ever goging to change? Otherwise we have
     * to do cross account ssm parameter obtaining to get this from
     * the gn-network account and use it in the member accounts
     */
    toplevelHostedzoneId: 'Z00489013V7D4IGJTPVCB',
    toplevelHostedzoneName: 'csp-nijmegen.nl',
    toplevelHostedzoneEnvironment: Statics.gnNetworkEnvironment,
    subdomains: DnsConfiguration,
    cnameRecords: {
      _CF53A2934921DB2D2F9B0832A37DB0F8: 'A10FDFEAE96CA5CD844F053DF6660F95.DC6084937FED1CCA7DDF79456D890149.sectigo.com', // sociaal-gws prod
      _513ABF59C275B221DE7211B0C543291B: 'B7C6D4B25C3E6BC7B5E9E8233B3574D4.DD4F3D148D142A6342758FCC9FD1B582.sectigo.com', // sociaal-gws accp
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
