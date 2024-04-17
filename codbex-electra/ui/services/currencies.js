const viewData = {
    id: "codbex-electra-currencies",
    label: "Currencies",
    lazyLoad: true,
    link: "/services/web/codbex-electra/gen/ui/currencies/index.html?embedded"
};
if (typeof exports !== 'undefined') {
    exports.getView = function () {
        return viewData;
    }
}