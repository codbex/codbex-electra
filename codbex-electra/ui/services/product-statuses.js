const viewData = {
    id: "codbex-electra-product-statuses",
    label: "Product statuses",
    lazyLoad: true,
    link: "/services/web/codbex-electra/gen/ui/product-statuses/index.html?embedded"
};
if (typeof exports !== 'undefined') {
    exports.getView = function () {
        return viewData;
    }
}