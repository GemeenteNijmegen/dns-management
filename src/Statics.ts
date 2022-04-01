export class Statics {
  static readonly projectName: string = 'dns-management';

  // Zone id and zone name parameters to get the csp-nijmegen.nl hosted zone
  static readonly cspNijmegenHostedZoneId: string = '/gemeente-nijmegen/csp/hostedzone/id';
  static readonly cspNijmegenHostedZoneName: string = '/gemeente-nijmegen/csp/hostedzone/name';

  // In prod and accp the root hosted zone can be obtained using
  static readonly envRootHostedZoneIdOld: string = '/gemeente-nijmegen/formio/hostedzone/id';
  static readonly envRootHostedZoneNameOld: string = '/gemeente-nijmegen/formio/hostedzone/name';
  // In newer accounts use these two to obtain the hostedzone
  static readonly envRootHostedZoneId: string = '/gemeente-nijmegen/account/hostedzone/id';
  static readonly envRootHostedZoneName: string = '/gemeente-nijmegen/account/hostedzone/name';

  /**
   * Code star connection to github
   */
  static readonly codeStarConnectionArn: string = 'arn:aws:codestar-connections:eu-west-1:418648875085:connection/4f647929-c982-4f30-94f4-24ff7dbf9766';


  static constructDelegationRoleName(name: string): string {
    return `csp-nijmegen-delegation-${name}-role`;
  }

}