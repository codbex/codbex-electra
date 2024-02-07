import { query } from "@dirigible/db";
import { producer } from "@dirigible/messaging";
import { extensions } from "@dirigible/extensions";
import { dao as daoApi } from "@dirigible/db";

let dao = daoApi.create({
	table: "CODBEX_CURRENCY",
	properties: [
		{
			name: "Id",
			column: "CURRENCY_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 		{
			name: "Title",
			column: "CURRENCY_TITLE",
			type: "VARCHAR",
		},
 		{
			name: "Status",
			column: "CURRENCY_STATUS",
			type: "INTEGER",
		},
 		{
			name: "Code",
			column: "CURRENCY_CODE",
			type: "VARCHAR",
		},
 		{
			name: "SymbolLeft",
			column: "CURRENCY_SYMBOLLEFT",
			type: "VARCHAR",
		},
 		{
			name: "SymbolRight",
			column: "CURRENCY_SYMBOLRIGHT",
			type: "VARCHAR",
		},
 		{
			name: "DecimalPlace",
			column: "CURRENCY_DECIMALPLACE",
			type: "CHAR",
		},
 		{
			name: "Value",
			column: "CURRENCY_VALUE",
			type: "DOUBLE",
		},
 		{
			name: "DateModified",
			column: "CURRENCY_DATEMODIFIED",
			type: "TIMESTAMP",
		}
]});

export const list = (settings) => {
	return dao.list(settings);
}

export const get = (id) => {
	return dao.find(id);
}

export const create = (entity) => {
	entity["DateModified"] = Date.now();
	let id = dao.insert(entity);
	triggerEvent({
		operation: "create",
		table: "CODBEX_CURRENCY",
		entity: entity,
		key: {
			name: "Id",
			column: "CURRENCY_ID",
			value: id
		}
	});
	return id;
}

export const update = (entity) => {
	entity["DateModified"] = Date.now();
	dao.update(entity);
	triggerEvent({
		operation: "update",
		table: "CODBEX_CURRENCY",
		entity: entity,
		key: {
			name: "Id",
			column: "CURRENCY_ID",
			value: entity.Id
		}
	});
}

export const remove = (id) => {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_CURRENCY",
		entity: entity,
		key: {
			name: "Id",
			column: "CURRENCY_ID",
			value: id
		}
	});
}

export const count = () => {
	return dao.count();
}

export const customDataCount = () => {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX__CURRENCY"');
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
	const triggerExtensions = await extensions.loadExtensionModules("codbex-electra/Settings/Currency", ["trigger"]);
	triggerExtensions.forEach(triggerExtension => {
		try {
			triggerExtension.trigger(data);
		} catch (error) {
			console.error(error);
		}			
	});
	producer.queue("codbex-electra/Settings/Currency").send(JSON.stringify(data));
}
