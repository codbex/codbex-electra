const query = require("db/query");
const producer = require("messaging/producer");
const extensions = require('extensions/extensions');
const daoApi = require("db/dao");

let dao = daoApi.create({
	table: "CODBEX_GROUPPERMISSION",
	properties: [
		{
			name: "Id",
			column: "GROUPPERMISSION_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Group",
			column: "GROUPPERMISSION_GROUP",
			type: "INTEGER",
		},
 {
			name: "Permission",
			column: "GROUPPERMISSION_PERMISSION",
			type: "INTEGER",
		},
 {
			name: "UpdatedBy",
			column: "GROUPPERMISSION_UPDATEDBY",
			type: "VARCHAR",
		},
 {
			name: "DateModified",
			column: "GROUPPERMISSION_DATEMODIFIED",
			type: "TIMESTAMP",
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
	entity["UpdatedBy"] = require("security/user").getName();
	entity["DateModified"] = Date.now();
	let id = dao.insert(entity);
	triggerEvent({
		operation: "create",
		table: "CODBEX_GROUPPERMISSION",
		entity: entity,
		key: {
			name: "Id",
			column: "GROUPPERMISSION_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	entity["UpdatedBy"] = require("security/user").getName();
	entity["DateModified"] = Date.now();
	dao.update(entity);
	triggerEvent({
		operation: "update",
		table: "CODBEX_GROUPPERMISSION",
		entity: entity,
		key: {
			name: "Id",
			column: "GROUPPERMISSION_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_GROUPPERMISSION",
		entity: entity,
		key: {
			name: "Id",
			column: "GROUPPERMISSION_ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_GROUPPERMISSION"');
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
	let triggerExtensions = extensions.getExtensions("codbex-electra/Access/GroupPermission");
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
	producer.queue("codbex-electra/Access/GroupPermission").send(JSON.stringify(data));
}