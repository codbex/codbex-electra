import { dao as daoApi } from "@dirigible/db";

const CONFIG = {
	table: "oc_attribute",
	properties: [
		{
			"id": true,
			"name": "attributeId",
			"column": "attribute_id",
			"type": "INTEGER",
			"autoIncrement": false
		},
		{
			"name": "attributeGroupId",
			"column": "attribute_group_id",
			"type": "INTEGER"
		},
		{
			"name": "sortOrder",
			"column": "sort_order",
			"type": "INTEGER"
		}
	]

};

const LOGGER_NAME = "OpenCartAttributeDAO";

export class OpenCartAttributeDAO {
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

	create(attribute) {
		return this.openCartDAO.insert(attribute);
	}

	update(attribute) {
		return this.openCartDAO.update(attribute);
	}

	upsert(attribute) {
		if (!attribute.attributeId || attribute.attributeId === 0) {
			return this.create(attribute);
		}

		const existingattribute = this.get(attribute.attributeId);
		if (existingattribute) {
			this.update(attribute);
			return existingattribute.attributeId;
		} else {
			return this.create(attribute);
		}
	}
}
