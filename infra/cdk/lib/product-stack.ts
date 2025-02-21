import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
export class BackStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const getProductsFunction = new lambda.Function(
			this,
			"getProductsFunction",
			{
				runtime: lambda.Runtime.NODEJS_22_X,
				handler: "get-products-list.handler",
				code: lambda.Code.fromAsset(
					"../../service/product/dist/get-products-list"
				),
				functionName: "getProductsList",
			}
		);

		const api = new apigateway.RestApi(this, "productsApi", {
			restApiName: "Products Service",
			defaultCorsPreflightOptions: {
				allowOrigins: apigateway.Cors.ALL_ORIGINS,
				allowMethods: apigateway.Cors.ALL_METHODS,
				allowHeaders: [
					"Content-Type",
					"X-Amz-Date",
					"Authorization",
					"X-Api-Key",
				],
			},
		});

		const products = api.root.addResource("products");
		products.addMethod(
			"GET",
			new apigateway.LambdaIntegration(getProductsFunction)
		);
	}
}
