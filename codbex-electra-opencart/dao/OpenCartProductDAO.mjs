import { dao as daoApi } from "@dirigible/db";

const CONFIG = {
	table: "oc_product",
	properties: [
		{
			id: true,
			name: "id",
			column: "product_id",
			type: "INTEGER",
			autoIncrement: true
		},
		{
			name: "model",
			column: "model",
			type: "VARCHAR"
		}
	]
};

const LOGGER_NAME = "ProductDAO";

export class OpenCartProductDAO {
	openCartDAO;

	constructor(dataSourceName) {
		this.openCartDAO = daoApi.create(CONFIG, LOGGER_NAME, dataSourceName);
	}

	get(id) {
		return this.openCartDAO.find(id);
	}

	list(settings) {
		return this.openCartDAO.list(settings);
	}
}