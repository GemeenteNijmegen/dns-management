# DNS management for csp-nijmegen.nl

In deze repository zit de cdk code voor het beheren van de subdomeinen in ons aws account.

## Opzet
Door gebruik te maken van [CrossAccountZoneDelegationRecords](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_route53.CrossAccountZoneDelegationRecord.html) wordt het mogelijk een in een ander account een hosted zone aan te maken die als subdomein aan de hosted zone in het productie account wordt gehangen. Hiervoor is een IAM role nodig in het productie account waarin delegatie wordt vastgelegd (zie link voor meer informatie).

### CDK code structuur
Momenteel gebeuren er twee dingen:
- Een stack met een policy wordt aangemaakt in de productie omgeving (waar onze root hosted zone csp-nijmegen.nl leeft). In deze stack worden IAM policies gemaakt die per omgeving toesteming geven om de root hosted zone te managen (m.b.v. CrossAccountZoneDelegationRecords).
- Voor elke omgeving vaarvoor een delegatie IAM policy is aangemaakt in productie (i.e. elke omgeving die een subdomein van csp-nijmegen.nl wil), wordt een stack uitgerold met de volgende onderdelen:
    - Laaden van de root hosted zone (csp-nijmegen.nl)
    - Een subhosted zone (e.g. sandbox.csp-nijmegen.nl)
    - Een CrossAccountZoneDelegationRecord die de subhosted zone koppelt aan de root hosted zone.
    - Twee parameters om in andere projecten de subhosted zone specifiek voor dat account te importeren (universeel voor alle omgevingen)
        - /gemeente-nijmegen/account/hostedzone/id
        - /gemeente-nijmegen/account/hostedzone/name

## Volgende stap
De hosted zones csp-nijmegen.nl en accp.csp-nijmegen.nl zitten nu nog in de webformulieren stacks. Er moet uitgezocht worden hoe we deze resources kunnen verhuizen naar deze repository. Daarnaast moet er een subdomein worden gemaakt zodat de webformulieren niet meer op csp-nijmegen.nl and accp.csp-nijmegen.nl draaien (maar bijvoorbeeld op webformulieren.csp-nijmegen.nl en webformulieren.accp.csp-nijmegen.nl). 


