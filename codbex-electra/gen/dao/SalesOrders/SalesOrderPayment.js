import { query } from "@dirigible/db";
import { producer } from "@dirigible/messaging";
import { extensions } from "@dirigible/extensions";
import { dao as daoApi } from "@dirigible/db";

let dao = daoApi.create({
	table: "CODBEX_SALESORDERPAYMENT",
	properties: [
		{
			name: "Id",
			column: "SALESORDERPAYMENT_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Zone",
			column: "SALESORDERPAYMENT_ZONE",
			type: "INTEGER",
		},
 {
			name: "FirstName",
			column: "SALESORDERPAYMENT_FIRSTNAME",
			type: "VARCHAR",
		},
 {
			name: "LastName",
			column: "SALESORDERPAYMENT_LASTNAME",
			type: "VARCHAR",
		},
 {
			name: "Company",
			column: "SALESORDERPAYMENT_COMPANY",
			type: "VARCHAR",
		},
 {
			name: "Address1",
			column: "SALESORDERPAYMENT_ADDRESS1",
			type: "VARCHAR",
		},
 {
			name: "Address2",
			column: "SALESORDERPAYMENT_ADDRESS2",
			type: "VARCHAR",
		},
 {
			name: "Country",
			column: "SALESORDERPAYMENT_COUNTRY",
			type: "INTEGER",
		},
 {
			name: "City",
			column: "SALESORDERPAYMENT_CITY",
			type: "VARCHAR",
		},
 {
			name: "Postcode",
			column: "SALESORDERPAYMENT_POSTCODE",
			type: "VARCHAR",
		},
 {
			name: "Method",
			column: "SALESORDERPAYMENT_METHOD",
			type: "VARCHAR",
		},
 {
			name: "Code",
			column: "SALESORDERPAYMENT_CODE",
			type: "VARCHAR",
		},
 {
			name: "AddressFormat",
			column: "SALESORDERPAYMENT_ADDRESSFORMAT",
			type: "VARCHAR",
		},
 {
			name: "CustomField",
			column: "SALESORDERPAYMENT_CUSTOMFIELD",
			type: "VARCHAR",
		},
 {
			name: "SalesOrder",
			column: "SALESORDERPAYMENT_SALESORDER",
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
		table: "CODBEX_SALESORDERPAYMENT",
		entity: entity,
		key: {
			name: "Id",
			column: "SALESORDERPAYMENT_ID",
			value: id
		}
	});
	return id;
}

export const update = (entity) => {
	dao.update(entity);
	triggerEvent({
		operation: "update",
		table: "CODBEX_SALESORDERPAYMENT",
		entity: entity,
		key: {
			name: "Id",
			column: "SALESORDERPAYMENT_ID",
			value: entity.Id
		}
	});
}

export const remove = (id) => {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_SALESORDERPAYMENT",
		entity: entity,
		key: {
			name: "Id",
			column: "SALESORDERPAYMENT_ID",
			value: id
		}
	});
}

export const count = (SalesOrder) => {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALESORDERPAYMENT" WHERE "SALESORDERPAYMENT_SALESORDER" = ?', [SalesOrder]);
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
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALESORDERPAYMENT"');
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
	const triggerExtensions = await extensions.loadExtensionModules("codbex-electra/SalesOrders/SalesOrderPayment", ["trigger"]);
	triggerExtensions.forEach(triggerExtension => {
		try {
			triggerExtension.trigger(data);
		} catch (error) {
			console.error(error);
		}			
	});
	producer.queue("codbex-electra/SalesOrders/SalesOrderPayment").send(JSON.stringify(data));
}
