const viewData = {
    id: "codbex-electra-store-configurations",
    label: "Store Configurations",
    lazyLoad: true,
    link: "/services/web/codbex-electra/gen/ui/store-configurations/index.html?embedded"
};
if (typeof exports !== 'undefined') {
    exports.getView = function () {
        return viewData;
    }
}