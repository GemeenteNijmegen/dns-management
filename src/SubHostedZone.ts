import { aws_route53 as Route53 } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface SubHostedZoneProps {
  parentZone: Route53.IHostedZone;
  subZoneName: string;
}

export class SubHostedZone extends Construct {
  hostedZoneId: string;
  zoneName: string;

  constructor(scope: Construct, id: string, props: SubHostedZoneProps) {
    super(scope, id);

    // Create the subzone
    const subZone = new Route53.HostedZone(this, 'sub-hostedzone', {
      zoneName: `${props.subZoneName}.${props.parentZone.zoneName}`,
    });

    // Export the properties to communicate to parent stack
    this.hostedZoneId = subZone.hostedZoneId;
    this.zoneName = subZone.zoneName;

    // Register the subhosted zone in the parent zone
    if (!subZone.hostedZoneNameServers) {
      throw `HostedzoneNameServers is empty for ${this.zoneName} hosted zone`;
    }
    new Route53.NsRecord(this, 'ns-record', {
      zone: props.parentZone,
      values: subZone.hostedZoneNameServers,
      recordName: props.subZoneName,
    });
  }

}