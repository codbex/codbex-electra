import { dao as daoApi } from "@dirigible/db";

const CONFIG = {
	table: "oc_attribute_group",
	properties: [
		{
			"id": true,
			"name": "attributeGroupId",
			"column": "attribute_group_id",
			"type": "INTEGER",
			"autoIncrement": false
		},
		{
			"name": "sortOrder",
			"column": "sort_order",
			"type": "INTEGER"
		}
	]
};

const LOGGER_NAME = "OpenCartAttributeGroupDAO";

export class OpenCartAttributeGroupDAO {
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

	create(attributeGroup) {
		return this.openCartDAO.insert(attributeGroup);
	}

	update(attributeGroup) {
		return this.openCartDAO.update(attributeGroup);
	}

	upsert(attributeGroup) {
		if (!attributeGroup.attributeGroupId || attributeGroup.attributeGroupId === 0) {
			return this.create(attributeGroup);
		}

		const existingAttributeGroup = this.get(attributeGroup.attributeGroupId);
		if (existingAttributeGroup) {
			this.update(attributeGroup);
			return existingAttributeGroup.attributeGroupId;
		} else {
			return this.create(attributeGroup);
		}
	}
}
