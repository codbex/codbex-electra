const dashboard = angular.module('dashboard', ['ideUI', 'ideView']);

dashboard.controller('DashboardController', ['$scope', '$document', '$http', 'messageHub', function ($scope, $document, $http, messageHub) {
    $scope.state = {
        isBusy: true,
        error: false,
        busyText: "Loading...",
    };

    angular.element($document[0]).ready(async function () {
        initOrderStatusesChart();
        initOrdersByStoreChart();

        $scope.$apply(function () {
            $scope.state.isBusy = false;
        });
    });

    function initOrderStatusesChart() {
        const serviceUrl = "/services/ts/codbex-electra/ui/api/DashboardService.ts/ordersData/orderStatuses";
        $http.get(serviceUrl)
            .then(function (response) {
                const orderStatuses = response.data.orderStatuses;

                const labels = new Array();
                const counts = new Array();
                orderStatuses.forEach((orderStatusData) => {
                    labels.push(orderStatusData.name);
                    counts.push(orderStatusData.count);
                });

                // Doughnut Chart Data
                const doughnutData = {
                    labels: labels,
                    datasets: [{
                        data: counts
                    }]
                };

                // Doughnut Chart Configuration
                const doughnutOptions = {
                    responsive: true,
                    maintainAspectRatio: false,
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Product Status'
                    },
                    animation: {
                        animateScale: true,
                        animateRotate: true
                    }
                };

                // Initialize Doughnut Chart
                const doughnutChartCtx = $document[0].getElementById('doughnutChartOrderStatuses').getContext('2d');

                new Chart(doughnutChartCtx, {
                    type: 'doughnut',
                    data: doughnutData,
                    options: doughnutOptions
                });
            });
    }

    function initOrdersByStoreChart() {
        const serviceUrl = "/services/ts/codbex-electra/ui/api/DashboardService.ts/ordersData/ordersByStore";
        $http.get(serviceUrl)
            .then(function (response) {
                const storeOrders = response.data.storeOrders;

                const storeNames = new Array();
                const ordersCount = new Array();
                storeOrders.forEach((storeData) => {
                    storeNames.push(storeData.storeName);
                    ordersCount.push(storeData.ordersCount);
                });

                // Doughnut Chart Data
                const doughnutData = {
                    labels: storeNames,
                    datasets: [{
                        data: ordersCount
                    }]
                };

                // Doughnut Chart Configuration
                const doughnutOptions = {
                    responsive: true,
                    maintainAspectRatio: false,
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Product Status'
                    },
                    animation: {
                        animateScale: true,
                        animateRotate: true
                    }
                };

                // Initialize Doughnut Chart
                const doughnutChartCtx = $document[0].getElementById('doughnutChartOrdersByStore').getContext('2d');

                new Chart(doughnutChartCtx, {
                    type: 'doughnut',
                    data: doughnutData,
                    options: doughnutOptions
                });
            });
    }

    $scope.openPerspective = function (perspective) {
        if (perspective === 'sales-orders') {
            messageHub.postMessage('launchpad.switch.perspective', { perspectiveId: 'sales-orders' }, true);
        } else if (perspective === 'products') {
            messageHub.postMessage('launchpad.switch.perspective', { perspectiveId: 'products' }, true);
        }
    };

    $scope.today = new Date();

    const ordersServiceUrl = "/services/ts/codbex-electra/ui/api/DashboardService.ts/ordersData/newOrders";
    $http.get(ordersServiceUrl)
        .then(function (response) {
            $scope.newOrders = response.data.newOrders;
        });


    const productsServiceUrl = "/services/ts/codbex-electra/ui/api/DashboardService.ts/productsData/outOfStockProducts";
    $http.get(productsServiceUrl)
        .then(function (response) {
            $scope.outOfStockProducts = response.data.outOfStockProducts;
        });


}]);