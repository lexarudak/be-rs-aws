import { Stack, StackProps, Duration, CfnOutput } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { DYNAMO_DB_TABLES } from "../utils/constants";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { SubscriptionFilter, Topic } from "aws-cdk-lib/aws-sns";
import { EmailSubscription } from "aws-cdk-lib/aws-sns-subscriptions";

export class BackStack extends Stack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		const createProductTopic = new Topic(this, "CreateProductTopic", {
			displayName: "Product Creation Notifications",
		});

		createProductTopic.addSubscription(
			new EmailSubscription("lexarudak2@gmail.com")
		);

		createProductTopic.addSubscription(
			new EmailSubscription("lexarudak@gmail.com", {
				filterPolicy: {
					title: SubscriptionFilter.stringFilter({
						allowlist: ["valera"],
					}),
				},
			})
		);

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

		const catalogItemsQueue = new Queue(this, "CatalogItemsQueue", {
			queueName: "catalogItemsQueue",
			visibilityTimeout: Duration.seconds(60),
			retentionPeriod: Duration.days(4),
		});

		const catalogBatchProcess = new NodejsFunction(
			this,
			"catalogBatchProcessFunction",
			{
				runtime: Runtime.NODEJS_22_X,
				entry:
					"../../service/product/catalog-batch-process/catalog-batch-process.ts", // Файл твоей новой функции
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
					CREATE_PRODUCT_TOPIC_ARN: createProductTopic.topicArn,
				},
			}
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

		catalogBatchProcess.addEventSource(
			new SqsEventSource(catalogItemsQueue, {
				batchSize: 5,
			})
		);

		createProductTopic.grantPublish(catalogBatchProcess);

		productsTable.grantWriteData(catalogBatchProcess);
		productsTable.grantReadData(getProductsFunction);
		productsTable.grantReadData(getProductByIdFunction);
		productsTable.grantWriteData(createProductFunction);

		stocksTable.grantWriteData(catalogBatchProcess);
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
