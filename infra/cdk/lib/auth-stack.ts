import { Stack, StackProps, Duration } from "aws-cdk-lib";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { CfnOutput } from "aws-cdk-lib";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { PolicyStatement, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { config } from "dotenv";
config();

export class AuthStack extends Stack {
	public readonly exportName: string;

	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		const key = process.env.lexarudak;

		const authorizerFunction = new NodejsFunction(this, "basicAuthorizer", {
			runtime: Runtime.NODEJS_22_X,
			entry: "../../service/authorization/basic-authorizer/basic-authorizer.ts",
			handler: "handler",
			memorySize: 128,
			timeout: Duration.seconds(30),
			environment: {
				lexarudak: key || "ups!",
			},
		});

		authorizerFunction.addToRolePolicy(
			new PolicyStatement({
				actions: [
					"logs:CreateLogGroup",
					"logs:CreateLogStream",
					"logs:PutLogEvents",
				],
				resources: ["*"],
			})
		);

		authorizerFunction.addPermission("ApiGatewayInvokePermission", {
			principal: new ServicePrincipal("apigateway.amazonaws.com"), // API Gateway
			sourceArn: `arn:aws:execute-api:${this.region}:${this.account}:*`,
		});

		new CfnOutput(this, "BasicAuthorizerArnOutput", {
			value: authorizerFunction.functionArn,
			exportName: "BasicAuthorizerArn",
		});

		this.exportName = "BasicAuthorizerArn";
	}
}
