import { dao as daoApi } from "@dirigible/db";

const CONFIG = {
	table: "oc_language",
	properties: [
		{
			"id": true,
			"name": "languageId",
			"column": "language_id",
			"type": "INTEGER",
			"autoIncrement": false
		},
		{
			"name": "name",
			"column": "name",
			"type": "VARCHAR"
		},
		{
			"name": "code",
			"column": "code",
			"type": "VARCHAR"
		},
		{
			"name": "locale",
			"column": "locale",
			"type": "VARCHAR"
		},
		{
			"name": "image",
			"column": "image",
			"type": "VARCHAR"
		},
		{
			"name": "directory",
			"column": "directory",
			"type": "VARCHAR"
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
		}
	]
};

const LOGGER_NAME = "OpenCartLanguageDAO";

export class OpenCartLanguageDAO {
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

	create(language) {
		return this.openCartDAO.insert(language);
	}

	update(language) {
		return this.openCartDAO.update(language);
	}

	upsert(language) {
		if (language.languageId && language.languageId !== 0) {
			this.update(language);
			return language.languageId;
		} else {
			return this.create(language);
		}
	}
}
