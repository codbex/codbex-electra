import { database } from "@dirigible/db";
import { getLogger } from "/codbex-electra/util/logger-util.mjs";
import { closeResources } from "/codbex-electra/util/db-util.mjs";

const Timestamp = Java.type('java.sql.Timestamp');
const logger = getLogger(import.meta.url);
const updateStatement = `
	UPDATE oc_product
	SET
		quantity = ?,
		stock_status_id = ?,
		status = ?,
		date_modified = ?
	WHERE product_id = ?
`;

export function onMessage(messageString) {
	logger.info("Processing product message [{}]...", messageString);

	const message = JSON.parse(messageString);
	const operation = message.operation;

	const product = message.entity;
	switch (operation) {
		case 'update':
			handleUpdate(product);
			break;
		default:
			logger.debug("Message [{}] will not be handled.", messageString);
	}
};

function handleUpdate(product) {
	logger.info("Updating order [{}] in OpenCart DB...", product);

	const connection = database.getConnection("OpenCartDB");
	let statement;
	let resultSet;
	try {
		statement = connection.prepareStatement(updateStatement);

		const quantity = parseInt(product.Quantity);
		statement.setInt(1, quantity);
		statement.setInt(2, product.StockStatus);
		statement.setInt(3, product.Status ? 1 : 0);


		const dateModified = new Timestamp(Date.now());
		statement.setTimestamp(4, dateModified);

		const productId = parseInt(product.Id);
		statement.setInt(5, productId);

		const updatedRows = statement.executeUpdate();
		logger.info("[{}] product(s) updated in OpenCart DB.", updatedRows);
	} catch (err) {
		logger.error('Failed to update product [{}] in OpenCart DB. \nError: [{}]', product, err.message);
		throw err;
	} finally {
		closeResources(resultSet, statement, connection);
	}
}

export function onError(err) {
	logger.error('Failed to handle product message. \nError: [{}]', err.message);
};
