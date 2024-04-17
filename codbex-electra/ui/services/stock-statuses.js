const viewData = {
    id: "codbex-electra-stock-statuses",
    label: "Stock statuses",
    lazyLoad: true,
    link: "/services/web/codbex-electra/gen/ui/stock-statuses/index.html?embedded"
};
if (typeof exports !== 'undefined') {
    exports.getView = function () {
        return viewData;
    }
}