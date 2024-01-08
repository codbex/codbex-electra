const query = require("db/query");
const producer = require("messaging/producer");
const extensions = require('extensions/extensions');
const daoApi = require("db/dao");

let dao = daoApi.create({
	table: "CODBEX_SALESORDERPAYMENT",
	properties: [
		{
			name: "Id",
			column: "SALESORDERPAYMENT_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "FirstName",
			column: "SALESORDERPAYMENT_FIRSTNAME",
			type: "VARCHAR",
		},
 {
			name: "LastName",
			column: "SALESORDERPAYMENT_LASTNAME",
			type: "VARCHAR",
		},
 {
			name: "Zone",
			column: "SALESORDERPAYMENT_ZONE",
			type: "INTEGER",
		},
 {
			name: "Company",
			column: "SALESORDERPAYMENT_COMPANY",
			type: "VARCHAR",
		},
 {
			name: "Address1",
			column: "SALESORDERPAYMENT_ADDRESS1",
			type: "VARCHAR",
		},
 {
			name: "Address2",
			column: "SALESORDERPAYMENT_ADDRESS2",
			type: "VARCHAR",
		},
 {
			name: "City",
			column: "SALESORDERPAYMENT_CITY",
			type: "VARCHAR",
		},
 {
			name: "Postcode",
			column: "SALESORDERPAYMENT_POSTCODE",
			type: "VARCHAR",
		},
 {
			name: "Country",
			column: "SALESORDERPAYMENT_COUNTRY",
			type: "INTEGER",
		},
 {
			name: "AddressFormat",
			column: "SALESORDERPAYMENT_ADDRESSFORMAT",
			type: "VARCHAR",
		},
 {
			name: "CustomField",
			column: "SALESORDERPAYMENT_CUSTOMFIELD",
			type: "VARCHAR",
		},
 {
			name: "Method",
			column: "SALESORDERPAYMENT_METHOD",
			type: "VARCHAR",
		},
 {
			name: "Code",
			column: "SALESORDERPAYMENT_CODE",
			type: "VARCHAR",
		},
 {
			name: "SalesOrder",
			column: "SALESORDERPAYMENT_SALESORDER",
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
		table: "CODBEX_SALESORDERPAYMENT",
		entity: entity,
		key: {
			name: "Id",
			column: "SALESORDERPAYMENT_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	dao.update(entity);
	triggerEvent({
		operation: "update",
		table: "CODBEX_SALESORDERPAYMENT",
		entity: entity,
		key: {
			name: "Id",
			column: "SALESORDERPAYMENT_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_SALESORDERPAYMENT",
		entity: entity,
		key: {
			name: "Id",
			column: "SALESORDERPAYMENT_ID",
			value: id
		}
	});
};

exports.count = function (SalesOrder) {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALESORDERPAYMENT" WHERE "SALESORDERPAYMENT_SALESORDER" = ?', [SalesOrder]);
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
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALESORDERPAYMENT"');
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
	let triggerExtensions = extensions.getExtensions("codbex-portunus/SalesOrders/SalesOrderPayment");
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
	producer.queue("codbex-portunus/SalesOrders/SalesOrderPayment").send(JSON.stringify(data));
}