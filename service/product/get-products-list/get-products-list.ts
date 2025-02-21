import { productsListMock } from "../__mocks__/products-list";

export const getProductsList = () => {
	return {
		statusCode: 200,
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(productsListMock),
	};
};
