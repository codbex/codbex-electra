const query = require("db/query");
const producer = require("messaging/producer");
const extensions = require('extensions/extensions');
const daoApi = require("db/dao");
const EntityUtils = require("new-portunus/gen/dao/utils/EntityUtils");

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
			name: "Location",
			column: "PRODUCT_LOCATION",
			type: "VARCHAR",
		},
 {
			name: "Variant",
			column: "PRODUCT_VARIANT",
			type: "VARCHAR",
		},
 {
			name: "Override",
			column: "PRODUCT_OVERRIDE",
			type: "VARCHAR",
		},
 {
			name: "Quantity",
			column: "PRODUCT_QUANTITY",
			type: "INTEGER",
		},
 {
			name: "StockStatus",
			column: "PRODUCT_STOCKSTATUS",
			type: "INTEGER",
		},
 {
			name: "Image",
			column: "PRODUCT_IMAGE",
			type: "VARCHAR",
		},
 {
			name: "Manifacturer",
			column: "PRODUCT_MANIFACTURER",
			type: "INTEGER",
		},
 {
			name: "Shipping",
			column: "PRODUCT_SHIPPING",
			type: "TINYINT",
		},
 {
			name: "Price",
			column: "PRODUCT_PRICE",
			type: "DECIMAL",
		},
 {
			name: "Points",
			column: "PRODUCT_POINTS",
			type: "INTEGER",
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
			name: "Subtract",
			column: "PRODUCT_SUBTRACT",
			type: "TINYINT",
		},
 {
			name: "Minimum",
			column: "PRODUCT_MINIMUM",
			type: "INTEGER",
		},
 {
			name: "Status",
			column: "PRODUCT_STATUS",
			type: "INTEGER",
		},
 {
			name: "DateAdded",
			column: "PRODUCT_DATEADDED",
			type: "DATE",
		},
 {
			name: "DateModified",
			column: "PRODUCT_DATEMODIFIED",
			type: "DATE",
		}
]
});

exports.list = function(settings) {
	return dao.list(settings).map(function(e) {
		EntityUtils.setDate(e, "DateAvailable");
		EntityUtils.setDate(e, "DateAdded");
		EntityUtils.setDate(e, "DateModified");
		return e;
	});
};

exports.get = function(id) {
	let entity = dao.find(id);
	EntityUtils.setDate(entity, "DateAvailable");
	EntityUtils.setDate(entity, "DateAdded");
	EntityUtils.setDate(entity, "DateModified");
	return entity;
};

exports.create = function(entity) {
	EntityUtils.setLocalDate(entity, "DateAvailable");
	EntityUtils.setLocalDate(entity, "DateAdded");
	EntityUtils.setLocalDate(entity, "DateModified");
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
	// EntityUtils.setLocalDate(entity, "DateAvailable");
	// EntityUtils.setLocalDate(entity, "DateAdded");
	// EntityUtils.setLocalDate(entity, "DateModified");
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
	let triggerExtensions = extensions.getExtensions("new-portunus/Products/Product");
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
	producer.queue("new-portunus/Products/Product").send(JSON.stringify(data));
}