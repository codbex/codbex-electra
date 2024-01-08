const query = require("db/query");
const producer = require("messaging/producer");
const extensions = require('extensions/extensions');
const daoApi = require("db/dao");

let dao = daoApi.create({
	table: "CODBEX_SALESORDERSHIPPING",
	properties: [
		{
			name: "Id",
			column: "SALESORDERSHIPPING_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Zone",
			column: "SALESORDERSHIPPING_ZONE",
			type: "INTEGER",
		},
 {
			name: "FirstName",
			column: "SALESORDERSHIPPING_FIRSTNAME",
			type: "VARCHAR",
		},
 {
			name: "LastName",
			column: "SALESORDERSHIPPING_LASTNAME",
			type: "VARCHAR",
		},
 {
			name: "Company",
			column: "SALESORDERSHIPPING_COMPANY",
			type: "VARCHAR",
		},
 {
			name: "Address1",
			column: "SALESORDERSHIPPING_ADDRESS1",
			type: "VARCHAR",
		},
 {
			name: "Address2",
			column: "SALESORDERSHIPPING_ADDRESS2",
			type: "VARCHAR",
		},
 {
			name: "City",
			column: "SALESORDERSHIPPING_CITY",
			type: "VARCHAR",
		},
 {
			name: "Postcode",
			column: "SALESORDERSHIPPING_POSTCODE",
			type: "VARCHAR",
		},
 {
			name: "Country",
			column: "SALESORDERSHIPPING_COUNTRY",
			type: "INTEGER",
		},
 {
			name: "AddressFormat",
			column: "SALESORDERSHIPPING_ADDRESSFORMAT",
			type: "VARCHAR",
		},
 {
			name: "CustomField",
			column: "SALESORDERSHIPPING_CUSTOMFIELD",
			type: "VARCHAR",
		},
 {
			name: "Method",
			column: "SALESORDERSHIPPING_METHOD",
			type: "VARCHAR",
		},
 {
			name: "Code",
			column: "SALESORDERSHIPPING_CODE",
			type: "VARCHAR",
		},
 {
			name: "SalesOrder",
			column: "SALESORDERSHIPPING_SALESORDER",
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
		table: "CODBEX_SALESORDERSHIPPING",
		entity: entity,
		key: {
			name: "Id",
			column: "SALESORDERSHIPPING_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	dao.update(entity);
	triggerEvent({
		operation: "update",
		table: "CODBEX_SALESORDERSHIPPING",
		entity: entity,
		key: {
			name: "Id",
			column: "SALESORDERSHIPPING_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_SALESORDERSHIPPING",
		entity: entity,
		key: {
			name: "Id",
			column: "SALESORDERSHIPPING_ID",
			value: id
		}
	});
};

exports.count = function (SalesOrder) {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALESORDERSHIPPING" WHERE "SALESORDERSHIPPING_SALESORDER" = ?', [SalesOrder]);
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
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALESORDERSHIPPING"');
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
	let triggerExtensions = extensions.getExtensions("codbex-portunus/SalesOrders/SalesOrderShipping");
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
	producer.queue("codbex-portunus/SalesOrders/SalesOrderShipping").send(JSON.stringify(data));
}