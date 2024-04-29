const viewData = {
    id: "codbex-electra-product-categories",
    label: "Product Categories",
    lazyLoad: true,
    link: "/services/web/codbex-electra/gen/ui/product-categories/index.html?embedded"
};
if (typeof exports !== 'undefined') {
    exports.getView = function () {
        return viewData;
    }
}