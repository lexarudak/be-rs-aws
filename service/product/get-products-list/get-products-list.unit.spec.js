import { handler } from "./get-products-list";
import data from "../__mocks__/products-list-mock";

jest.mock("../helpers/fetch-all-items/fetch-all-items", () => ({
  fetchAllItems: jest.fn()
}));
import { fetchAllItems } from "../helpers/fetch-all-items/fetch-all-items";

describe("get-products-list handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
		jest.spyOn(console, "error").mockImplementation(() => {});
  	jest.spyOn(console, "warn").mockImplementation(() => {}); 
  });

  it("should return a 200 status code and the correct data", async () => {
    (fetchAllItems).mockResolvedValueOnce([
      { id: "product1", title: "Product 1", description: "Description 1", price: 50 },
      { id: "product2", title: "Product 2", description: "Description 2", price: 100 }
    ]).mockResolvedValueOnce([
      { product_id: "product1", count: 20 },
      { product_id: "product2", count: 30 }
    ]);

    const response = await handler();

    expect(response.statusCode).toBe(200);
    expect(response.headers).toEqual({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Content-Type": "application/json",
    });
    expect(JSON.parse(response.body)).toEqual([
      {
        id: "product1",
        title: "Product 1",
        description: "Description 1",
        price: 50,
        count: 20
      },
      {
        id: "product2",
        title: "Product 2",
        description: "Description 2",
        price: 100,
        count: 30
      }
    ]);
  });
});