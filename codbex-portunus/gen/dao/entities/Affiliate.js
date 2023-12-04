const query = require("db/query");
const producer = require("messaging/producer");
const extensions = require('extensions/extensions');
const daoApi = require("db/dao");

let dao = daoApi.create({
	table: "CODBEX_AFFILIATE",
	properties: [
		{
			name: "Id",
			column: "AFFILIATE_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Customer",
			column: "AFFILIATE_CUSTOMER",
			type: "INTEGER",
		},
 {
			name: "Company",
			column: "AFFILIATE_COMPANY",
			type: "VARCHAR",
		},
 {
			name: "Website",
			column: "AFFILIATE_WEBSITE",
			type: "VARCHAR",
		},
 {
			name: "Tracking",
			column: "AFFILIATE_TRACKING",
			type: "VARCHAR",
		},
 {
			name: "Commission",
			column: "AFFILIATE_COMMISSION",
			type: "DECIMAL",
		},
 {
			name: "Tax",
			column: "AFFILIATE_TAX",
			type: "VARCHAR",
		},
 {
			name: "Payment",
			column: "AFFILIATE_PAYMENT",
			type: "VARCHAR",
		},
 {
			name: "Cheque",
			column: "AFFILIATE_CHEQUE",
			type: "VARCHAR",
		},
 {
			name: "Paypal",
			column: "AFFILIATE_PAYPAL",
			type: "VARCHAR",
		},
 {
			name: "Bank",
			column: "AFFILIATE_BANK",
			type: "INTEGER",
		},
 {
			name: "CustomField",
			column: "AFFILIATE_CUSTOMFIELD",
			type: "VARCHAR",
		},
 {
			name: "Status",
			column: "AFFILIATE_STATUS",
			type: "INTEGER",
		},
 {
			name: "DateAdded",
			column: "AFFILIATE_DATEADDED",
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
		table: "CODBEX_AFFILIATE",
		entity: entity,
		key: {
			name: "Id",
			column: "AFFILIATE_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	dao.update(entity);
	triggerEvent({
		operation: "update",
		table: "CODBEX_AFFILIATE",
		entity: entity,
		key: {
			name: "Id",
			column: "AFFILIATE_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_AFFILIATE",
		entity: entity,
		key: {
			name: "Id",
			column: "AFFILIATE_ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_AFFILIATE"');
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
	let triggerExtensions = extensions.getExtensions("new-portunus/entities/Affiliate");
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
	producer.queue("new-portunus/entities/Affiliate").send(JSON.stringify(data));
}