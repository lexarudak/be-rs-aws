#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { BackStack } from "../lib/product-stack";
import { ImportStack } from "../lib/import-stack";
import { AuthStack } from "../lib/auth-stack";

const app = new cdk.App();

new AuthStack(app, "AuthStack");

new ImportStack(app, "ImportStack", {
	authArnOutput: "BasicAuthorizerArn",
});

new BackStack(app, "BackStack");
