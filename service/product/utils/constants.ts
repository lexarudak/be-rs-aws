export enum DYNAMO_DB_TABLES {
	PRODUCTS = "products",
	STOCKS = "stocks",
}

export enum REGIONS {
	DYNAMO_DB = "eu-north-1",
}

export const headers = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Credentials": true,
	"Content-Type": "application/json",
};
