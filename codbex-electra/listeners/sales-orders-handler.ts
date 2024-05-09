import { SalesOrderUpdateEntityEvent, SalesOrderEntity } from "codbex-electra/gen/dao/sales-orders/SalesOrderRepository";
import { SalesOrderItemRepository as SalesOrderItemDAO, SalesOrderItemEntityOptions, SalesOrderItemEntity } from "codbex-electra/gen/dao/sales-orders/SalesOrderItemRepository";
import { ProductRepository as ProductDAO } from "codbex-electra/gen/dao/products/ProductRepository";
import { StoreConfigDAO } from "codbex-electra-opencart/dao/StoreConfigDAO";
import { getLogger } from "codbex-electra/util/LoggerUtil";

const logger = getLogger(import.meta.url);

function isInstanceOfSalesOrderUpdateEntityEvent(obj: any): obj is SalesOrderUpdateEntityEvent {
    return obj.previousEntity !== undefined;
}

export function onMessage(message: string) {
    const event: any = JSON.parse(message);
    if (!isInstanceOfSalesOrderUpdateEntityEvent(event)) {
        logger.debug("Event message [{}] is not applicable for this listener", message);
        return;
    }
    const updateEvent: SalesOrderUpdateEntityEvent = event;
    const currentEntity = updateEvent.entity;
    const previousEntity = updateEvent.previousEntity;

    const productsQuantityUpdater = new ProductsQuantityUpdater();
    productsQuantityUpdater.updateQuantities(currentEntity, previousEntity);
}

export function onError(error: string) {
    // nothing to do here
}


class ProductsQuantityUpdater {
    protected readonly salesOrderItemDAO;
    protected readonly storeConfigDAO;
    protected readonly productDAO;

    constructor() {
        this.salesOrderItemDAO = new SalesOrderItemDAO();
        this.storeConfigDAO = new StoreConfigDAO();
        this.productDAO = new ProductDAO();
    }

    updateQuantities(currentOrder: Partial<SalesOrderEntity>, previousOrder: SalesOrderEntity) {
        logger.debug("About to update quantities. Current order [{}], Prev order [{}]", currentOrder, previousOrder);

        const completeOrderStatusId = this.storeConfigDAO.getStoreCompleteOrderStatusId(previousOrder.Store);

        const completedOrder = currentOrder.Status === completeOrderStatusId && previousOrder.Status !== completeOrderStatusId;
        if (completedOrder) {
            logger.debug("Order [{}] is completed. Will reduce products quantity", previousOrder.Id);
            this.reduceProductsQuantity(previousOrder.Id);
            return;
        }

        const reopenedOrder = currentOrder.Status !== completeOrderStatusId && previousOrder.Status == completeOrderStatusId;
        if (reopenedOrder) {
            logger.debug("Order [{}] is reopened. Will increase products quantity", previousOrder.Id);
            this.increaseProductsQuantity(previousOrder.Id);
            return;
        }
    }

    private reduceProductsQuantity(orderId: number) {
        const orderItems = this.getOrderItems(orderId);
        orderItems.forEach(this.reduceProductQuantity.bind(this));
    }

    private reduceProductQuantity(orderItem: SalesOrderItemEntity) {
        const orderedQuantity = orderItem.Quantity;
        const product = this.productDAO.findById(orderItem.Product)!;
        logger.debug("Reducing quantity [{}] with [{}] for product [{}]", product.Quantity, orderedQuantity, product.Id);
        product.Quantity = product.Quantity - orderedQuantity;

        this.productDAO.update(product);
    }

    private increaseProductsQuantity(orderId: number) {
        const orderItems = this.getOrderItems(orderId);
        orderItems.forEach(this.increaseProductQuantity.bind(this));
    }

    private increaseProductQuantity(orderItem: SalesOrderItemEntity) {
        const orderedQuantity = orderItem.Quantity;
        const product = this.productDAO.findById(orderItem.Product)!;
        logger.debug("Increasing quantity [{}] with [{}] for product [{}]", product.Quantity, orderedQuantity, product.Id);
        product.Quantity = product.Quantity + orderedQuantity;

        this.productDAO.update(product);
    }

    private getOrderItems(orderId: number) {
        const querySettings: SalesOrderItemEntityOptions = {
            $select: ["Quantity", "Product"],
            $filter: {
                equals: {
                    SalesOrder: orderId
                }
            }
        };
        return this.salesOrderItemDAO.findAll(querySettings);
    }

}