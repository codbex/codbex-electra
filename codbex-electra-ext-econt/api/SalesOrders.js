const rs = require("http/rs");
const http = require("codbex-electra/gen/api/utils/http");
const configurations = require("core/configurations");

const SHOP_SECRET_CFG_NAME = "ELECTRA_ECONT_SHOP_SECRET_CFG_NAME";
const ECONT_DELIVERY_URL_CFG_NAME = "ELECTRA_ECONT_DELIVERY_URL";

function getMandatoryCfg(configName) {
	const configValue = configurations.get(configName);
	if (configValue) {
		return configValue;
	}
	const errorMessage = `Missing mandatory configuration with name [${configName}] `;
	console.error(errorMessage);
	throw new Error(errorMessage);
}
rs.service()
	.resource("{salesOrderId}/shippingLabelURL")
	.get(function (ctx) {
		const salesOrderId = ctx.pathParameters.salesOrderId;

		const econtURL = configurations.get(ECONT_DELIVERY_URL_CFG_NAME, 'https://delivery.econt.com');
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
