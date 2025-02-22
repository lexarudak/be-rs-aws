import { handler } from "./get-products-list";
import data from "../__mocks__/products-list-mock";

describe("get-products-list handler", () => {
	it("should return a 200 status code and the correct data", async () => {
		const response = await handler();
		expect(response.statusCode).toBe(200);
		expect(response.headers).toEqual({
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Credentials": true,
			"Content-Type": "application/json",
		});
		expect(JSON.parse(response.body)).toEqual(data);
	});
});
