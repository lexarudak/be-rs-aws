import { Stack, StackProps, Duration, Fn } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Bucket, EventType } from "aws-cdk-lib/aws-s3";
import { LambdaDestination } from "aws-cdk-lib/aws-s3-notifications";
import { Queue } from "aws-cdk-lib/aws-sqs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";

interface ImportStackProps extends StackProps {
	authArnOutput: string;
}

export class ImportStack extends Stack {
	constructor(scope: Construct, id: string, props: ImportStackProps) {
		super(scope, id, props);

		const { authArnOutput } = props;

		const basicAuthorizerArn = Fn.importValue(authArnOutput);
		const basicAuthorizerLambda = lambda.Function.fromFunctionArn(
			this,
			"ImportedBasicAuthorizer",
			basicAuthorizerArn
		);

		const bucketName = "rs-aws-import";
		const importBucket = Bucket.fromBucketName(
			this,
			"ExistingImportBucket",
			bucketName
		);

		const catalogItemsQueue = Queue.fromQueueArn(
			this,
			"CatalogItemsQueue",
			"arn:aws:sqs:eu-north-1:108782060406:catalogItemsQueue"
		);

		const importFileParser = new NodejsFunction(this, "importFileParser", {
			runtime: Runtime.NODEJS_22_X,
			entry: "../../service/import/import-file-parser/import-file-parser.ts",
			handler: "handler",
			memorySize: 128,
			timeout: Duration.seconds(30),
			bundling: {
				externalModules: ["aws-sdk"],
			},
			environment: {
				CATALOG_ITEMS_QUEUE_URL: catalogItemsQueue.queueUrl,
			},
		});

		importFileParser.addToRolePolicy(
			new PolicyStatement({
				actions: [
					"s3:GetObject",
					"s3:PutObject",
					"s3:DeleteObject",
					"s3:ListBucket",
				],
				resources: [`${importBucket.bucketArn}`, `${importBucket.bucketArn}/*`],
			})
		);

		catalogItemsQueue.grantSendMessages(importFileParser);

		importBucket.addEventNotification(
			EventType.OBJECT_CREATED,
			new LambdaDestination(importFileParser),
			{ prefix: "uploaded/" }
		);

		const importProductsFile = new NodejsFunction(this, "importProductsFile", {
			runtime: Runtime.NODEJS_22_X,
			entry:
				"../../service/import/import-products-file/import-products-file.ts",
			handler: "handler",
			memorySize: 128,
			timeout: Duration.seconds(30),
			bundling: {
				externalModules: ["aws-sdk"],
				forceDockerBundling: false,
			},
		});

		importProductsFile.addToRolePolicy(
			new PolicyStatement({
				actions: ["s3:GetObject", "s3:PutObject", "s3:ListBucket"],
				resources: [
					`arn:aws:s3:::${bucketName}`,
					`arn:aws:s3:::${bucketName}/*`,
				],
			})
		);

		const api = new apigateway.RestApi(this, "importApi", {
			restApiName: "Import Service",
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

		const authorizer = new apigateway.TokenAuthorizer(
			this,
			"LambdaAuthorizer",
			{
				handler: basicAuthorizerLambda, // Подключаем импортированную Lambda как обработчик
			}
		);

		const importFile = api.root.addResource("import");

		importFile.addMethod(
			"GET",
			new apigateway.LambdaIntegration(importProductsFile),
			{
				authorizer,
				authorizationType: apigateway.AuthorizationType.CUSTOM,
			}
		);
	}
}
