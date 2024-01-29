import { query } from "@dirigible/db";
import { producer } from "@dirigible/messaging";
import { extensions } from "@dirigible/extensions";
import { dao as daoApi } from "@dirigible/db";

let dao = daoApi.create({
	table: "CODBEX_SALESORDERSHIPPING",
	properties: [
		{
			name: "Id",
			column: "SALESORDERSHIPPING_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Zone",
			column: "SALESORDERSHIPPING_ZONE",
			type: "INTEGER",
		},
 {
			name: "FirstName",
			column: "SALESORDERSHIPPING_FIRSTNAME",
			type: "VARCHAR",
		},
 {
			name: "LastName",
			column: "SALESORDERSHIPPING_LASTNAME",
			type: "VARCHAR",
		},
 {
			name: "Company",
			column: "SALESORDERSHIPPING_COMPANY",
			type: "VARCHAR",
		},
 {
			name: "Address1",
			column: "SALESORDERSHIPPING_ADDRESS1",
			type: "VARCHAR",
		},
 {
			name: "Address2",
			column: "SALESORDERSHIPPING_ADDRESS2",
			type: "VARCHAR",
		},
 {
			name: "Country",
			column: "SALESORDERSHIPPING_COUNTRY",
			type: "INTEGER",
		},
 {
			name: "City",
			column: "SALESORDERSHIPPING_CITY",
			type: "VARCHAR",
		},
 {
			name: "Postcode",
			column: "SALESORDERSHIPPING_POSTCODE",
			type: "VARCHAR",
		},
 {
			name: "Method",
			column: "SALESORDERSHIPPING_METHOD",
			type: "VARCHAR",
		},
 {
			name: "Code",
			column: "SALESORDERSHIPPING_CODE",
			type: "VARCHAR",
		},
 {
			name: "UpdatedBy",
			column: "SALESORDERSHIPPING_UPDATEDBY",
			type: "VARCHAR",
		},
 {
			name: "AddressFormat",
			column: "SALESORDERSHIPPING_ADDRESSFORMAT",
			type: "VARCHAR",
		},
 {
			name: "CustomField",
			column: "SALESORDERSHIPPING_CUSTOMFIELD",
			type: "VARCHAR",
		},
 {
			name: "SalesOrder",
			column: "SALESORDERSHIPPING_SALESORDER",
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
	entity["UpdatedBy"] = require("security/user").getName();
	let id = dao.insert(entity);
	triggerEvent({
		operation: "create",
		table: "CODBEX_SALESORDERSHIPPING",
		entity: entity,
		key: {
			name: "Id",
			column: "SALESORDERSHIPPING_ID",
			value: id
		}
	});
	return id;
}

export const update = (entity) => {
	entity["UpdatedBy"] = require("security/user").getName();
	dao.update(entity);
	triggerEvent({
		operation: "update",
		table: "CODBEX_SALESORDERSHIPPING",
		entity: entity,
		key: {
			name: "Id",
			column: "SALESORDERSHIPPING_ID",
			value: entity.Id
		}
	});
}

export const remove = (id) => {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_SALESORDERSHIPPING",
		entity: entity,
		key: {
			name: "Id",
			column: "SALESORDERSHIPPING_ID",
			value: id
		}
	});
}

export const count = (SalesOrder) => {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALESORDERSHIPPING" WHERE "SALESORDERSHIPPING_SALESORDER" = ?', [SalesOrder]);
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
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALESORDERSHIPPING"');
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
	const triggerExtensions = await extensions.loadExtensionModules("codbex-electra/SalesOrders/SalesOrderShipping", ["trigger"]);
	triggerExtensions.forEach(triggerExtension => {
		try {
			triggerExtension.trigger(data);
		} catch (error) {
			console.error(error);
		}			
	});
	producer.queue("codbex-electra/SalesOrders/SalesOrderShipping").send(JSON.stringify(data));
}
