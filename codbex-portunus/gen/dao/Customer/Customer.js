const query = require("db/query");
const producer = require("messaging/producer");
const extensions = require('extensions/extensions');
const daoApi = require("db/dao");
const EntityUtils = require("codbex-portunus/gen/dao/utils/EntityUtils");

let dao = daoApi.create({
	table: "CODBEX_CUSTOMER",
	properties: [
		{
			name: "Id",
			column: "CUSTOMER_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Store",
			column: "CUSTOMER_STORE",
			type: "INTEGER",
		},
 {
			name: "FirstName",
			column: "CUSTOMER_FIRSTNAME",
			type: "VARCHAR",
		},
 {
			name: "LastName",
			column: "CUSTOMER_LASTNAME",
			type: "VARCHAR",
		},
 {
			name: "Email",
			column: "CUSTOMER_EMAIL",
			type: "VARCHAR",
		},
 {
			name: "Telephone",
			column: "CUSTOMER_TELEPHONE",
			type: "VARCHAR",
		},
 {
			name: "CustomField",
			column: "CUSTOMER_CUSTOMFIELD",
			type: "VARCHAR",
		},
 {
			name: "Status",
			column: "CUSTOMER_STATUS",
			type: "INTEGER",
		},
 {
			name: "Code",
			column: "CUSTOMER_PROPERTY9",
			type: "VARCHAR",
		},
 {
			name: "DateAdded",
			column: "CUSTOMER_PROPERTY10",
			type: "DATE",
		},
 {
			name: "Language",
			column: "CUSTOMER_LANGUAGE",
			type: "INTEGER",
		}
]
});

exports.list = function(settings) {
	return dao.list(settings).map(function(e) {
		EntityUtils.setDate(e, "DateAdded");
		return e;
	});
};

exports.get = function(id) {
	let entity = dao.find(id);
	EntityUtils.setDate(entity, "DateAdded");
	return entity;
};

exports.create = function(entity) {
	EntityUtils.setLocalDate(entity, "DateAdded");
	let id = dao.insert(entity);
	triggerEvent({
		operation: "create",
		table: "CODBEX_CUSTOMER",
		entity: entity,
		key: {
			name: "Id",
			column: "CUSTOMER_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	// EntityUtils.setLocalDate(entity, "DateAdded");
	dao.update(entity);
	triggerEvent({
		operation: "update",
		table: "CODBEX_CUSTOMER",
		entity: entity,
		key: {
			name: "Id",
			column: "CUSTOMER_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_CUSTOMER",
		entity: entity,
		key: {
			name: "Id",
			column: "CUSTOMER_ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_CUSTOMER"');
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
	let triggerExtensions = extensions.getExtensions("codbex-portunus/Customer/Customer");
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
	producer.queue("codbex-portunus/Customer/Customer").send(JSON.stringify(data));
}