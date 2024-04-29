const viewData = {
    id: "codbex-electra-stores",
    label: "Stores",
    lazyLoad: true,
    link: "/services/web/codbex-electra/gen/ui/stores/index.html?embedded"
};
if (typeof exports !== 'undefined') {
    exports.getView = function () {
        return viewData;
    }
}