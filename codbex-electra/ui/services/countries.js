const viewData = {
    id: "codbex-electra-countries",
    label: "Countries",
    lazyLoad: true,
    link: "/services/web/codbex-electra/gen/ui/countries/index.html?embedded"
};
if (typeof exports !== 'undefined') {
    exports.getView = function () {
        return viewData;
    }
}