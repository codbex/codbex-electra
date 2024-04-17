const viewData = {
    id: "codbex-electra-customer-statuses",
    label: "Customer statuses",
    lazyLoad: true,
    link: "/services/web/codbex-electra/gen/ui/customer-statuses/index.html?embedded"
};
if (typeof exports !== 'undefined') {
    exports.getView = function () {
        return viewData;
    }
}