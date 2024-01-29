import * as http from "/codbex-electra/gen/api/utils/http";
import { rs } from '@dirigible/http'
import { configurations } from '@dirigible/core'
import { logging } from '@dirigible/log'

const logger = logging.getLogger("api.SalesOrders.js");

const SHOP_SECRET_CFG_NAME = "ELECTRA_ECONT_SHOP_SECRET";
const ECONT_DELIVERY_URL_CFG_NAME = "ELECTRA_ECONT_DELIVERY_URL";

const ECONT_DELIVERY_DEFAULT_URL = "https://delivery.econt.com";

function getMandatoryCfg(configName) {
	const configValue = configurations.get(configName);
	if (configValue) {
		return configValue;
	}
	const errorMessage = `Missing mandatory configuration with name [${configName}] `;
	logger.error(errorMessage);
	throw new Error(errorMessage);
}

rs.service()
	.resource("{salesOrderId}/shippingLabelURL")
	.get(function (ctx) {
		const salesOrderId = ctx.pathParameters.salesOrderId;

		const econtURL = configurations.get(ECONT_DELIVERY_URL_CFG_NAME, ECONT_DELIVERY_DEFAULT_URL);
		const secret = getMandatoryCfg(SHOP_SECRET_CFG_NAME);
		const url = `${econtURL}/create_label.php?order_number=${salesOrderId}&token=${secret}`;

		const responseBody = { url: url };
		http.sendResponseOk(responseBody);
	})
	.produces(["application/json"])
	.catch(function (ctx, error) {
		if (error.name === "ForbiddenError") {
			http.sendForbiddenRequest(error.message);
		} else if (error.name === "ValidationError") {
			http.sendResponseBadRequest(error.message);
		} else {
			http.sendInternalServerError(error.message);
		}
	})
	.execute();
