import { CreateItem } from "../../utils/types";

export const getValidCreateItem = (item: Partial<CreateItem>): CreateItem => {
	const { title, description, price, count } = item;

	if (!title || typeof title !== "string") {
		throw new Error("Invalid data. Title is required and should be a string");
	}

	if (!description || typeof description !== "string") {
		throw new Error(
			"Invalid data. Description is required and should be a string"
		);
	}

	if (!price || typeof price !== "number") {
		throw new Error("Invalid data. Price should be a number > 0");
	}

	if (typeof count !== "number" || count < 0) {
		throw new Error("Invalid data. Count is required and should be a number");
	}

	return item as CreateItem;
};
