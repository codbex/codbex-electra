const viewData = {
    id: "codbex-electra-currency-statuses",
    label: "Currency statuses",
    lazyLoad: true,
    link: "/services/web/codbex-electra/gen/ui/currency-statuses/index.html?embedded"
};
if (typeof exports !== 'undefined') {
    exports.getView = function () {
        return viewData;
    }
}