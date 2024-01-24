const query = require("db/query");
const producer = require("messaging/producer");
const extensions = require('extensions/extensions');
const daoApi = require("db/dao");
const EntityUtils = require("codbex-electra/gen/dao/utils/EntityUtils");

let dao = daoApi.create({
	table: "CODBEX_PRODUCT",
	properties: [
		{
			name: "Id",
			column: "PRODUCT_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Model",
			column: "PRODUCT_MODEL",
			type: "VARCHAR",
		},
 {
			name: "Manufacturer",
			column: "PRODUCT_MANUFACTURER",
			type: "INTEGER",
		},
 {
			name: "Status",
			column: "PRODUCT_STATUS",
			type: "BOOLEAN",
		},
 {
			name: "Quantity",
			column: "PRODUCT_QUANTITY",
			type: "INTEGER",
		},
 {
			name: "Price",
			column: "PRODUCT_PRICE",
			type: "DECIMAL",
		},
 {
			name: "Image",
			column: "PRODUCT_IMAGE",
			type: "VARCHAR",
		},
 {
			name: "SKU",
			column: "PRODUCT_SKU",
			type: "VARCHAR",
		},
 {
			name: "UPC",
			column: "PRODUCT_UPC",
			type: "VARCHAR",
		},
 {
			name: "EAN",
			column: "PRODUCT_EAN",
			type: "VARCHAR",
		},
 {
			name: "JAN",
			column: "PRODUCT_JAN",
			type: "VARCHAR",
		},
 {
			name: "ISBN",
			column: "PRODUCT_ISBN",
			type: "VARCHAR",
		},
 {
			name: "MPN",
			column: "PRODUCT_MPN",
			type: "VARCHAR",
		},
 {
			name: "DateAvailable",
			column: "PRODUCT_DATEAVAILABLE",
			type: "DATE",
		},
 {
			name: "Weight",
			column: "PRODUCT_WEIGHT",
			type: "DECIMAL",
		},
 {
			name: "Length",
			column: "PRODUCT_LENGTH",
			type: "DECIMAL",
		},
 {
			name: "Width",
			column: "PRODUCT_WIDTH",
			type: "DECIMAL",
		},
 {
			name: "Height",
			column: "PRODUCT_HEIGHT",
			type: "DECIMAL",
		},
 {
			name: "DateAdded",
			column: "PRODUCT_DATEADDED",
			type: "TIMESTAMP",
		},
 {
			name: "DateModified",
			column: "PRODUCT_DATEMODIFIED",
			type: "TIMESTAMP",
		},
 {
			name: "UpdatedBy",
			column: "PRODUCT_UPDATEDBY",
			type: "VARCHAR",
		},
 {
			name: "Points",
			column: "PRODUCT_POINTS",
			type: "INTEGER",
		},
 {
			name: "Shipping",
			column: "PRODUCT_SHIPPING",
			type: "BOOLEAN",
		},
 {
			name: "Location",
			column: "PRODUCT_LOCATION",
			type: "VARCHAR",
		},
 {
			name: "Subtract",
			column: "PRODUCT_SUBTRACT",
			type: "BOOLEAN",
		},
 {
			name: "Minimum",
			column: "PRODUCT_MINIMUM",
			type: "INTEGER",
		},
 {
			name: "StockStatus",
			column: "PRODUCT_STOCKSTATUS",
			type: "INTEGER",
		}
]
});

exports.list = function(settings) {
	return dao.list(settings).map(function(e) {
		EntityUtils.setBoolean(e, "Status");
		EntityUtils.setDate(e, "DateAvailable");
		EntityUtils.setBoolean(e, "Shipping");
		EntityUtils.setBoolean(e, "Subtract");
		return e;
	});
};

exports.get = function(id) {
	let entity = dao.find(id);
	EntityUtils.setBoolean(entity, "Status");
	EntityUtils.setDate(entity, "DateAvailable");
	EntityUtils.setBoolean(entity, "Shipping");
	EntityUtils.setBoolean(entity, "Subtract");
	return entity;
};

exports.create = function(entity) {
	EntityUtils.setBoolean(entity, "Status");
	EntityUtils.setLocalDate(entity, "DateAvailable");
	EntityUtils.setBoolean(entity, "Shipping");
	EntityUtils.setBoolean(entity, "Subtract");
	entity["DateModified"] = Date.now();
	entity["UpdatedBy"] = require("security/user").getName();
	let id = dao.insert(entity);
	triggerEvent({
		operation: "create",
		table: "CODBEX_PRODUCT",
		entity: entity,
		key: {
			name: "Id",
			column: "PRODUCT_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	EntityUtils.setBoolean(entity, "Status");
	// EntityUtils.setLocalDate(entity, "DateAvailable");
	EntityUtils.setBoolean(entity, "Shipping");
	EntityUtils.setBoolean(entity, "Subtract");
	entity["DateModified"] = Date.now();
	entity["UpdatedBy"] = require("security/user").getName();
	dao.update(entity);
	triggerEvent({
		operation: "update",
		table: "CODBEX_PRODUCT",
		entity: entity,
		key: {
			name: "Id",
			column: "PRODUCT_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_PRODUCT",
		entity: entity,
		key: {
			name: "Id",
			column: "PRODUCT_ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PRODUCT"');
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
	let triggerExtensions = extensions.getExtensions("codbex-electra/Products/Product");
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
	producer.queue("codbex-electra/Products/Product").send(JSON.stringify(data));
}