const viewData = {
    id: "codbex-electra-order-statuses",
    label: "Order statuses",
    lazyLoad: true,
    link: "/services/web/codbex-electra/gen/ui/order-statuses/index.html?embedded"
};
if (typeof exports !== 'undefined') {
    exports.getView = function () {
        return viewData;
    }
}