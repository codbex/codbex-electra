const viewData = {
    id: "codbex-electra-products",
    label: "Products",
    lazyLoad: true,
    link: "/services/web/codbex-electra/gen/ui/Products/index.html?embedded"
};
if (typeof exports !== 'undefined') {
    exports.getView = function () {
        return viewData;
    }
}