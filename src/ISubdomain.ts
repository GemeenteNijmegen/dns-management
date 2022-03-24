import { Environment } from "aws-cdk-lib";
import { IRole } from "aws-cdk-lib/aws-iam";

export interface ISubdomain {
    subdomain: string;
    environment: Environment;
    delegationRole: IRole | undefined;
}
