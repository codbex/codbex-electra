exports.getAction = function () {
    return {
        id: 'sales-order-print-shipping-label',
        label: 'Print Shipping Label',
        perspective: 'SalesOrders',
        view: 'SalesOrder',
        type: 'entity',
        link: '/services/web/codbex-electra-ext-econt/shipping/label/print-index.html'
    }
}