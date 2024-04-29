const perspectiveData = {
    id: "codbex-electra-launchpad",
    name: "Electra",
    link: "../codbex-electra/ui/index.html",
    order: "0",
    icon: "../codbex-electra/ui/images/navigation.svg",
};

if (typeof exports !== 'undefined') {
    exports.getPerspective = function () {
        return perspectiveData;
    }
}