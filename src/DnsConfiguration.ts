import { Environment } from 'aws-cdk-lib';
import { Statics } from './Statics';

export interface AccountConfiguration {
  environment: Environment;
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
  }
];


export const DnsConfigurationNewLz: AccountConfiguration[] = [];
