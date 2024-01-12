import { database } from "@dirigible/db";
import { getLogger } from "/codbex-electra/util/logger-util.mjs";
import { closeResources } from "/codbex-electra/util/db-util.mjs";

const logger = getLogger(import.meta.url);

const deleteStatement = `
	DELETE from oc_order_product
	WHERE order_product_id = ?
`;

export function onMessage(messageString) {
	logger.info("Processing sales order item message [{}]...", messageString);

	const message = JSON.parse(messageString);
	const operation = message.operation;

	const salesOrderItem = message.entity;
	switch (operation) {
		case 'delete':
			handleDelete(salesOrderItem);
			break;
		default:
			logger.debug("Message [{}] will not be handled.", messageString);
	}
};

function handleDelete(salesOrderItem) {
	const orderItemId = parseInt(salesOrderItem.Id);
	logger.info("Deleting order item with id [{}] from OpenCart DB...", orderItemId);

	const connection = database.getConnection("OpenCartDB");
	let statement;
	let resultSet;
	try {
		statement = connection.prepareStatement(deleteStatement);
		statement.setInt(1, orderItemId);

		const deletedRows = statement.executeUpdate();
		logger.info("[{}] order items deleted from OpenCart DB.", deletedRows);
	} catch (err) {
		logger.error('Failed to delete order item with id [{}] from OpenCart DB. \nError: [{}]', orderItemId, err.message);
		throw err;
	} finally {
		closeResources(resultSet, statement, connection);
	}

}

export function onError(err) {
	logger.error('Failed to handle sales-order-item message. \nError: [{}]', err.message);
};
