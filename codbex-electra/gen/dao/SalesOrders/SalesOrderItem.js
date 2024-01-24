import { query } from "@dirigible/db";
import { producer } from "@dirigible/messaging";
import { extensions } from "@dirigible/extensions";
import { dao as daoApi } from "@dirigible/db";

let dao = daoApi.create({
	table: "CODBEX_SALESORDERITEM",
	properties: [
		{
			name: "Id",
			column: "ORDERITEM_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Product",
			column: "ORDERITEM_PRODUCT",
			type: "INTEGER",
		},
 {
			name: "SalesOrder",
			column: "ORDERITEM_SALESORDER",
			type: "INTEGER",
		},
 {
			name: "Name",
			column: "ORDERITEM_NAME",
			type: "VARCHAR",
		},
 {
			name: "Model",
			column: "ORDERITEM_MODEL",
			type: "VARCHAR",
		},
 {
			name: "Quantity",
			column: "ORDERITEM_QUANTITY",
			type: "INTEGER",
		},
 {
			name: "Price",
			column: "ORDERITEM_PRICE",
			type: "DECIMAL",
		},
 {
			name: "Total",
			column: "ORDERITEM_TOTAL",
			type: "DECIMAL",
		},
 {
			name: "Tax",
			column: "ORDERITEM_TAX",
			type: "DECIMAL",
		}
]
});

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
		table: "CODBEX_SALESORDERITEM",
		entity: entity,
		key: {
			name: "Id",
			column: "ORDERITEM_ID",
			value: id
		}
	});
	return id;
}

export const update = (entity) => {
	dao.update(entity);
	triggerEvent({
		operation: "update",
		table: "CODBEX_SALESORDERITEM",
		entity: entity,
		key: {
			name: "Id",
			column: "ORDERITEM_ID",
			value: entity.Id
		}
	});
}

export const remove = (id) => {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_SALESORDERITEM",
		entity: entity,
		key: {
			name: "Id",
			column: "ORDERITEM_ID",
			value: id
		}
	});
}

export const count = (SalesOrder) => {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALESORDERITEM" WHERE "ORDERITEM_SALESORDER" = ?', [SalesOrder]);
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
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALESORDERITEM"');
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
	const triggerExtensions = await extensions.loadExtensionModules("codbex-electra/SalesOrders/SalesOrderItem", ["trigger"]);
	triggerExtensions.forEach(triggerExtension => {
		try {
			triggerExtension.trigger(data);
		} catch (error) {
			console.error(error);
		}			
	});
	producer.queue("codbex-electra/SalesOrders/SalesOrderItem").send(JSON.stringify(data));
}