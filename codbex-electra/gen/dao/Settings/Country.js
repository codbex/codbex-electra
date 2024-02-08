import { query } from "@dirigible/db";
import { producer } from "@dirigible/messaging";
import { extensions } from "@dirigible/extensions";
import { dao as daoApi } from "@dirigible/db";
import * as EntityUtils from "../utils/EntityUtils";

let dao = daoApi.create({
	table: "CODBEX_COUNTRY",
	properties: [
		{
			name: "Id",
			column: "COUNTRY_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 		{
			name: "Name",
			column: "COUNTRY_NAME",
			type: "VARCHAR",
		},
 		{
			name: "Status",
			column: "COUNTRY_STATUS",
			type: "INTEGER",
		},
 		{
			name: "IsoCode2",
			column: "COUNTRY_ISOCODE2",
			type: "VARCHAR",
		},
 		{
			name: "IsoCode3",
			column: "COUNTRY_ISOCODE3",
			type: "VARCHAR",
		},
 		{
			name: "PostcodeRequired",
			column: "COUNTRY_POSTCODEREQUIRED",
			type: "BOOLEAN",
		}
]});

export const list = (settings) => {
	return dao.list(settings).map(function(e) {
		EntityUtils.setBoolean(e, "PostcodeRequired");
		return e;
	});
}

export const get = (id) => {
	let entity = dao.find(id);
	EntityUtils.setBoolean(entity, "PostcodeRequired");
	return entity;
}

export const create = (entity) => {
	EntityUtils.setBoolean(entity, "PostcodeRequired");
	let id = dao.insert(entity);
	triggerEvent({
		operation: "create",
		table: "CODBEX_COUNTRY",
		entity: entity,
		key: {
			name: "Id",
			column: "COUNTRY_ID",
			value: id
		}
	});
	return id;
}

export const update = (entity) => {
	EntityUtils.setBoolean(entity, "PostcodeRequired");
	dao.update(entity);
	triggerEvent({
		operation: "update",
		table: "CODBEX_COUNTRY",
		entity: entity,
		key: {
			name: "Id",
			column: "COUNTRY_ID",
			value: entity.Id
		}
	});
}

export const remove = (id) => {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_COUNTRY",
		entity: entity,
		key: {
			name: "Id",
			column: "COUNTRY_ID",
			value: id
		}
	});
}

export const count = () => {
	return dao.count();
}

export const customDataCount = () => {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_COUNTRY"');
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
	const triggerExtensions = await extensions.loadExtensionModules("codbex-electra/Settings/Country", ["trigger"]);
	triggerExtensions.forEach(triggerExtension => {
		try {
			triggerExtension.trigger(data);
		} catch (error) {
			console.error(error);
		}			
	});
	producer.queue("codbex-electra/Settings/Country").send(JSON.stringify(data));
}
