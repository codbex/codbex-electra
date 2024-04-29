const viewData = {
    id: "codbex-electra-dashboard",
    label: "Dashboard",
    lazyLoad: true,
    link: "/services/web/codbex-electra/ui/subviews/dashboard.html"
};
if (typeof exports !== 'undefined') {
    exports.getView = function () {
        return viewData;
    }
}