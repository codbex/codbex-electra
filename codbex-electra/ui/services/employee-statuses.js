const viewData = {
    id: "codbex-electra-employee-statuses",
    label: "Employee statuses",
    lazyLoad: true,
    link: "/services/web/codbex-electra/gen/ui/employee-statuses/index.html?embedded"
};
if (typeof exports !== 'undefined') {
    exports.getView = function () {
        return viewData;
    }
}