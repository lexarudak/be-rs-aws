import { handler } from "./get-products-list";

describe("get-products-list handler", () => {
	it("should return a 200 status code and the correct data", async () => {
		const response = await handler();
		expect(response.statusCode).toBe(200);
		expect(response.headers).toEqual({
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Credentials": true,
			"Content-Type": "application/json",
		});
		expect(JSON.parse(response.body)).toEqual([
			{
				description: "Short Product Description",
				id: "1",
				price: 24,
				title: "Valera",
			},
			{
				description: "Short Product Description",
				id: "2",
				price: 15,
				title: "Natalia",
			},
			{
				description: "Short Product Description",
				id: "3",
				price: 23,
				title: "Marina",
			},
			{
				description: "Short Product Description",
				id: "4",
				price: 15,
				title: "Zinaida",
			},
			{
				description: "Short Product Description",
				id: "5",
				price: 23,
				title: "Irina",
			},
			{
				description: "Short Product Description",
				id: "6",
				price: 15,
				title: "Olga",
			},
		]);
	});

	it("should return a 500 status code if an error occurs", async () => {
		jest.spyOn(handler, "handler").mockImplementationOnce(() => {
			throw new Error("Test error");
		});

		const response = await handler();
		expect(response.statusCode).toBe(500);
		expect(JSON.parse(response.body)).toEqual({
			message: "Internal server error",
			error: expect.any(Object),
		});
	});
});
