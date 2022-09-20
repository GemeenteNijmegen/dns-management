# DNS management for csp-nijmegen.nl

In deze repository zit de cdk code voor het beheren van de subdomeinen in ons aws account.

## Opzet
Door gebruik te maken van [CrossAccountZoneDelegationRecords](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_route53.CrossAccountZoneDelegationRecord.html) wordt het mogelijk een in een ander account een hosted zone aan te maken die als subdomein aan de hosted zone in het productie account wordt gehangen. Hiervoor is een IAM role nodig in het productie account waarin delegatie wordt vastgelegd (zie link voor meer informatie).

![dns-management structuur](docs/dns-management.drawio.png)