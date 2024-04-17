const viewData = {
    id: "codbex-electra-product-attributes",
    label: "Attributes",
    lazyLoad: true,
    link: "/services/web/codbex-electra/gen/ui/product-attributes/index.html?embedded"
};
if (typeof exports !== 'undefined') {
    exports.getView = function () {
        return viewData;
    }
}