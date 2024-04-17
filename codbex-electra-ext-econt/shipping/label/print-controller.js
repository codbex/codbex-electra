let angularHttp;
let salesOrderId;

const app = angular.module('templateApp', ['ideUI', 'ideView']);
app.controller('templateContoller', ['$scope', '$http', '$sce', 'ViewParameters', function ($scope, $http, $sce, ViewParameters) {
    angularHttp = $http;
    $scope.shippingLabelUrl = $sce.trustAsResourceUrl("about:blank");

    const params = ViewParameters.get();
    salesOrderId = params.id;

    const labelURL = `/services/ts/codbex-electra-ext-econt/api/SalesOrderService.ts/${salesOrderId}/shippingLabelURL`;

    $http.get(labelURL)
        .then(function (response) {
            $scope.shippingLabelURL = $sce.trustAsResourceUrl(response.data.url);
        });
}]);

function handleShippingLabelConfirmed(data) {
    const url = `/services/ts/codbex-electra-ext-econt/api/SalesOrderService.ts/${salesOrderId}/updateTrackingNumber`;

    const shipmentStatus = data.shipmentStatus;
    const trackingNumber = shipmentStatus.shipmentNumber;

    const body = {
        trackingNumber: trackingNumber
    }

    angularHttp.put(url, body)
        .then(function () {
            console.log(`Successfully updated sales order with id [${salesOrderId}].`);
            parent.parent.location.reload();
        }, function (response) {
            console.error(`Failed to update sales order with id [${salesOrderId}]. Response: ${JSON.stringify(response)}`);
        });
};

$(function ($) {
    const empty__ = function (thingy) {
        return thingy == 0 || !thingy || (typeof (thingy) === 'object' && $.isEmptyObject(thingy));
    }

    $(window).on('message', function (event) {
        const messageData = event['originalEvent']['data'];
        if (!messageData) return;

        const eventType = messageData['event'];
        switch (eventType) {
            case 'confirm':
                if (messageData?.shipmentStatus?.pdfURL) {
                    window.open(messageData['shipmentStatus']['pdfURL'], '_blank');
                }

                handleShippingLabelConfirmed(messageData);
                break;
        }
    });
});