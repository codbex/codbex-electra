import { dao as daoApi, update } from "@dirigible/db";

const CONFIG = {
	table: "oc_product_attribute",
	properties: [
		{
			"id": true,
			"name": "productId",
			"column": "product_id",
			"type": "INTEGER",
			"autoIncrement": false
		},
		{
			"name": "attributeId",
			"column": "attribute_id",
			"type": "INTEGER",
			"autoIncrement": false
		},
		{
			"name": "languageId",
			"column": "language_id",
			"type": "INTEGER",
			"autoIncrement": false
		},
		{
			"name": "text",
			"column": "text",
			"type": "VARCHAR",
			"autoIncrement": false
		}
	]
};
const UPDATE_STATEMENT = "UPDATE `oc_product_attribute` SET `text` = ? WHERE (`product_id`=? AND `language_id`=? AND `attribute_id`=?)";

const LOGGER_NAME = "OpenCartProductAttributeDAO";

export class OpenCartProductAttributeDAO {
	dataSourceName;
	openCartDAO;

	constructor(dataSourceName) {
		this.dataSourceName = dataSourceName;
		this.openCartDAO = daoApi.create(CONFIG, LOGGER_NAME, dataSourceName);
	}

	get(id) {
		return this.openCartDAO.find(id);
	}

	list(settings) {
		return this.openCartDAO.list(settings);
	}

	create(productAttribute) {
		return this.openCartDAO.insert(productAttribute);
	}

	update(productAttribute) {
		const params = [productAttribute.text, productAttribute.productId, productAttribute.languageId, productAttribute.attributeId];
		return update.execute(UPDATE_STATEMENT, params, this.dataSourceName);
	}

	upsert(productAttribute) {
		const querySettings = {
			productId: productAttribute.productId,
			languageId: productAttribute.languageId,
			attributeId: productAttribute.attributeId
		};
		const productAttributes = this.list(querySettings);

		if (productAttributes.length > 0) {
			this.update(productAttribute);
		} else {
			return this.create(productAttribute);
		}
	}
}
