const query = require("db/query");
const producer = require("messaging/producer");
const extensions = require('extensions/extensions');
const daoApi = require("db/dao");

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
			name: "Customer",
			column: "SALESORDER_CUSTOMER",
			type: "INTEGER",
		},
 {
			name: "Store",
			column: "SALESORDER_STORE",
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
			name: "AcceptLanguage",
			column: "SALESORDER_ACCEPTLANGUAGE",
			type: "VARCHAR",
		},
 {
			name: "Language",
			column: "SALESORDER_LANGUAGE",
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
		table: "CODBEX_SALESORDER",
		entity: entity,
		key: {
			name: "Id",
			column: "SALESORDER_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
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
};

exports.delete = function(id) {
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
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALESORDER"');
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
	let triggerExtensions = extensions.getExtensions("codbex-electra/SalesOrders/SalesOrder");
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
	producer.queue("codbex-electra/SalesOrders/SalesOrder").send(JSON.stringify(data));
}