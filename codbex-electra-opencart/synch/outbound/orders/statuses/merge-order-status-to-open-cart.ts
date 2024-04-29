import { oc_order_statusRepository as OpenCartOrderStatusDAO, oc_order_statusCreateEntity as OpenCartProductAttributeCreateEntity, oc_order_statusUpdateEntity as OpenCartProductAttributeUpdateEntity } from "codbex-electra-opencart/dao/oc_order_statusRepository";
import { OrderStatusRepository as OrderStatusDAO, OrderStatusEntity } from "codbex-electra/gen/dao/order-statuses/OrderStatusRepository";
import { EntityReferenceDAO } from "codbex-electra/dao/EntityReferenceDAO";
import { EntityReferenceEntity } from "codbex-electra/gen/dao/entity-references/EntityReferenceRepository";
import { BaseHandler } from "codbex-electra-opencart/synch/base-handler";
import { OrderStatusEntry } from "./get-all-order-statuses";
import { oc_settingRepository as OpenCartSettingDAO } from "codbex-electra-opencart/dao/oc_settingRepository";

export function onMessage(message: any) {
    const orderStatusEntry: OrderStatusEntry = message.getBody();

    const handler = new MergeOrderStatusToOpenCartHandler(orderStatusEntry);
    handler.handle();

    return message;
}
class MergeOrderStatusToOpenCartHandler extends BaseHandler {
    private readonly orderStatusEntry;
    private readonly entityReferenceDAO;
    private readonly orderStatusDAO;
    private readonly ocOrderStatusDAO;
    private readonly ocSettingDAO;

    constructor(orderStatusEntry: OrderStatusEntry) {
        super(import.meta.url);
        this.orderStatusEntry = orderStatusEntry;

        this.entityReferenceDAO = new EntityReferenceDAO();
        this.orderStatusDAO = new OrderStatusDAO();
        const dataSourceName = orderStatusEntry.store.dataSourceName;
        this.ocOrderStatusDAO = new OpenCartOrderStatusDAO(dataSourceName);
        this.ocSettingDAO = new OpenCartSettingDAO(dataSourceName);
    }

    handle() {
        const storeId = this.orderStatusEntry.store.id;
        const orderStatusId = this.orderStatusEntry.orderStatusId;
        const orderStatusReference = this.entityReferenceDAO.getOrderStatusReferenceByEntityId(storeId, orderStatusId);

        const orderStatus = this.orderStatusDAO.findById(this.orderStatusEntry.orderStatusId)!;
        const ocOrderStatus = this.createOpenCartOrderStatus(orderStatus, orderStatusReference);
        const ocOrderStatusId = this.ocOrderStatusDAO.upsert(ocOrderStatus);

        if (orderStatus.Default) {
            this.ocSettingDAO.updateDefaultOrderStatus(ocOrderStatusId);
        }

        if (!orderStatusReference) {
            this.entityReferenceDAO.createOrderStatusReference(storeId, orderStatusId, ocOrderStatusId);
        }
    }

    private createOpenCartOrderStatus(orderStatus: OrderStatusEntity, orderStatusReference: EntityReferenceEntity | null): OpenCartProductAttributeCreateEntity | OpenCartProductAttributeUpdateEntity {
        const languageId = this.getOpenCartLanguageId(orderStatus.Language);

        if (orderStatusReference) {
            return {
                order_status_id: orderStatusReference.ReferenceIntegerId!,
                language_id: languageId,
                name: orderStatus.Name,
            };
        } else {
            return {
                order_status_id: 0,
                language_id: languageId,
                name: orderStatus.Name,
            };
        }
    }

    private getOpenCartLanguageId(languageId: number): number {
        const languageReference = this.entityReferenceDAO.getRequiredLanguageReferenceByEntityId(this.orderStatusEntry.store.id, languageId);
        return languageReference.ReferenceIntegerId!;
    }

}
