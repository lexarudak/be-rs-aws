import { Stack, StackProps, Duration } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Bucket, EventType } from "aws-cdk-lib/aws-s3";
import { LambdaDestination } from "aws-cdk-lib/aws-s3-notifications";

export class ImportStack extends Stack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		const bucketName = "rs-aws-import";
		const importBucket = Bucket.fromBucketName(
			this,
			"ExistingImportBucket",
			bucketName
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
		});

		importFileParser.addToRolePolicy(
			new PolicyStatement({
				actions: ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"], // Разрешения для копирования, удаления и чтения
				resources: [
					`${importBucket.bucketArn}/uploaded/*`, // Чтение из папки "uploaded"
					`${importBucket.bucketArn}/parsed/*`, // Запись в папку "parsed"
				],
			})
		);

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

		const importFile = api.root.addResource("import");

		importFile.addMethod(
			"GET",
			new apigateway.LambdaIntegration(importProductsFile)
		);

		importFile;
	}
}
