const app = angular.module('print', ['ideUI', 'ideView']);
app.controller('PrintController', ['$scope', '$document', '$http', '$sce', 'ViewParameters', function ($scope, $document, $http, $sce, ViewParameters) {
    $scope.shippingLabelUrl = $sce.trustAsResourceUrl("about:blank");

    const params = ViewParameters.get();

    const labelURL = `/services/ts/codbex-electra-ext-econt/api/SalesOrderService.ts/${params.id}/shippingLabelURL`;

    function handleShippingLabelConfirmed(data) {
        const url = `/services/ts/codbex-electra-ext-econt/api/SalesOrderService.ts/${params.id}/updateTrackingNumber`;

        const shipmentStatus = data.shipmentStatus;
        const trackingNumber = shipmentStatus.shipmentNumber;

        const body = {
            trackingNumber: trackingNumber
        }

        $http.put(url, body)
            .then(function () {
                console.log(`Successfully updated sales order with id [${params.id}].`);
                parent.parent.location.reload();
            }, function (response) {
                console.error(`Failed to update sales order with id [${params.id}]. Response: ${JSON.stringify(response)}`);
            });
    };

    $http.get(labelURL).then(function (response) {
        $scope.shippingLabelURL = $sce.trustAsResourceUrl(response.data.url);
    });

    angular.element($document[0]).ready(function () {
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
}]);