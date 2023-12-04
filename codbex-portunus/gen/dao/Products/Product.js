const query = require("db/query");
const producer = require("messaging/producer");
const extensions = require('extensions/extensions');
const daoApi = require("db/dao");

let dao = daoApi.create({
	table: "CODBEX_PRODUCTS",
	properties: [
		{
			name: "Id",
			column: "PRODUCTS_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Name",
			column: "PRODUCTS_NAME",
			type: "VARCHAR",
		},
 {
			name: "Model",
			column: "PRODUCTS_MODEL",
			type: "VARCHAR",
		},
 {
			name: "Sku",
			column: "PRODUCTS_SKU",
			type: "VARCHAR",
		},
 {
			name: "Upc",
			column: "PRODUCTS_UPC",
			type: "VARCHAR",
		},
 {
			name: "Ean",
			column: "PRODUCTS_EAN",
			type: "VARCHAR",
		},
 {
			name: "Jan",
			column: "PRODUCTS_JAN",
			type: "VARCHAR",
		},
 {
			name: "Quantity",
			column: "PRODUCTS_QUANTITY",
			type: "INTEGER",
		},
 {
			name: "Price",
			column: "PRODUCTS_PRICE",
			type: "DECIMAL",
		},
 {
			name: "Location",
			column: "PRODUCTS_LOCATION",
			type: "VARCHAR",
		},
 {
			name: "Image",
			column: "PRODUCTS_IMAGE",
			type: "VARCHAR",
		},
 {
			name: "Weight",
			column: "PRODUCTS_WEIGHT",
			type: "DECIMAL",
		},
 {
			name: "Length",
			column: "PRODUCTS_LENGTH",
			type: "DECIMAL",
		},
 {
			name: "Width",
			column: "PRODUCTS_WIDTH",
			type: "DECIMAL",
		},
 {
			name: "Height",
			column: "PRODUCTS_HEIGHT",
			type: "DECIMAL",
		},
 {
			name: "DateAdded",
			column: "PRODUCTS_DATEADDED",
			type: "VARCHAR",
		},
 {
			name: "DateModified",
			column: "PRODUCTS_DATEMODIFIED",
			type: "VARCHAR",
		},
 {
			name: "ProductStatus",
			column: "PRODUCTS_PRODUCTSTATUS",
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
		table: "CODBEX_PRODUCTS",
		entity: entity,
		key: {
			name: "Id",
			column: "PRODUCTS_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	dao.update(entity);
	triggerEvent({
		operation: "update",
		table: "CODBEX_PRODUCTS",
		entity: entity,
		key: {
			name: "Id",
			column: "PRODUCTS_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_PRODUCTS",
		entity: entity,
		key: {
			name: "Id",
			column: "PRODUCTS_ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PRODUCTS"');
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
	let triggerExtensions = extensions.getExtensions("codbex-portunus/Products/Product");
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
	producer.queue("codbex-portunus/Products/Product").send(JSON.stringify(data));
}