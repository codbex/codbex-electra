const viewData = {
    id: "codbex-electra-languages",
    label: "Languages",
    lazyLoad: true,
    link: "/services/web/codbex-electra/gen/ui/languages/index.html?embedded"
};
if (typeof exports !== 'undefined') {
    exports.getView = function () {
        return viewData;
    }
}