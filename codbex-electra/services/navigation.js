const perspectiveData = {
    id: "codbex-electra-launchpad",
    name: "Electra",
    link: "../codbex-electra/index.html",
    order: "0",
    icon: "../codbex-electra/images/navigation.svg",
};

if (typeof exports !== 'undefined') {
    exports.getPerspective = function () {
        return perspectiveData;
    }
}