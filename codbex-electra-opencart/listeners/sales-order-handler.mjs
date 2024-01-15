import { database } from "@dirigible/db";
import { getLogger } from "/codbex-electra/util/logger-util.mjs";
import { closeResources } from "/codbex-electra/util/db-util.mjs";

const salesOrderItemDAO = require("codbex-electra/gen/dao/SalesOrders/SalesOrderItem");
const Timestamp = Java.type('java.sql.Timestamp');
const logger = getLogger(import.meta.url);
const updateStatement = `
	UPDATE oc_order
	SET
		invoice_no = ?,
		invoice_prefix = ?,
		store_id = ?,
		customer_id = ?,
		comment = ?,
		total = ?,
		order_status_id = ?,
		tracking = ?,
		language_id = ?,
		currency_id = ?,
		accept_language = ?,
		date_modified = ?
	WHERE order_id = ?
`;

const deleteStatement = `
	DELETE from oc_order
	WHERE order_id = ?
`;

export function onMessage(messageString) {
	logger.info("Processing sales order message [{}]...", messageString);

	const message = JSON.parse(messageString);
	const operation = message.operation;

	const salesOrder = message.entity;
	switch (operation) {
		case 'update':
			handleUpdate(salesOrder);
			break;
		case 'delete':
			handleDelete(salesOrder);
			break;
		default:
			logger.debug("Message [{}] will not be handled.", messageString);
	}
};

function handleUpdate(salesOrder) {
	logger.info("Updating order [{}] in OpenCart DB...", salesOrder);

	const connection = database.getConnection("OpenCartDB");
	let statement;
	let resultSet;
	try {
		statement = connection.prepareStatement(updateStatement);

		statement.setInt(1, salesOrder.InvoiceNumber);
		statement.setString(2, salesOrder.InvoicePrefix);
		statement.setInt(3, salesOrder.Store);
		statement.setInt(4, salesOrder.Customer);
		statement.setString(5, salesOrder.Comment);
		statement.setDouble(6, salesOrder.Total);
		statement.setInt(7, salesOrder.Status);
		statement.setString(8, salesOrder.Tracking);
		statement.setInt(9, salesOrder.Language);
		statement.setInt(10, salesOrder.Currency);
		statement.setString(11, salesOrder.AcceptLanguage);

		const dateModified = new Timestamp(Date.now());
		statement.setTimestamp(12, dateModified);

		const salesOrderId = parseInt(salesOrder.Id);
		statement.setInt(13, salesOrderId);

		const updatedRows = statement.executeUpdate();
		logger.info("[{}] order(s) updated in OpenCart DB.", updatedRows);
	} catch (err) {
		logger.error('Failed to update SalesOrder [{}] in OpenCart DB. \nError: [{}]', salesOrder, err.message);
		throw err;
	} finally {
		closeResources(resultSet, statement, connection);
	}
}

function handleDelete(salesOrder) {
	const salesOrderId = parseInt(salesOrder.Id);

	deleteSalesOrderItems(salesOrderId);
	deleteOpenCartSalesOrder(salesOrderId);

}

function deleteSalesOrderItems(salesOrderId) {
	const querySettings = {
		"Order": salesOrderId
	};
	const items = salesOrderItemDAO.list(querySettings)
	items.forEach(i => {
		salesOrderItemDAO.delete(i.Id);
	});
}

function deleteOpenCartSalesOrder(salesOrderId) {
	logger.info("Deleting order with id [{}] from OpenCart DB...", salesOrderId);

	const connection = database.getConnection("OpenCartDB");
	let statement;
	let resultSet;
	try {
		statement = connection.prepareStatement(deleteStatement);
		statement.setInt(1, salesOrderId);

		const deletedRows = statement.executeUpdate();
		logger.info("[{}] orders deleted from OpenCart DB", deletedRows);
	} catch (err) {
		logger.error('Failed to delete SalesOrder with id [{}] from OpenCart DB. \nError: [{}]', salesOrderId, err.message);
		throw err;
	} finally {
		closeResources(resultSet, statement, connection);
	}
}

export function onError(err) {
	logger.error('Failed to handle sales-order message. \nError: [{}]', err.message);
};
