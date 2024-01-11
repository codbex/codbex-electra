import { database } from "@dirigible/db";
import { getLogger } from "/codbex-electra/util/loggerUtil.mjs"

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


export function onMessage(messageString) {
	logger.info("Processing sales order message [{}]", messageString);

	const message = JSON.parse(messageString);
	const operation = message.operation;

	switch (operation) {
		case 'update':
			handleUpdate(message.entity);
			break;
		case 'delete':
			handleDelete(message.entity);
			break;
		default:
			logger.debug("Message [{}] will not be handled.", messageString);
	}
};

function handleUpdate(salesOrder) {
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

		const id = parseInt(salesOrder.Id);
		statement.setInt(13, id);

		const updatedRows = statement.executeUpdate();
		logger.info("[{}] rows updated", updatedRows);
	} catch (err) {
		logger.error('Failed to update SalesOrder in OpenCart DB. \nError: [{}]', err.message);
		throw err;
	} finally {
		closeResources(resultSet, statement, connection);
	}
}


function handleDelete(salesOrder) {
	logger.info("Deleting [{}]", salesOrder);
	// TODO
}

function closeResources(...resources) {
	resources.forEach(r => {
		if (r) {
			r.close();
		}
	});
}

export function onError(err) {
	logger.error('Failed to handle sales-order message. \nError: [{}]', err.message);
};
