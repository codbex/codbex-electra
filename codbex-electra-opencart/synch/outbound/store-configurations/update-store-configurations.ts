import { OpenCartStoreConfig } from "codbex-electra-opencart/dao/StoreConfigDAO";
import { BaseHandler } from "codbex-electra-opencart/synch/base-handler";
import { oc_settingRepository as OpenCartSettingDAO } from "codbex-electra-opencart/dao/oc_settingRepository";
import { EntityReferenceDAO } from "codbex-electra/dao/EntityReferenceDAO";
import { StoreConfigDAO } from "codbex-electra-opencart/dao/StoreConfigDAO";

export function onMessage(message: any) {
    const store: OpenCartStoreConfig = message.getBody();

    const handler = new UpdateStoreConfigurationsHandler(store);
    handler.handle();

    return message;
}

class UpdateStoreConfigurationsHandler extends BaseHandler {
    private readonly store;

    private readonly ocSettingDAO;
    private readonly entityReferenceDAO;
    private readonly storeConfigDAO;

    constructor(store: OpenCartStoreConfig) {
        super(import.meta.url);
        this.store = store;

        const dataSourceName = store.dataSourceName;
        this.ocSettingDAO = new OpenCartSettingDAO(dataSourceName);

        this.entityReferenceDAO = new EntityReferenceDAO();
        this.storeConfigDAO = new StoreConfigDAO();
    }

    handle() {
        const storeId = this.store.id;

        const completeOrderStatusId = this.storeConfigDAO.getStoreCompleteOrderStatusId(this.store.id);
        const ocCompleteStatusId = this.entityReferenceDAO.getRequiredOrderStatusReferenceByEntityId(storeId, completeOrderStatusId).ReferenceIntegerId!;
        this.ocSettingDAO.updateCompleteOrderStatusId(ocCompleteStatusId);

        const fraudOrderStatusId = this.storeConfigDAO.getStoreFraudOrderStatusId(this.store.id);
        const ocFraudStatusId = this.entityReferenceDAO.getRequiredOrderStatusReferenceByEntityId(storeId, fraudOrderStatusId).ReferenceIntegerId!;
        this.ocSettingDAO.updateFraudOrderStatusId(ocFraudStatusId);


        const processingOrderStatusId = this.storeConfigDAO.getStoreProcessingOrderStatusId(this.store.id);
        const ocProcessingStatusId = this.entityReferenceDAO.getRequiredOrderStatusReferenceByEntityId(storeId, processingOrderStatusId).ReferenceIntegerId!;
        this.ocSettingDAO.updateProcessingOrderStatusId(ocProcessingStatusId);

        const paymentCodeOrderStatus = this.storeConfigDAO.getStorePendingOrderStatusId(this.store.id);
        this.ocSettingDAO.updatePaymentCodeOrderStatus(paymentCodeOrderStatus);
    }
}