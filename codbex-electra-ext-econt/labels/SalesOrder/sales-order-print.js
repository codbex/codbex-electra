exports.getAction = function () {
    return {
        id: 'sales-order-label-print',
        label: 'Print',
        perspective: 'SalesOrders',
        view: 'SalesOrder',
        type: 'entity',
        link: '/services/web/codbex-electra-ext-econt/labels/SalesOrder/index.html'
    }
}