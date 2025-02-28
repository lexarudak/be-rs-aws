import { Stack, StackProps, Duration, CfnOutput } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { DYNAMO_DB_TABLES } from "../utils/constants";

export class BackStack extends Stack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		const productsTable = Table.fromTableName(
			this,
			"ProductsTable",
			DYNAMO_DB_TABLES.PRODUCTS
		);
		const stocksTable = Table.fromTableName(
			this,
			"StocksTable",
			DYNAMO_DB_TABLES.STOCKS
		);

		const createProductFunction = new NodejsFunction(
			this,
			"createProductFunction",
			{
				runtime: Runtime.NODEJS_22_X,
				entry: "../../service/product/create-product/create-product.ts",
				handler: "handler",
				memorySize: 128,
				timeout: Duration.seconds(30),
				bundling: {
					externalModules: ["aws-sdk"],
					forceDockerBundling: false,
				},
				environment: {
					PRODUCTS_TABLE_NAME: DYNAMO_DB_TABLES.PRODUCTS,
					STOCKS_TABLE_NAME: DYNAMO_DB_TABLES.STOCKS,
				},
			}
		);

		const getProductsFunction = new NodejsFunction(
			this,
			"getProductsFunction",
			{
				runtime: Runtime.NODEJS_22_X,
				entry: "../../service/product/get-products-list/get-products-list.ts",
				handler: "handler",
				memorySize: 128,
				timeout: Duration.seconds(30),
				bundling: {
					externalModules: ["aws-sdk"],
					forceDockerBundling: false,
				},
				environment: {
					PRODUCTS_TABLE_NAME: DYNAMO_DB_TABLES.PRODUCTS,
					STOCKS_TABLE_NAME: DYNAMO_DB_TABLES.STOCKS,
				},
			}
		);

		const getProductByIdFunction = new NodejsFunction(
			this,
			"getProductByIdFunction",
			{
				runtime: Runtime.NODEJS_22_X,
				handler: "handler",
				entry: "../../service/product/get-product-by-id/get-product-by-id.ts",
				memorySize: 128,
				timeout: Duration.seconds(30),
				bundling: {
					externalModules: ["aws-sdk"],
					forceDockerBundling: false,
				},
				environment: {
					PRODUCTS_TABLE_NAME: DYNAMO_DB_TABLES.PRODUCTS,
					STOCKS_TABLE_NAME: DYNAMO_DB_TABLES.STOCKS,
				},
			}
		);

		productsTable.grantReadData(getProductsFunction);
		productsTable.grantReadData(getProductByIdFunction);
		productsTable.grantWriteData(createProductFunction);

		stocksTable.grantReadData(getProductsFunction);
		stocksTable.grantReadData(getProductByIdFunction);
		stocksTable.grantWriteData(createProductFunction);

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

		products.addMethod(
			"POST",
			new apigateway.LambdaIntegration(createProductFunction)
		);

		const product = api.root.addResource("product");
		const productById = product.addResource("{id}");

		productById.addMethod(
			"GET",
			new apigateway.LambdaIntegration(getProductByIdFunction)
		);

		new CfnOutput(this, "ApiUrl", {
			value: api.url,
			description: "API Gateway URL",
		});
	}
}
