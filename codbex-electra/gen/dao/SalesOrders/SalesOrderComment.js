const query = require("db/query");
const producer = require("messaging/producer");
const extensions = require('extensions/extensions');
const daoApi = require("db/dao");

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
]
});

exports.list = function(settings) {
	return dao.list(settings);
};

exports.get = function(id) {
	return dao.find(id);
};

exports.create = function(entity) {
	entity["CreatedBy"] = require("security/user").getName();
	entity["CreatedAt"] = new Date();
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
};

exports.update = function(entity) {
	entity["CreatedBy"] = require("security/user").getName();
	entity["CreatedAt"] = new Date();
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
};

exports.delete = function(id) {
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
};

exports.count = function (SalesOrder) {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALESORDERCOMMENT" WHERE "SALESORDERCOMMENT_SALESORDER" = ?', [SalesOrder]);
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
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALESORDERCOMMENT"');
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
	let triggerExtensions = extensions.getExtensions("codbex-electra/SalesOrders/SalesOrderComment");
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
	producer.queue("codbex-electra/SalesOrders/SalesOrderComment").send(JSON.stringify(data));
}