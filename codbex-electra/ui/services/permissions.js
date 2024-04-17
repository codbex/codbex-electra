const viewData = {
    id: "codbex-electra-permissions",
    label: "Permissions",
    lazyLoad: true,
    link: "/services/web/codbex-electra/gen/ui/permissions/index.html?embedded"
};
if (typeof exports !== 'undefined') {
    exports.getView = function () {
        return viewData;
    }
}