import { dao as daoApi, update } from "@dirigible/db";

const CONFIG = {
	table: "oc_product_description",
	properties: [
		{
			"name": "productId",
			"column": "product_id",
			"type": "INTEGER",
			"id": true,
			"autoIncrement": false
		},
		{
			"name": "languageId",
			"column": "language_id",
			"type": "INTEGER",
		},
		{
			"name": "name",
			"column": "name",
			"type": "VARCHAR"
		},
		{
			"name": "description",
			"column": "description",
			"type": "VARCHAR"
		},
		{
			"name": "tag",
			"column": "tag",
			"type": "VARCHAR"
		},
		{
			"name": "metaTitle",
			"column": "meta_title",
			"type": "VARCHAR"
		},
		{
			"name": "metaDescription",
			"column": "meta_description",
			"type": "VARCHAR"
		},
		{
			"name": "metaKeyword",
			"column": "meta_keyword",
			"type": "VARCHAR"
		}
	]
};
const UPDATE_STATEMENT = "UPDATE `oc_product_description` SET `name` = ?, `description` = ?, `tag` = ?, `meta_title` = ?, `meta_description` = ?, `meta_keyword` = ? WHERE (`product_id`=? AND `language_id` = ?)";

const LOGGER_NAME = "OpenCartProductDescriptionDAO";

export class OpenCartProductDescriptionDAO {
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

	create(productDescription) {
		return this.openCartDAO.insert(productDescription);
	}

	update(productDescription) {
		const params = [productDescription.name, productDescription.description, productDescription.tag,
		productDescription.metaTitle, productDescription.metaDescription, productDescription.metaKeyword,
		productDescription.productId, productDescription.languageId
		];
		return update.execute(UPDATE_STATEMENT, params, this.dataSourceName);
	}

	upsert(productDescription) {
		const querySettings = {
			productId: productDescription.productId,
			languageId: productDescription.languageId
		};
		const productDescriptions = this.list(querySettings);

		if (productDescriptions.length > 0) {
			this.update(productDescription);
		} else {
			return this.create(productDescription);
		}
	}
}
