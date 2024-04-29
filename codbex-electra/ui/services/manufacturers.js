const viewData = {
    id: "codbex-electra-manufacturers",
    label: "Manufacturers",
    lazyLoad: true,
    link: "/services/web/codbex-electra/gen/ui/manufacturers/index.html?embedded"
};
if (typeof exports !== 'undefined') {
    exports.getView = function () {
        return viewData;
    }
}