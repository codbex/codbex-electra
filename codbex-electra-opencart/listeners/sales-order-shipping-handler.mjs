import { database } from "@dirigible/db";
import { getLogger } from "/codbex-electra/util/logger-util.mjs";
import { closeResources } from "/codbex-electra/util/db-util.mjs";

const salesOrderItemDAO = require("codbex-electra/gen/dao/SalesOrders/SalesOrderItem");

const Timestamp = Java.type('java.sql.Timestamp');

const logger = getLogger(import.meta.url);

export function onMessage(messageString) {
	logger.info("Processing sales order shipping message [{}]...", messageString);

	const message = JSON.parse(messageString);
	const operation = message.operation;

	const salesOrderShipping = message.entity;
	switch (operation) {
		case 'update':
			handleUpdate(salesOrderShipping);
			break;
		default:
			logger.debug("Message [{}] will not be handled.", messageString);
	}
};

const updateStatement = `
	UPDATE oc_order
	SET
		shipping_firstname = ?,
		shipping_lastname = ?,
		shipping_company = ?,
		shipping_address_1 = ?,
		shipping_address_2 = ?,
		shipping_city = ?,
		shipping_postcode = ?,
		shipping_country_id = ?,
		shipping_zone_id = ?,
		shipping_address_format = ?,
		shipping_custom_field = ?,
		shipping_method = ?,
		shipping_code = ?,
		date_modified = ?
	WHERE order_id = ?
`;

function handleUpdate(salesOrderShipping) {
	logger.info("Updating order [{}] in OpenCart DB...", salesOrderShipping);

	const connection = database.getConnection("OpenCartDB");
	let statement;
	let resultSet;
	try {
		statement = connection.prepareStatement(updateStatement);

		statement.setString(1, salesOrderShipping.FirstName);
		statement.setString(2, salesOrderShipping.LastName);
		statement.setString(3, salesOrderShipping.Company);
		statement.setString(4, salesOrderShipping.Address1);
		statement.setString(5, salesOrderShipping.Address2);
		statement.setString(6, salesOrderShipping.City);
		statement.setString(7, salesOrderShipping.Postcode);
		statement.setInt(8, salesOrderShipping.Country);
		statement.setInt(9, salesOrderShipping.Zone);
		statement.setString(10, salesOrderShipping.AddressFormat);
		statement.setString(11, salesOrderShipping.CustomField);
		statement.setString(12, salesOrderShipping.Method);
		statement.setString(13, salesOrderShipping.Code);

		const dateModified = new Timestamp(Date.now());
		statement.setTimestamp(14, dateModified);

		const salesOrderId = parseInt(salesOrderShipping.SalesOrder);
		statement.setInt(15, salesOrderId);

		const updatedRows = statement.executeUpdate();
		logger.info("[{}] order(s) updated in OpenCart DB.", updatedRows);
	} catch (err) {
		logger.error('Failed to update SalesOrderShipping [{}] in OpenCart DB. \nError: [{}]', salesOrderShipping, err.message);
		throw err;
	} finally {
		closeResources(resultSet, statement, connection);
	}
}

export function onError(err) {
	logger.error('Failed to handle sales-order-shipping message. \nError: [{}]', err.message);
};
