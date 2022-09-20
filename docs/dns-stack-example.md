## DNS Stack

This page contains an example of a dns-stack class that can be used to create an project specific subdomain in the account root hosted zone (e.g. a subdomain in auth-prod.csp-nijmegen.nl)

<details>


```ts
import * as route53 from '@aws-cdk/aws-route53';
import * as SSM from '@aws-cdk/aws-ssm';
import * as core from '@aws-cdk/core';

export class DnsStack extends core.Stack {

    // Below references the new hosted zone separeted from webformulieren
    static readonly accountRootHostedZoneId: string = '/gemeente-nijmegen/account/hostedzone/id';
    static readonly accountRootHostedZoneName: string = '/gemeente-nijmegen/account/hostedzone/name';

    private hostedZone: route53.HostedZone;
    private accountRootZone: route53.IHostedZone;

    constructor(scope: core.Construct, id: string, props: core.StackProps) {
        super(scope, id, props);

        // Import account hosted zone
        const accountRootZoneId = SSM.StringParameter.valueForStringParameter(this, DnsStack.accountRootHostedZoneId);
        const accountRootZoneName = SSM.StringParameter.valueForStringParameter(this, DnsStack.accountRootHostedZoneName);
        this.accountRootZone = route53.HostedZone.fromHostedZoneAttributes(this, 'account-root-zone', {
            hostedZoneId: accountRootZoneId,
            zoneName: accountRootZoneName,
        });

        // Create project subomain hosted zone
        const zoneName = `subdomain.${this.accountRootZone.zoneName}`;
        this.hostedZone = new route53.PublicHostedZone(this, 'project-zone', {
            zoneName,
        });

        // Register the new zone in the account root zone
        if (!this.hostedZone.hostedZoneNameServers) {
            throw 'No name servers found for our hosted zone, cannot create dns stack';
        }
        new route53.ZoneDelegationRecord(this, 'project-zone-delegation', {
            nameServers: this.hostedZone.hostedZoneNameServers,
            zone: this.accountRootZone,
            recordName: zoneName,
        });

    }

    /**
     * Set the DS record in the account root zone.
     * TODO do this using a custom resource (this is not deployable in one go
     * as dnssec schould be enabled first, then the record can be created...)
     * @param props
     */
    addDsRecords(environmentIsAccp: boolean) {
        var record = '';
        if (environmentIsAccp) {
            record = '52561 13 2 F062826A0E589764457C1EE15F82BC3E8A5B95D11968267996AE2BCAB67969B0';
        } else {
            // Prod record
            record = '60066 13 2 05FF69C70030440C3C3A0CF93371517078487EFC13155BAEA2A9E940DF6BB646';
        }

        if (record) {
            new route53.DsRecord(this, 'ds-record', {
                zone: this.accountRootZone,
                recordName: this.hostedZone.zoneName,
                values: [record],
                ttl: core.Duration.seconds(3600),
            });
        }
    }

}
```
</details>


## DNSSEC Stack
Each account has the account root hosted zone (e.g. auth-prod.csp-nijmegen.nl) and a KMS key used to generate a DNSSEC KSK. This can be imported an used to enable DNSSEC as follows. 

Note: the DS records must be retreived from the console and added to the DNS Stack (above) to enable DNSSEC. This is a manual action (see issues for creating a custrom resource to do this)


<details>

```ts
import * as cloudwatch from '@aws-cdk/aws-cloudwatch';
import * as route53 from '@aws-cdk/aws-route53';
import * as SSM from '@aws-cdk/aws-ssm';
import * as core from '@aws-cdk/core';

export class DnsSecStack extends core.Stack {

    // The KSM key parameters for each account
    static readonly ssmAccountDnsSecKmsKey: string = '/gemeente-nijmegen/account/dnssec/kmskey/arn';

    private hostedZone: route53.IHostedZone;

    constructor(scope: core.Construct, id: string, props: core.StackProps) {
        super(scope, id, props);

        core.Tags.of(this).add('cdkManaged', 'yes');
        core.Tags.of(this).add('Project', 'auth');

        // Import project hosted zone
        const zoneId = SSM.StringParameter.valueForStringParameter(this, statics.ssmName_projectHostedZoneId);
        const zoneName = SSM.StringParameter.valueForStringParameter(this, statics.ssmName_projectnHostedZoneName);
        this.hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'webformulieren-zone', {
            hostedZoneId: zoneId,
            zoneName: zoneName,
        });

        this.setupDnsSec();
        this.setupDnsSecAlarms();

    }

    setupDnsSec() {

        // Import account DNSSEC KMS key
        const dnssecKmsKey = SSM.StringParameter.valueForStringParameter(this, DnsSecStack.ssmAccountDnsSecKmsKey);

        // Create KSK
        const dnssecKeySigning = new route53.CfnKeySigningKey(this, 'dnssec-keysigning-key', {
            name: 'dnssec_with_kms',
            status: 'ACTIVE',
            hostedZoneId: this.hostedZone.hostedZoneId,
            keyManagementServiceArn: dnssecKmsKey,
        });

        // Enable DNSEC on webformulieren zone
        const dnssec = new route53.CfnDNSSEC(this, 'dnssec', {
            hostedZoneId: this.hostedZone.hostedZoneId,
        });

        // Make sure the ksk exists before enabling dnssec
        dnssec.node.addDependency(dnssecKeySigning);

    }

    /**
     * CloudWatch Metrics and Alarms for DNSSEC
     */
    setupDnsSecAlarms() {
        const internalFailureMetric = new cloudwatch.Metric({
            namespace: 'AWS/Route53',
            metricName: 'DNSSECInternalFailure',
            dimensionsMap: {
                HostedZoneId: this.hostedZone.hostedZoneId,
            },
        });
        const kskNeedsActionMetric = new cloudwatch.Metric({
            namespace: 'AWS/Route53',
            metricName: 'DNSSECKeySigningKeysNeedingAction',
            dimensionsMap: {
                HostedZoneId: this.hostedZone.hostedZoneId,
            },
        });
        new cloudwatch.Alarm(this, 'dnssec-internal-failure', {
            metric: internalFailureMetric,
            evaluationPeriods: 1,
            threshold: 1,
            alarmDescription: 'webformulieren dnssec internal failure',
        });
        new cloudwatch.Alarm(this, 'dnssec-ksk-needs-action', {
            metric: kskNeedsActionMetric,
            evaluationPeriods: 1,
            threshold: 1,
            alarmDescription: 'webformulieren ksk needs action',
        });

    }

}
```
</details>