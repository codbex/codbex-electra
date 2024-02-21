import { HttpUtils } from "../../codbex-electra/gen/api/utils/HttpUtils";
import { SalesOrderRepository as SalesOrderDAO } from "../../codbex-electra/gen/dao/SalesOrders/SalesOrderRepository";
import { StoreRepository as StoreDAO } from "../../codbex-electra/gen/dao/Stores/StoreRepository";
import { StoreTypeRepository as StoreTypeDAO } from "../../codbex-electra/gen/dao/Stores/StoreTypeRepository";
import { StoreConfigDAO } from "../../codbex-electra-opencart/dao/StoreConfigDAO";
import { EntityReferenceDAO } from "../../codbex-electra/dao/EntityReferenceDAO";

import { Controller, Get, Put } from "sdk/http"
import { configurations } from "sdk/core";

const ECONT_DELIVERY_URL_CFG_NAME = "ELECTRA_ECONT_DELIVERY_URL";
const ECONT_DELIVERY_DEFAULT_URL = "https://delivery.econt.com";
const ECONT_TRACKING_URL = "https://econt.com/services/track-shipment/";

@Controller
class SalesOrderService {

	private readonly salesOrderDAO;
	private readonly storeDAO;
	private readonly storeTypeDAO;
	private readonly storeConfigDAO;
	private readonly entityReferenceDAO;

	constructor() {
		this.salesOrderDAO = new SalesOrderDAO();
		this.storeDAO = new StoreDAO();
		this.storeTypeDAO = new StoreTypeDAO();
		this.storeConfigDAO = new StoreConfigDAO();
		this.entityReferenceDAO = new EntityReferenceDAO();
	}

	@Put("/:salesOrderId/updateTrackingNumber")
	public updateOpenCartOrder(body: any, ctx: any) {
		try {
			const salesOrderId = ctx.pathParameters.salesOrderId;

			const salesOrder = this.salesOrderDAO.findById(salesOrderId);
			if (!salesOrder) {
				HttpUtils.sendResponseNotFound(`SalesOrder with id [${salesOrderId}] was not found`);
				return;
			}
			const trackingURL = ECONT_TRACKING_URL + body.trackingNumber;
			salesOrder.Tracking = trackingURL;

			this.salesOrderDAO.update(salesOrder);
		} catch (error: any) {
			this.handleError(error);
		}
	}

	@Get("/:salesOrderId/shippingLabelURL")
	public getShippingLabelURL(_: any, ctx: any) {
		try {
			const salesOrderId = ctx.pathParameters.salesOrderId;

			const salesOrder = this.salesOrderDAO.findById(salesOrderId);
			if (!salesOrder) {
				HttpUtils.sendResponseNotFound(`SalesOrder with id [${salesOrderId}] was not found`);
				return;
			}
			const store = this.storeDAO.findById(salesOrder.Store)!;
			const storeType = this.storeTypeDAO.findById(store.Type)!;
			if (storeType.Name !== 'OpenCart') {
				HttpUtils.sendResponseBadRequest(`SalesOrder [${salesOrderId}] is from store which is not of type OpenCart. Store type is ${storeType.Name}`);
				return;
			}
			const secret = this.storeConfigDAO.getStoreEcontShopSecret(store.Id);
			const econtURL = configurations.get(ECONT_DELIVERY_URL_CFG_NAME, ECONT_DELIVERY_DEFAULT_URL);
			const ocOrderId = this.entityReferenceDAO.getRequiredSalesOrderReferenceReferenceByEntityId(store.Id, salesOrderId).ReferenceIntegerId!;

			const url = `${econtURL}/create_label.php?order_number=${ocOrderId}&token=${secret}`;

			return { url: url };
		} catch (error: any) {
			this.handleError(error);
		}
	}

	private handleError(error: any) {
		if (error.name === "ForbiddenError") {
			HttpUtils.sendForbiddenRequest(error.message);
		} else if (error.name === "ValidationError") {
			HttpUtils.sendResponseBadRequest(error.message);
		} else {
			HttpUtils.sendInternalServerError(error.message);
		}
	}
}
