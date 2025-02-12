import { SubdomainConfiguration, DnsConfiguration } from './DnsConfiguration';
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
  configuration : Configuration;
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
      _8EB90A827CA30DF0D15CB819DEE19249: '8A412BC57C15888A1B5C21A9B751C49A.199F432B2A40913816D5A06328BC2384.sectigo.com', // open-forms-accp-haal-centraal.csp-nijmegen.nl ACC
      _AF223A96ADA542568F916E1154803133: 'C95A6867F0E432A3A074408D6FF308E9.521B7F0E5D88BCEB93571B37118FF6AF.sectigo.com', // open-forms-prod-haal-centraal.csp-nijmegen.nl PROD
      _AD5B5643AC6346098EE5AE629BFDF6D1: 'C4ED21513132A46BE055394AA2C90CB6.181F0FC2F8C878F8A732442B605D7CB9.sectigo.com', // mijn-nijmegen-prod-haal-centraal.csp-nijmegen.nl PROD
      _9BD575E4839D8E23C39E777EE1114398: 'B16C59AC61C65DD26282E0CFDA5E35F0.16C4B66F279D058BCB4C23A49F23B077.sectigo.com', // mijn-nijmegen-accp-haal-centraal.csp-nijmegen.nl ACCP
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
