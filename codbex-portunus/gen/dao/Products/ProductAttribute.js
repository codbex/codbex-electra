const query = require("db/query");
const producer = require("messaging/producer");
const extensions = require('extensions/extensions');
const daoApi = require("db/dao");

let dao = daoApi.create({
	table: "CODBEX_PRODUCTATTRIBUTE",
	properties: [
		{
			name: "Id",
			column: "PRODUCTATTRIBUTE_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Atttribute",
			column: "PRODUCTATTRIBUTE_ATTTRIBUTE",
			type: "INTEGER",
		},
 {
			name: "Product",
			column: "PRODUCTATTRIBUTE_PRODUCT",
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
	let id = dao.insert(entity);
	triggerEvent({
		operation: "create",
		table: "CODBEX_PRODUCTATTRIBUTE",
		entity: entity,
		key: {
			name: "Id",
			column: "PRODUCTATTRIBUTE_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	dao.update(entity);
	triggerEvent({
		operation: "update",
		table: "CODBEX_PRODUCTATTRIBUTE",
		entity: entity,
		key: {
			name: "Id",
			column: "PRODUCTATTRIBUTE_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_PRODUCTATTRIBUTE",
		entity: entity,
		key: {
			name: "Id",
			column: "PRODUCTATTRIBUTE_ID",
			value: id
		}
	});
};

exports.count = function () {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PRODUCTATTRIBUTE" WHERE  = ?', []);
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
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PRODUCTATTRIBUTE"');
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
	let triggerExtensions = extensions.getExtensions("codbex-portunus/Products/ProductAttribute");
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
	producer.queue("codbex-portunus/Products/ProductAttribute").send(JSON.stringify(data));
}