import { query } from "@dirigible/db";
import { producer } from "@dirigible/messaging";
import { extensions } from "@dirigible/extensions";
import { dao as daoApi } from "@dirigible/db";

let dao = daoApi.create({
	table: "CODBEX_PRODUCTDESCRIPTION",
	properties: [
		{
			name: "Id",
			column: "PRODUCTDESCRIPTION_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 		{
			name: "Product",
			column: "PRODUCTDESCRIPTION_PRODUCT",
			type: "INTEGER",
		},
 		{
			name: "Name",
			column: "PRODUCTDESCRIPTION_NAME",
			type: "VARCHAR",
		},
 		{
			name: "Description",
			column: "PRODUCTDESCRIPTION_DESCRIPTION",
			type: "VARCHAR",
		},
 		{
			name: "Tag",
			column: "PRODUCTDESCRIPTION_TAG",
			type: "VARCHAR",
		},
 		{
			name: "MetaTitle",
			column: "PRODUCTDESCRIPTION_METATITLE",
			type: "VARCHAR",
		},
 		{
			name: "MetaDescription",
			column: "PRODUCTDESCRIPTION_METADESCRIPTION",
			type: "VARCHAR",
		},
 		{
			name: "MetaKeyword",
			column: "PRODUCTDESCRIPTION_METAKEYWORD",
			type: "VARCHAR",
		},
 		{
			name: "Language",
			column: "PRODUCTDESCRIPTION_LANGUAGE",
			type: "INTEGER",
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
		table: "CODBEX_PRODUCTDESCRIPTION",
		entity: entity,
		key: {
			name: "Id",
			column: "PRODUCTDESCRIPTION_ID",
			value: id
		}
	});
	return id;
}

export const update = (entity) => {
	dao.update(entity);
	triggerEvent({
		operation: "update",
		table: "CODBEX_PRODUCTDESCRIPTION",
		entity: entity,
		key: {
			name: "Id",
			column: "PRODUCTDESCRIPTION_ID",
			value: entity.Id
		}
	});
}

export const remove = (id) => {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_PRODUCTDESCRIPTION",
		entity: entity,
		key: {
			name: "Id",
			column: "PRODUCTDESCRIPTION_ID",
			value: id
		}
	});
}

export const count = (Product) => {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PRODUCTDESCRIPTION" WHERE "PRODUCTDESCRIPTION_PRODUCT" = ?', [Product]);
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
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PRODUCTDESCRIPTION"');
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
	const triggerExtensions = await extensions.loadExtensionModules("codbex-electra/Products/ProductDescription", ["trigger"]);
	triggerExtensions.forEach(triggerExtension => {
		try {
			triggerExtension.trigger(data);
		} catch (error) {
			console.error(error);
		}			
	});
	producer.queue("codbex-electra/Products/ProductDescription").send(JSON.stringify(data));
}
