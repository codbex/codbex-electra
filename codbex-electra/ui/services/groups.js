const viewData = {
    id: "codbex-electra-groups",
    label: "Groups",
    lazyLoad: true,
    link: "/services/web/codbex-electra/gen/ui/groups/index.html?embedded"
};
if (typeof exports !== 'undefined') {
    exports.getView = function () {
        return viewData;
    }
}