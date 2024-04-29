const viewData = {
    id: "codbex-electra-sales-orders",
    label: "Sales Orders",
    lazyLoad: true,
    link: "/services/web/codbex-electra/gen/ui/sales-orders/index.html?embedded"
};
if (typeof exports !== 'undefined') {
    exports.getView = function () {
        return viewData;
    }
}