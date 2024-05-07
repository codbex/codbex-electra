import { SalesOrderRepository } from "codbex-electra/gen/dao/sales-orders/SalesOrderRepository";
import { getLogger } from "codbex-electra/util/LoggerUtil";

const logger = getLogger(import.meta.url);

export function onMessage(message: string) {
    logger.info("Listener: received message [{}]", message);

    const repo = new SalesOrderRepository();
    const orders = repo.findAll();
    logger.info("Listener: found [{}] sales orders. Sales orders: [{}]", orders.length, JSON.stringify(orders));
}

export function onError(error: string) {
    logger.info("Listener: received error [{}]", error);

    const repo = new SalesOrderRepository();
    const orders = repo.findAll();
    logger.info("Listener: found [{}] sales orders. Sales orders: [{}]", orders.length, JSON.stringify(orders));
}
