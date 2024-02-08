import { query } from "@dirigible/db";
import { producer } from "@dirigible/messaging";
import { extensions } from "@dirigible/extensions";
import { dao as daoApi } from "@dirigible/db";

let dao = daoApi.create({
	table: "CODBEX_MANUFACTURER",
	properties: [
		{
			name: "Id",
			column: "MANUFACTURER_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 		{
			name: "Name",
			column: "MANUFACTURER_NAME",
			type: "VARCHAR",
		},
 		{
			name: "Image",
			column: "MANUFACTURER_IMAGE",
			type: "VARCHAR",
		}
]});

export const list = (settings) => {
	return dao.list(settings);
}

export const get = (id) => {
	return dao.find(id);
}

export const create = (entity) => {
	let id = dao.insert(entity);
	triggerEvent({
		operation: "create",
		table: "CODBEX_MANUFACTURER",
		entity: entity,
		key: {
			name: "Id",
			column: "MANUFACTURER_ID",
			value: id
		}
	});
	return id;
}

export const update = (entity) => {
	dao.update(entity);
	triggerEvent({
		operation: "update",
		table: "CODBEX_MANUFACTURER",
		entity: entity,
		key: {
			name: "Id",
			column: "MANUFACTURER_ID",
			value: entity.Id
		}
	});
}

export const remove = (id) => {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_MANUFACTURER",
		entity: entity,
		key: {
			name: "Id",
			column: "MANUFACTURER_ID",
			value: id
		}
	});
}

export const count = () => {
	return dao.count();
}

export const customDataCount = () => {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_MANUFACTURER"');
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
	const triggerExtensions = await extensions.loadExtensionModules("codbex-electra/Products/Manufacturer", ["trigger"]);
	triggerExtensions.forEach(triggerExtension => {
		try {
			triggerExtension.trigger(data);
		} catch (error) {
			console.error(error);
		}			
	});
	producer.queue("codbex-electra/Products/Manufacturer").send(JSON.stringify(data));
}
