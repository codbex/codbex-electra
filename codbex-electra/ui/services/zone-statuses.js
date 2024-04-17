const viewData = {
    id: "codbex-electra-zone-statuses",
    label: "Zone statuses",
    lazyLoad: true,
    link: "/services/web/codbex-electra/gen/ui/zone-statuses/index.html?embedded"
};
if (typeof exports !== 'undefined') {
    exports.getView = function () {
        return viewData;
    }
}