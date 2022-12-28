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
  stageName?: string;
}

export const DnsConfiguration: AccountConfiguration[] = [
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
    stageName: 'acceptance',
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
  }, {
    environment: Statics.generiekProdEnvironment,
    name: 'generiek-prod',
    dnsRootEnvironment: Statics.dnsRootEnvironment,
    deployDnsStack: true,
    enableDnsSec: false,
    deployDnsSecKmsKey: false,
    registerInCspNijmegenRoot: true,
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
  },
];