import { query } from "@dirigible/db";
import { producer } from "@dirigible/messaging";
import { extensions } from "@dirigible/extensions";
import { dao as daoApi } from "@dirigible/db";

let dao = daoApi.create({
	table: "CODBEX_SALESORDER",
	properties: [
		{
			name: "Id",
			column: "SALESORDER_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 		{
			name: "Total",
			column: "SALESORDER_TOTAL",
			type: "DECIMAL",
		},
 		{
			name: "Currency",
			column: "SALESORDER_CURRENCY",
			type: "INTEGER",
		},
 		{
			name: "Status",
			column: "SALESORDER_STATUS",
			type: "INTEGER",
		},
 		{
			name: "Store",
			column: "SALESORDER_STORE",
			type: "INTEGER",
		},
 		{
			name: "Customer",
			column: "SALESORDER_CUSTOMER",
			type: "INTEGER",
		},
 		{
			name: "DateAdded",
			column: "SALESORDER_DATEADDED",
			type: "TIMESTAMP",
		},
 		{
			name: "DateModified",
			column: "SALESORDER_DATEMODIFIED",
			type: "TIMESTAMP",
		},
 		{
			name: "UpdatedBy",
			column: "SALESORDER_UPDATEDBY",
			type: "VARCHAR",
		},
 		{
			name: "Tracking",
			column: "SALESORDER_TRACKING",
			type: "VARCHAR",
		},
 		{
			name: "Comment",
			column: "SALESORDER_COMMENT",
			type: "VARCHAR",
		},
 		{
			name: "InvoiceNumber",
			column: "SALESORDER_INVOICENUMBER",
			type: "INTEGER",
		},
 		{
			name: "InvoicePrefix",
			column: "SALESORDER_INVOICEPREFIX",
			type: "VARCHAR",
		},
 		{
			name: "Language",
			column: "SALESORDER_LANGUAGE",
			type: "INTEGER",
		},
 		{
			name: "AcceptLanguage",
			column: "SALESORDER_ACCEPTLANGUAGE",
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
	entity["DateModified"] = Date.now();
	entity["UpdatedBy"] = require("security/user").getName();
	let id = dao.insert(entity);
	triggerEvent({
		operation: "create",
		table: "CODBEX_SALESORDER",
		entity: entity,
		key: {
			name: "Id",
			column: "SALESORDER_ID",
			value: id
		}
	});
	return id;
}

export const update = (entity) => {
	entity["DateModified"] = Date.now();
	entity["UpdatedBy"] = require("security/user").getName();
	dao.update(entity);
	triggerEvent({
		operation: "update",
		table: "CODBEX_SALESORDER",
		entity: entity,
		key: {
			name: "Id",
			column: "SALESORDER_ID",
			value: entity.Id
		}
	});
}

export const remove = (id) => {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_SALESORDER",
		entity: entity,
		key: {
			name: "Id",
			column: "SALESORDER_ID",
			value: id
		}
	});
}

export const count = () => {
	return dao.count();
}

export const customDataCount = () => {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALESORDER"');
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
	const triggerExtensions = await extensions.loadExtensionModules("codbex-electra/SalesOrders/SalesOrder", ["trigger"]);
	triggerExtensions.forEach(triggerExtension => {
		try {
			triggerExtension.trigger(data);
		} catch (error) {
			console.error(error);
		}			
	});
	producer.queue("codbex-electra/SalesOrders/SalesOrder").send(JSON.stringify(data));
}
