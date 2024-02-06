import { dao as daoApi } from "@dirigible/db";

const CONFIG = {
	table: "oc_product",
	properties: [
		{
			"id": true,
			"name": "productId",
			"column": "product_id",
			"type": "INTEGER",
			"autoIncrement": false
		},
		{
			"name": "model",
			"column": "model",
			"type": "VARCHAR"
		},
		{
			"name": "sku",
			"column": "sku",
			"type": "VARCHAR"
		},
		{
			"name": "upc",
			"column": "upc",
			"type": "VARCHAR"
		},
		{
			"name": "ean",
			"column": "ean",
			"type": "VARCHAR"
		},
		{
			"name": "jan",
			"column": "jan",
			"type": "VARCHAR"
		},
		{
			"name": "isbn",
			"column": "isbn",
			"type": "VARCHAR"
		},
		{
			"name": "mpn",
			"column": "mpn",
			"type": "VARCHAR"
		},
		{
			"name": "location",
			"column": "location",
			"type": "VARCHAR"
		},
		{
			"name": "quantity",
			"column": "quantity",
			"type": "INTEGER"
		},
		{
			"name": "stockStatusId",
			"column": "stock_status_id",
			"type": "INTEGER"
		},
		{
			"name": "image",
			"column": "image",
			"type": "VARCHAR"
		},
		{
			"name": "manufacturerId",
			"column": "manufacturer_id",
			"type": "INTEGER"
		},
		{
			"name": "shipping",
			"column": "shipping",
			"type": "INTEGER"
		},
		{
			"name": "price",
			"column": "price",
			"type": "DECIMAL"
		},
		{
			"name": "points",
			"column": "points",
			"type": "INTEGER"
		},
		{
			"name": "taxClassId",
			"column": "tax_class_id",
			"type": "INTEGER"
		},
		{
			"name": "dateAvailable",
			"column": "date_available",
			"type": "DATE"
		},
		{
			"name": "weight",
			"column": "weight",
			"type": "DECIMAL"
		},
		{
			"name": "weightClassId",
			"column": "weight_class_id",
			"type": "INTEGER"
		},
		{
			"name": "length",
			"column": "length",
			"type": "DECIMAL"
		},
		{
			"name": "width",
			"column": "width",
			"type": "DECIMAL"
		},
		{
			"name": "height",
			"column": "height",
			"type": "DECIMAL"
		},
		{
			"name": "lengthClassId",
			"column": "length_class_id",
			"type": "INTEGER"
		},
		{
			"name": "subtract",
			"column": "subtract",
			"type": "INTEGER"
		},
		{
			"name": "minimum",
			"column": "minimum",
			"type": "INTEGER"
		},
		{
			"name": "sortOrder",
			"column": "sort_order",
			"type": "INTEGER"
		},
		{
			"name": "status",
			"column": "status",
			"type": "INTEGER"
		},
		{
			"name": "viewed",
			"column": "viewed",
			"type": "INTEGER"
		},
		{
			"name": "dateAdded",
			"column": "date_added",
			"type": "TIMESTAMP"
		},
		{
			"name": "dateModified",
			"column": "date_modified",
			"type": "TIMESTAMP"
		}
	]
};

const LOGGER_NAME = "OpenCartProductDAO";

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

	create(product) {
		return this.openCartDAO.insert(product);
	}

	update(product) {
		return this.openCartDAO.update(product);
	}

	upsert(product) {
		if (!product.productId || product.productId === 0) {
			return this.create(product);
		}

		const existingProduct = this.get(product.productId);
		if (existingProduct) {
			this.update(product);
			return existingProduct.productId;
		} else {
			if (!product.viewed) {
				product.viewed = 0;
			}
			return this.create(product);
		}
	}
}
