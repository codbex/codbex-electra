const viewData = {
    id: "codbex-electra-employees",
    label: "Employees",
    lazyLoad: true,
    link: "/services/web/codbex-electra/gen/ui/Employees/index.html?embedded"
};
if (typeof exports !== 'undefined') {
    exports.getView = function () {
        return viewData;
    }
}