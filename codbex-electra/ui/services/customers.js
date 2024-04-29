const viewData = {
    id: "codbex-electra-customers",
    label: "Customers",
    lazyLoad: true,
    link: "/services/web/codbex-electra/gen/ui/customers/index.html?embedded"
};
if (typeof exports !== 'undefined') {
    exports.getView = function () {
        return viewData;
    }
}