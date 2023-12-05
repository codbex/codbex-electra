const query = require("db/query");
const producer = require("messaging/producer");
const extensions = require('extensions/extensions');
const daoApi = require("db/dao");

let dao = daoApi.create({
	table: "CODBEX_BANK",
	properties: [
		{
			name: "Id",
			column: "BANK_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Name",
			column: "BANK_NAME",
			type: "VARCHAR",
		},
 {
			name: "BranchNumber",
			column: "BANK_BRANCHNUMBER",
			type: "VARCHAR",
		},
 {
			name: "SwiftCode",
			column: "BANK_SWIFTCODE",
			type: "VARCHAR",
		},
 {
			name: "AccountName",
			column: "BANK_ACCOUNTNAME",
			type: "VARCHAR",
		},
 {
			name: "AccountNumber",
			column: "BANK_ACCOUNTNUMBER",
			type: "VARCHAR",
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
		table: "CODBEX_BANK",
		entity: entity,
		key: {
			name: "Id",
			column: "BANK_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	dao.update(entity);
	triggerEvent({
		operation: "update",
		table: "CODBEX_BANK",
		entity: entity,
		key: {
			name: "Id",
			column: "BANK_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_BANK",
		entity: entity,
		key: {
			name: "Id",
			column: "BANK_ID",
			value: id
		}
	});
};

exports.count = function () {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_BANK" WHERE  = ?', []);
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
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_BANK"');
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
	let triggerExtensions = extensions.getExtensions("codbex-portunus/entities/Bank");
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
	producer.queue("codbex-portunus/entities/Bank").send(JSON.stringify(data));
}