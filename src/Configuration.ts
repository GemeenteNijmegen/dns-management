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
      _D7C1F6522E154D3F64133A9A3D464B6D: 'F6A6DD3B8CD734283F382FC51456E895.7C31C123D7B1907E13FFDDDAC7ABFC1E.sectigo.com', // mijn-uitkering
      _CEF65E075BC77DA55387BCD5BB588FB1: '4723981F2A2200D2F82559647754A28E.9C55ED3F4D69EC40CEEC87DB573501D5.sectigo.com', // mijn-uitkering-accp
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
