import { query } from "@dirigible/db";
import { producer } from "@dirigible/messaging";
import { extensions } from "@dirigible/extensions";
import { dao as daoApi } from "@dirigible/db";

let dao = daoApi.create({
	table: "CODBEX_ATTRIBUTEGROUPTRANSLATION",
	properties: [
		{
			name: "Id",
			column: "ATTRIBUTEGROUPTRANSLATION_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
			required: true
		},
 		{
			name: "AttributeGroup",
			column: "ATTRIBUTEGROUPTRANSLATION_ATTRIBUTEGROUP",
			type: "INTEGER",
			required: true
		},
 		{
			name: "Language",
			column: "ATTRIBUTEGROUPTRANSLATION_LANGUAGE",
			type: "INTEGER",
			required: true
		},
 		{
			name: "Text",
			column: "ATTRIBUTEGROUPTRANSLATION_TEXT",
			type: "VARCHAR",
			required: true
		}
]});

export const list = (settings) => {
	return dao.list(settings);
}

export const get = (id) => {
	return dao.find(id);
}

export const create = (entity) => {
	let id = dao.insert(entity);
	triggerEvent({
		operation: "create",
		table: "CODBEX_ATTRIBUTEGROUPTRANSLATION",
		entity: entity,
		key: {
			name: "Id",
			column: "ATTRIBUTEGROUPTRANSLATION_ID",
			value: id
		}
	});
	return id;
}

export const update = (entity) => {
	dao.update(entity);
	triggerEvent({
		operation: "update",
		table: "CODBEX_ATTRIBUTEGROUPTRANSLATION",
		entity: entity,
		key: {
			name: "Id",
			column: "ATTRIBUTEGROUPTRANSLATION_ID",
			value: entity.Id
		}
	});
}

export const remove = (id) => {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_ATTRIBUTEGROUPTRANSLATION",
		entity: entity,
		key: {
			name: "Id",
			column: "ATTRIBUTEGROUPTRANSLATION_ID",
			value: id
		}
	});
}

export const count = (AttributeGroup) => {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_ATTRIBUTEGROUPTRANSLATION" WHERE "ATTRIBUTEGROUPTRANSLATION_ATTRIBUTEGROUP" = ?', [AttributeGroup]);
	if (resultSet !== null && resultSet[0] !== null) {
		if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
			return resultSet[0].COUNT;
		} else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
			return resultSet[0].count;
		}
	}
	return 0;
}

export const customDataCount = () => {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX__ATTRIBUTEGROUPTRANSLATION"');
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
	const triggerExtensions = await extensions.loadExtensionModules("codbex-electra/Products/AttributeGroupTranslation", ["trigger"]);
	triggerExtensions.forEach(triggerExtension => {
		try {
			triggerExtension.trigger(data);
		} catch (error) {
			console.error(error);
		}			
	});
	producer.queue("codbex-electra/Products/AttributeGroupTranslation").send(JSON.stringify(data));
}
