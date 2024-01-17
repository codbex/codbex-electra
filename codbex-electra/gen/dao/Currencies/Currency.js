const query = require("db/query");
const producer = require("messaging/producer");
const extensions = require('extensions/extensions');
const daoApi = require("db/dao");

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
		},
 {
			name: "Status",
			column: "CURRENCY_STATUS",
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
};

exports.update = function(entity) {
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
};

exports.delete = function(id) {
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
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_CURRENCY"');
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
	let triggerExtensions = extensions.getExtensions("codbex-electra/Currencies/Currency");
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
	producer.queue("codbex-electra/Currencies/Currency").send(JSON.stringify(data));
}