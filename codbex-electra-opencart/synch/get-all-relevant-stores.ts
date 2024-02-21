import { StoreConfigDAO } from "../dao/StoreConfigDAO";

export function onMessage(message: any) {
    const storeConfigDAO = new StoreConfigDAO();
    const configs = storeConfigDAO.getEnabledOpenCartStoresConfig();

    message.setBody(configs);
    return message;
}
