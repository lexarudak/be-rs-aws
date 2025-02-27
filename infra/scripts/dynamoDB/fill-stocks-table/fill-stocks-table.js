import data from "./__mocks__/stocks-mock.js";
import  { fillTable } from "../utils/fill-table.js";
import { DYNAMO_DB_TABLES } from "../../utils/constants.js";

fillTable(DYNAMO_DB_TABLES.STOCKS, data);
