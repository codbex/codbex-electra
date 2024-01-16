const app = angular.module('templateApp', []);
app.controller('templateContoller', function ($scope, $http, $sce) {
    $scope.shippingLabelUrl = $sce.trustAsResourceUrl("about:blank");

    const urlString = (window.location.href).toLowerCase();
    const url = new URL(urlString);

    const salesOrderId = url.searchParams.get("id");
    const labelURL = `/services/js/codbex-electra-ext-econt/api/SalesOrders.js/${salesOrderId}/shippingLabelURL`;

    $http.get(labelURL)
        .then(function (response) {
            $scope.shippingLabelURL = $sce.trustAsResourceUrl(response.data.url);
        });
});

$(function ($) {
    const empty__ = function (thingy) {
        return thingy == 0 || !thingy || (typeof (thingy) === 'object' && $.isEmptyObject(thingy));
    }

    $(window).on('message', function (event) {
        const messageData = event['originalEvent']['data'];
        if (!messageData) return;

        const eventType = messageData['event'];
        switch (eventType) {
            case 'cancel':
                console.log("Processing cancel");
                break;
            case 'confirm':
                if (messageData['printPdf'] === true && !empty__(messageData['shipmentStatus']['pdfURL'])) {
                    window.open(messageData['shipmentStatus']['pdfURL'], '_blank');
                }

                break;
        }
    });
});