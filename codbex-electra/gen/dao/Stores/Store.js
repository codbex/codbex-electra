import { query } from "@dirigible/db";
import { producer } from "@dirigible/messaging";
import { extensions } from "@dirigible/extensions";
import { dao as daoApi } from "@dirigible/db";
import * as EntityUtils from "../utils/EntityUtils";

let dao = daoApi.create({
	table: "CODBEX_STORE",
	properties: [
		{
			name: "Id",
			column: "STORE_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 		{
			name: "Name",
			column: "STORE_NAME",
			type: "VARCHAR",
			required: true
		},
 		{
			name: "Url",
			column: "STORE_URL",
			type: "VARCHAR",
		},
 		{
			name: "Type",
			column: "STORE_TYPE",
			type: "INTEGER",
			required: true
		},
 		{
			name: "Enabled",
			column: "STORE_ENABLED",
			type: "BOOLEAN",
			required: true
		}
]});

export const list = (settings) => {
	return dao.list(settings).map(function(e) {
		EntityUtils.setBoolean(e, "Enabled");
		return e;
	});
}

export const get = (id) => {
	let entity = dao.find(id);
	EntityUtils.setBoolean(entity, "Enabled");
	return entity;
}

export const create = (entity) => {
	EntityUtils.setBoolean(entity, "Enabled");
	let id = dao.insert(entity);
	triggerEvent({
		operation: "create",
		table: "CODBEX_STORE",
		entity: entity,
		key: {
			name: "Id",
			column: "STORE_ID",
			value: id
		}
	});
	return id;
}

export const update = (entity) => {
	EntityUtils.setBoolean(entity, "Enabled");
	dao.update(entity);
	triggerEvent({
		operation: "update",
		table: "CODBEX_STORE",
		entity: entity,
		key: {
			name: "Id",
			column: "STORE_ID",
			value: entity.Id
		}
	});
}

export const remove = (id) => {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_STORE",
		entity: entity,
		key: {
			name: "Id",
			column: "STORE_ID",
			value: id
		}
	});
}

export const count = () => {
	return dao.count();
}

export const customDataCount = () => {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX__STORE"');
	if (resultSet !== null && resultSet[0] !== null) {
		if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
			return resultSet[0].COUNT;
		} else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
			return resultSet[0].count;
		}
	}
	return 0;
}


const triggerEvent = async(data) => {
	const triggerExtensions = await extensions.loadExtensionModules("codbex-electra/Stores/Store", ["trigger"]);
	triggerExtensions.forEach(triggerExtension => {
		try {
			triggerExtension.trigger(data);
		} catch (error) {
			console.error(error);
		}			
	});
	producer.queue("codbex-electra/Stores/Store").send(JSON.stringify(data));
}
