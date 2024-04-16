const viewData = {
    id: "codbex-electra-zones",
    label: "Countries",
    lazyLoad: true,
    link: "/services/web/codbex-electra/gen/ui/Zones/index.html?embedded"
};
if (typeof exports !== 'undefined') {
    exports.getView = function () {
        return viewData;
    }
}