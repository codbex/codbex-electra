import { dao as daoApi, update } from "@dirigible/db";

const CONFIG = {
	table: "oc_attribute_description",
	properties: [
		{
			"id": true,
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
			"name": "name",
			"column": "name",
			"type": "VARCHAR",
			"autoIncrement": false
		}
	]
};

const UPDATE_STATEMENT = "UPDATE `oc_attribute_description` SET `name` = ? WHERE (`attribute_id`=? AND `language_id` = ?)";

const LOGGER_NAME = "OpenCartAttributeDescriptionDAO";

export class OpenCartAttributeDescriptionDAO {
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

	create(attributeDescription) {
		return this.openCartDAO.insert(attributeDescription);
	}

	update(attributeDescription) {
		const params = [attributeDescription.name, attributeDescription.attributeId, attributeDescription.languageId];
		return update.execute(UPDATE_STATEMENT, params, this.dataSourceName);
	}

	upsert(attributeDescription) {
		const querySettings = {
			attributeId: attributeDescription.attributeId,
			languageId: attributeDescription.languageId
		};
		const attributeDescriptions = this.list(querySettings);

		if (attributeDescriptions.length > 0) {
			this.update(attributeDescription);
		} else {
			return this.create(attributeDescription);
		}
	}

}
