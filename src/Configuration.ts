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
      _0933ED9F7B95F48EF7E79C6D112ED90E: 'F9A4369A7E6FB215648B5881ACC9F1FD.8298867ED88DAEBB5EF08448AB33A88B.sectigo.com', // mijn-nijmegen-accp-haal-centraal
      _4A72C948E3118E74BFEF3A0927C085E8: '2805463A6FD7851AD46210D6EE754405.619245A148E667FE397F418925E53103.sectigo.com', // mijn-nijmegen-prod-haal-centraal
      _BDD2AE6D52134DBA3D60E9D6CEF82E34: '428F3B0FCF925B0E595C57FDD643A17F.C13A6C030651167C826033A1F550A02C.sectigo.com', // open-forms-accp-haal-centraal
      _25A4F1AAB84C1B1FCBFB955F87BDDE03: '4490D9BEB990468C87C0E941A52FADFF.97D6441F62622A891487BD551CE4F733.sectigo.com', // open-forms-prod-haal-centraal
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
