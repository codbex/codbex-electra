const viewData = {
    id: "codbex-electra-country-statuses",
    label: "Country statuses",
    lazyLoad: true,
    link: "/services/web/codbex-electra/gen/ui/country-statuses/index.html?embedded"
};
if (typeof exports !== 'undefined') {
    exports.getView = function () {
        return viewData;
    }
}