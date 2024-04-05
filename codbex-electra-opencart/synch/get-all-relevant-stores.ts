import { StoreConfigDAO } from "codbex-electra-opencart/dao/StoreConfigDAO";

export function onMessage(message: any) {
    const storeConfigDAO = new StoreConfigDAO();
    const configs = storeConfigDAO.getEnabledOpenCartStoresConfig();

    message.setBody(configs);
    return message;
}
