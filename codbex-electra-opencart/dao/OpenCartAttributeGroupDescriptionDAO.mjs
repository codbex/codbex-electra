import { dao as daoApi, update } from "@dirigible/db";

const CONFIG = {
	table: "oc_attribute_group_description",
	properties: [
		{
			"name": "attributeGroupId",
			"column": "attribute_group_id",
			"type": "INTEGER",
			"id": true,
			"autoIncrement": false
		},
		{
			"name": "languageId",
			"column": "language_id",
			"type": "INTEGER"
		},
		{
			"name": "name",
			"column": "name",
			"type": "VARCHAR"
		}
	]

};

const UPDATE_STATEMENT = "UPDATE `oc_attribute_group_description` SET `name` = ? WHERE (`attribute_group_id`=? AND `language_id` = ?)";

const LOGGER_NAME = "OpenCartAttributeGroupDescriptionDAO";

export class OpenCartAttributeGroupDescriptionDAO {
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

	create(attributeGroupDescription) {
		return this.openCartDAO.insert(attributeGroupDescription);
	}

	update(attributeGroupDescription) {
		const params = [attributeGroupDescription.name, attributeGroupDescription.attributeGroupId, attributeGroupDescription.languageId];
		return update.execute(UPDATE_STATEMENT, params, this.dataSourceName);
	}

	upsert(attributeGroupDescription) {
		const querySettings = {
			attributeGroupId: attributeGroupDescription.attributeGroupId,
			languageId: attributeGroupDescription.languageId
		};
		const attributeGroupDescriptions = this.list(querySettings);

		if (attributeGroupDescriptions.length > 0) {
			this.update(attributeGroupDescription);
		} else {
			return this.create(attributeGroupDescription);
		}
	}

}
