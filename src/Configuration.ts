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
      '_D1D3DA83D42898AF7DCC082754D0677D.data.mule-dev': '2DFCA4BBF3A2E3E9309B552F57876D8C.9633141E74B7095EB9444AD755627AFF.sectigo.com', // mule-dev
      '_0B09FEE32BBC128264F775BF32511736.data.mule-accp': '447C490326AFABB4B06FAF37F45BA0E1.115767F454ECB8FACEE90B42FADF56A6.sectigo.com', // mule-accp
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
