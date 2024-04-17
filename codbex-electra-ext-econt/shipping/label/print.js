const viewData = {
    id: 'sales-order-print-shipping-label',
    label: 'Print Shipping Label',
    link: '/services/web/codbex-electra-ext-econt/shipping/label/print-index.html',
    perspective: 'SalesOrders',
    view: 'SalesOrder',
    type: 'entity',
    order: 1
};
if (typeof exports !== 'undefined') {
    exports.getDialogWindow = function () {
        return viewData;
    }
}