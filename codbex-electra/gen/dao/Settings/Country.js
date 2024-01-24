const query = require("db/query");
const producer = require("messaging/producer");
const extensions = require('extensions/extensions');
const daoApi = require("db/dao");
const EntityUtils = require("codbex-electra/gen/dao/utils/EntityUtils");

let dao = daoApi.create({
	table: "CODBEX_COUNTRY",
	properties: [
		{
			name: "Id",
			column: "COUNTRY_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Name",
			column: "COUNTRY_NAME",
			type: "VARCHAR",
		},
 {
			name: "Status",
			column: "COUNTRY_STATUS",
			type: "INTEGER",
		},
 {
			name: "IsoCode2",
			column: "COUNTRY_ISOCODE2",
			type: "VARCHAR",
		},
 {
			name: "IsoCode3",
			column: "COUNTRY_ISOCODE3",
			type: "VARCHAR",
		},
 {
			name: "PostcodeRequired",
			column: "COUNTRY_POSTCODEREQUIRED",
			type: "BOOLEAN",
		}
]
});

exports.list = function(settings) {
	return dao.list(settings).map(function(e) {
		EntityUtils.setBoolean(e, "PostcodeRequired");
		return e;
	});
};

exports.get = function(id) {
	let entity = dao.find(id);
	EntityUtils.setBoolean(entity, "PostcodeRequired");
	return entity;
};

exports.create = function(entity) {
	EntityUtils.setBoolean(entity, "PostcodeRequired");
	let id = dao.insert(entity);
	triggerEvent({
		operation: "create",
		table: "CODBEX_COUNTRY",
		entity: entity,
		key: {
			name: "Id",
			column: "COUNTRY_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	EntityUtils.setBoolean(entity, "PostcodeRequired");
	dao.update(entity);
	triggerEvent({
		operation: "update",
		table: "CODBEX_COUNTRY",
		entity: entity,
		key: {
			name: "Id",
			column: "COUNTRY_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_COUNTRY",
		entity: entity,
		key: {
			name: "Id",
			column: "COUNTRY_ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_COUNTRY"');
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
	let triggerExtensions = extensions.getExtensions("codbex-electra/Settings/Country");
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
	producer.queue("codbex-electra/Settings/Country").send(JSON.stringify(data));
}