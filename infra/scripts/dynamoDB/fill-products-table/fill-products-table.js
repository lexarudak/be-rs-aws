import data from "./__mocks__/products-mock.js";
import  { fillTable } from "../utils/fill-table.js";
import { DYNAMO_DB_TABLES } from "../../utils/constants.js";

fillTable(DYNAMO_DB_TABLES.PRODUCTS, data);
