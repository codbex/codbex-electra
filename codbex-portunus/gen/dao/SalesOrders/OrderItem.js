const query = require("db/query");
const producer = require("messaging/producer");
const extensions = require('extensions/extensions');
const daoApi = require("db/dao");

let dao = daoApi.create({
	table: "CODBEX_ORDERITEM",
	properties: [
		{
			name: "Id",
			column: "ORDERITEM_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Order",
			column: "ORDERITEM_ORDER",
			type: "INTEGER",
		},
 {
			name: "Product",
			column: "ORDERITEM_PRODUCT",
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

exports.list = function(settings) {
	return dao.list(settings);
};

exports.get = function(id) {
	return dao.find(id);
};

exports.create = function(entity) {
	let id = dao.insert(entity);
	triggerEvent({
		operation: "create",
		table: "CODBEX_ORDERITEM",
		entity: entity,
		key: {
			name: "Id",
			column: "ORDERITEM_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	dao.update(entity);
	triggerEvent({
		operation: "update",
		table: "CODBEX_ORDERITEM",
		entity: entity,
		key: {
			name: "Id",
			column: "ORDERITEM_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_ORDERITEM",
		entity: entity,
		key: {
			name: "Id",
			column: "ORDERITEM_ID",
			value: id
		}
	});
};

exports.count = function (Order) {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_ORDERITEM" WHERE "ORDERITEM_ORDER" = ?', [Order]);
	if (resultSet !== null && resultSet[0] !== null) {
		if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
			return resultSet[0].COUNT;
		} else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
			return resultSet[0].count;
		}
	}
	return 0;
};

exports.customDataCount = function() {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_ORDERITEM"');
	if (resultSet !== null && resultSet[0] !== null) {
		if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
			return resultSet[0].COUNT;
		} else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
			return resultSet[0].count;
		}
	}
	return 0;
};

function triggerEvent(data) {
	let triggerExtensions = extensions.getExtensions("new-portunus/SalesOrders/OrderItem");
	try {
		for (let i=0; i < triggerExtensions.length; i++) {
			let module = triggerExtensions[i];
			let triggerExtension = require(module);
			try {
				triggerExtension.trigger(data);
			} catch (error) {
				console.error(error);
			}			
		}
	} catch (error) {
		console.error(error);
	}
	producer.queue("new-portunus/SalesOrders/OrderItem").send(JSON.stringify(data));
}