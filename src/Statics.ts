export class Statics {

  // Zone id and zone name parameters to get the csp-nijmegen.nl hosted zone
  static readonly cspNijmegenHostedZoneId: string = '/gemeente-nijmegen/csp/hostedzone/id';
  static readonly cspNijmegenHostedZoneName: string = '/gemeente-nijmegen/csp/hostedzone/name';

  // In prod and accp the root hosted zone can be obtained using
  static readonly envRootHostedZoneIdOld: string = '/gemeente-nijmegen/formio/hostedzone/id';
  static readonly envRootHostedZoneNameOld: string = '/gemeente-nijmegen/formio/hostedzone/name';
  // In newer accounts use these two to obtain the hostedzone
  static readonly envRootHostedZoneId: string = '/gemeente-nijmegen/account/hostedzone/id';
  static readonly envRootHostedZoneName: string = '/gemeente-nijmegen/account/hostedzone/name';


}