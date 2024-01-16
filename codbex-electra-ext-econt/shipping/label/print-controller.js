let angularHttp;

const app = angular.module('templateApp', []);
app.controller('templateContoller', function ($scope, $http, $sce) {
    angularHttp = $http;
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

function handleShippingLabelConfirmed(data) {
    const salesOrderId = parseInt(data.orderData.num);
    const url = `/services/js/codbex-electra/gen/api/SalesOrders/SalesOrder.js/${salesOrderId}`;

    const shipmentStatus = data.shipmentStatus;;

    angularHttp.get(url)
        .then(function (response) {
            const salesOrder = response.data;

            salesOrder.Tracking = shipmentStatus.shipmentNumber;
            salesOrder.DateModified = Date.now();
            salesOrder.DateAdded = undefined;

            angularHttp.put(url, salesOrder)
                .then(function () {
                    console.log(`Successfully updated sales order with id [${salesOrderId}].`);
                    parent.parent.location.reload();
                }, function (response) {
                    console.error(`Failed to update sales order with id [${salesOrderId}]. Response: ${JSON.stringify(response)}`);
                });

        }, function (response) {
            console.error(`Failed to get sales order with id [${salesOrderId}]. Response: ${JSON.stringify(response)}`);
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