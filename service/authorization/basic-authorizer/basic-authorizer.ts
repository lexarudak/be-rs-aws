import {
	APIGatewayAuthorizerEvent,
	APIGatewayAuthorizerResult,
} from "aws-lambda";

const generatePolicy = (
	principalId: string,
	effect: string,
	resource: string
): APIGatewayAuthorizerResult => {
	return {
		principalId,
		policyDocument: {
			Version: "2012-10-17",
			Statement: [
				{
					Action: "execute-api:Invoke",
					Effect: effect,
					Resource: resource,
				},
			],
		},
	};
};

export const handler = async (
	event: APIGatewayAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
	console.log("Authorization event:", event);

	try {
		// Извлекаем заголовок `Authorization` из запроса
		const authorizationHeader =
			event.authorizationToken ||
			event.headers?.Authorization ||
			event.headers?.authorization;

		if (!authorizationHeader) {
			console.error("No Authorization Header found.");
			return generatePolicy("user", "Deny", event.methodArn);
		}

		// Основная логика авторизации по Basic Auth
		const encodedCredentials = authorizationHeader.split(" ")[1]; // "Basic <base64-credentials>"
		const decodedCredentials = Buffer.from(
			encodedCredentials,
			"base64"
		).toString("utf8");
		const [username, password] = decodedCredentials.split(":");

		const SECRET_KEY = process.env[username];

		if (!SECRET_KEY) {
			throw new Error(
				`Environment variable ${username} is not defined. PASS: ${password}`
			);
		}

		if (password === SECRET_KEY) {
			console.log("Authorization successful for user:", username);
			return generatePolicy(username, "Allow", event.methodArn);
		} else {
			console.error("Authorization failed.", {
				password,
				SECRET_KEY,
				username,
			});
			return generatePolicy("user", "Deny", event.methodArn);
		}
	} catch (error) {
		console.error("Authorization error:", error);
		throw new Error("Unauthorized");
	}
};
