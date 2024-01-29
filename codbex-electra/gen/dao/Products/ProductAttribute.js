import { query } from "@dirigible/db";
import { producer } from "@dirigible/messaging";
import { extensions } from "@dirigible/extensions";
import { dao as daoApi } from "@dirigible/db";

let dao = daoApi.create({
	table: "CODBEX_PRODUCTATTRIBUTE",
	properties: [
		{
			name: "Id",
			column: "PRODUCTATTRIBUTE_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Name",
			column: "PRODUCTATTRIBUTE_NAME",
			type: "INTEGER",
		},
 {
			name: "Text",
			column: "PRODUCTATTRIBUTE_TEXT",
			type: "VARCHAR",
		},
 {
			name: "Product",
			column: "PRODUCTATTRIBUTE_PRODUCT",
			type: "INTEGER",
		},
 {
			name: "Language",
			column: "PRODUCTATTRIBUTE_LANGUAGE",
			type: "INTEGER",
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
	let id = dao.insert(entity);
	triggerEvent({
		operation: "create",
		table: "CODBEX_PRODUCTATTRIBUTE",
		entity: entity,
		key: {
			name: "Id",
			column: "PRODUCTATTRIBUTE_ID",
			value: id
		}
	});
	return id;
}

export const update = (entity) => {
	dao.update(entity);
	triggerEvent({
		operation: "update",
		table: "CODBEX_PRODUCTATTRIBUTE",
		entity: entity,
		key: {
			name: "Id",
			column: "PRODUCTATTRIBUTE_ID",
			value: entity.Id
		}
	});
}

export const remove = (id) => {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_PRODUCTATTRIBUTE",
		entity: entity,
		key: {
			name: "Id",
			column: "PRODUCTATTRIBUTE_ID",
			value: id
		}
	});
}

export const count = (Product) => {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PRODUCTATTRIBUTE" WHERE "PRODUCTATTRIBUTE_PRODUCT" = ?', [Product]);
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
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PRODUCTATTRIBUTE"');
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
	const triggerExtensions = await extensions.loadExtensionModules("codbex-electra/Products/ProductAttribute", ["trigger"]);
	triggerExtensions.forEach(triggerExtension => {
		try {
			triggerExtension.trigger(data);
		} catch (error) {
			console.error(error);
		}			
	});
	producer.queue("codbex-electra/Products/ProductAttribute").send(JSON.stringify(data));
}
