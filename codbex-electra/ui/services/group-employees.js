const viewData = {
    id: "codbex-electra-group-employees",
    label: "Group employees",
    lazyLoad: true,
    link: "/services/web/codbex-electra/gen/ui/group-employees/index.html?embedded"
};
if (typeof exports !== 'undefined') {
    exports.getView = function () {
        return viewData;
    }
}