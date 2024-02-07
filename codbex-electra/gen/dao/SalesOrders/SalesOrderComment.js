import { query } from "@dirigible/db";
import { producer } from "@dirigible/messaging";
import { extensions } from "@dirigible/extensions";
import { dao as daoApi } from "@dirigible/db";

let dao = daoApi.create({
	table: "CODBEX_SALESORDERCOMMENT",
	properties: [
		{
			name: "Id",
			column: "SALESORDERCOMMENT_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 		{
			name: "Text",
			column: "SALESORDERCOMMENT_TEXT",
			type: "VARCHAR",
		},
 		{
			name: "CreatedBy",
			column: "SALESORDERCOMMENT_CREATEDBY",
			type: "VARCHAR",
		},
 		{
			name: "CreatedAt",
			column: "SALESORDERCOMMENT_CREATEDAT",
			type: "TIMESTAMP",
		},
 		{
			name: "SalesOrder",
			column: "SALESORDERCOMMENT_SALESORDER",
			type: "INTEGER",
		}
]});

export const list = (settings) => {
	return dao.list(settings);
}

export const get = (id) => {
	return dao.find(id);
}

export const create = (entity) => {
	entity["CreatedBy"] = require("security/user").getName();
	entity["CreatedAt"] = Date.now();
	let id = dao.insert(entity);
	triggerEvent({
		operation: "create",
		table: "CODBEX_SALESORDERCOMMENT",
		entity: entity,
		key: {
			name: "Id",
			column: "SALESORDERCOMMENT_ID",
			value: id
		}
	});
	return id;
}

export const update = (entity) => {
	entity["CreatedBy"] = require("security/user").getName();
	entity["CreatedAt"] = Date.now();
	dao.update(entity);
	triggerEvent({
		operation: "update",
		table: "CODBEX_SALESORDERCOMMENT",
		entity: entity,
		key: {
			name: "Id",
			column: "SALESORDERCOMMENT_ID",
			value: entity.Id
		}
	});
}

export const remove = (id) => {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_SALESORDERCOMMENT",
		entity: entity,
		key: {
			name: "Id",
			column: "SALESORDERCOMMENT_ID",
			value: id
		}
	});
}

export const count = (SalesOrder) => {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALESORDERCOMMENT" WHERE "SALESORDERCOMMENT_SALESORDER" = ?', [SalesOrder]);
	if (resultSet !== null && resultSet[0] !== null) {
		if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
			return resultSet[0].COUNT;
		} else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
			return resultSet[0].count;
		}
	}
	return 0;
}

export const customDataCount = () => {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX__SALESORDERCOMMENT"');
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
	const triggerExtensions = await extensions.loadExtensionModules("codbex-electra/SalesOrders/SalesOrderComment", ["trigger"]);
	triggerExtensions.forEach(triggerExtension => {
		try {
			triggerExtension.trigger(data);
		} catch (error) {
			console.error(error);
		}			
	});
	producer.queue("codbex-electra/SalesOrders/SalesOrderComment").send(JSON.stringify(data));
}
