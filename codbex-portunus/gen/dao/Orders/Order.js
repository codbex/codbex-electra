const query = require("db/query");
const producer = require("messaging/producer");
const extensions = require('extensions/extensions');
const daoApi = require("db/dao");

let dao = daoApi.create({
	table: "CODBEX_ORDERS",
	properties: [
		{
			name: "Id",
			column: "ORDERS_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "TransactionId",
			column: "ORDERS_TRANSACTIONID",
			type: "VARCHAR",
		},
 {
			name: "InvoiceNumber",
			column: "ORDERS_INVOICENUMBER",
			type: "VARCHAR",
		},
 {
			name: "InvoicePrefix",
			column: "ORDERS_INVOICEPREFIX",
			type: "VARCHAR",
		},
 {
			name: "CustomerId",
			column: "ORDERS_CUSTOMERID",
			type: "VARCHAR",
		},
 {
			name: "OrderStatus",
			column: "ORDERS_ORDERSTATUSID",
			type: "INTEGER",
		},
 {
			name: "CustomerId",
			column: "ORDERS_CUSTOMERID",
			type: "INTEGER",
		},
 {
			name: "CurrenciesId",
			column: "ORDERS_CURRENCIESID",
			type: "INTEGER",
		},
 {
			name: "StoreId",
			column: "ORDERS_STOREID",
			type: "INTEGER",
		},
 {
			name: "PaymentFirstName",
			column: "ORDERS_PAYMENTFIRSTNAME",
			type: "VARCHAR",
		},
 {
			name: "PaymentLastName",
			column: "ORDERS_PAYMENTLASTNAME",
			type: "VARCHAR",
		},
 {
			name: "PaymentCompany",
			column: "ORDERS_PAYMENTCOMPANY",
			type: "VARCHAR",
		},
 {
			name: "PaymentAddress1",
			column: "ORDERS_PAYMENTADDRESS1",
			type: "VARCHAR",
		},
 {
			name: "PaymentAddress2",
			column: "ORDERS_PAYMENTADDRESS2",
			type: "VARCHAR",
		},
 {
			name: "PaymentCity",
			column: "ORDERS_PAYMENTCITY",
			type: "VARCHAR",
		},
 {
			name: "PaymentPostcode",
			column: "ORDERS_PAYMENTPOSTCODE",
			type: "VARCHAR",
		},
 {
			name: "PaymentCountry",
			column: "ORDERS_PAYMENTCOUNTRY",
			type: "VARCHAR",
		},
 {
			name: "PaymentMethod",
			column: "ORDERS_PAYMENTMETHOD",
			type: "VARCHAR",
		},
 {
			name: "ShippingFirstName",
			column: "ORDERS_SHIPPINGFIRSTNAME",
			type: "VARCHAR",
		},
 {
			name: "ShippingLastName",
			column: "ORDERS_SHIPPINGLASTNAME",
			type: "VARCHAR",
		},
 {
			name: "ShippingCompany",
			column: "ORDERS_SHIPPINGCOMPANY",
			type: "VARCHAR",
		},
 {
			name: "ShippingAddress1",
			column: "ORDERS_SHIPPINGADDRESS1",
			type: "VARCHAR",
		},
 {
			name: "ShippingAddress2",
			column: "ORDERS_SHIPPINGADDRESS2",
			type: "VARCHAR",
		},
 {
			name: "ShippingCity",
			column: "ORDERS_SHIPPINGCITY",
			type: "VARCHAR",
		},
 {
			name: "ShippingPostcode",
			column: "ORDERS_SHIPPINGPOSTCODE",
			type: "VARCHAR",
		},
 {
			name: "ShippingCountry",
			column: "ORDERS_SHIPPINGCOUNTRY",
			type: "VARCHAR",
		},
 {
			name: "ShippingMethod",
			column: "ORDERS_SHIPPINGMETHOD",
			type: "VARCHAR",
		},
 {
			name: "Comment",
			column: "ORDERS_COMMENT",
			type: "VARCHAR",
		},
 {
			name: "Total",
			column: "ORDERS_TOTAL",
			type: "DECIMAL",
		},
 {
			name: "Tracking",
			column: "ORDERS_TRACKING",
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
		table: "CODBEX_ORDERS",
		entity: entity,
		key: {
			name: "Id",
			column: "ORDERS_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	dao.update(entity);
	triggerEvent({
		operation: "update",
		table: "CODBEX_ORDERS",
		entity: entity,
		key: {
			name: "Id",
			column: "ORDERS_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_ORDERS",
		entity: entity,
		key: {
			name: "Id",
			column: "ORDERS_ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_ORDERS"');
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
	let triggerExtensions = extensions.getExtensions("codbex-portunus/Orders/Order");
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
	producer.queue("codbex-portunus/Orders/Order").send(JSON.stringify(data));
}