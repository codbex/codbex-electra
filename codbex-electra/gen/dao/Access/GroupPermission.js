import { query } from "@dirigible/db";
import { producer } from "@dirigible/messaging";
import { extensions } from "@dirigible/extensions";
import { dao as daoApi } from "@dirigible/db";

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

export const list = (settings) => {
	return dao.list(settings);
}

export const get = (id) => {
	return dao.find(id);
}

export const create = (entity) => {
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
}

export const update = (entity) => {
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
}

export const remove = (id) => {
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
}

export const count = () => {
	return dao.count();
}

export const customDataCount = () => {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_GROUPPERMISSION"');
	if (resultSet !== null && resultSet[0] !== null) {
		if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
			return resultSet[0].COUNT;
		} else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
			return resultSet[0].count;
		}
	}
	return 0;
}


const triggerEvent = async(data) => {
	const triggerExtensions = await extensions.loadExtensionModules("codbex-electra/Access/GroupPermission", ["trigger"]);
	triggerExtensions.forEach(triggerExtension => {
		try {
			triggerExtension.trigger(data);
		} catch (error) {
			console.error(error);
		}			
	});
	producer.queue("codbex-electra/Access/GroupPermission").send(JSON.stringify(data));
}
