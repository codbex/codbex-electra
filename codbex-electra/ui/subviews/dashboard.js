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
        initProductWithLowQuantity();

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
                    labels.push(orderStatusData.statusName);
                    counts.push(orderStatusData.ordersCount);
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
                    ordersCount.push(storeData.orders);
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

    function initProductWithLowQuantity() {
        const serviceUrl = "/services/ts/codbex-electra/ui/api/DashboardService.ts/productsData/productWithLowQuantity";
        $http.get(serviceUrl)
            .then(function (response) {
                const products = response.data.products;

                const labels = new Array();
                const counts = new Array();
                products.forEach((product) => {
                    labels.push(product.productName);
                    counts.push(product.quantity);
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
                const doughnutChartCtx = $document[0].getElementById('doughnutChartProductsLowQuantity').getContext('2d');

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
        }

        if (perspective === 'products') {
            messageHub.postMessage('launchpad.switch.perspective', { perspectiveId: 'products' }, true);
        }

        if (perspective === 'customers') {
            messageHub.postMessage('launchpad.switch.perspective', { perspectiveId: 'customers' }, true);
        }
    };

    $scope.today = new Date();

    $http.get("/services/ts/codbex-electra/ui/api/DashboardService.ts/ordersData/orders")
        .then(function (response) {
            $scope.orders = response.data.orders;
        });


    $http.get("/services/ts/codbex-electra/ui/api/DashboardService.ts/productsData/outOfStockProducts")
        .then(function (response) {
            $scope.outOfStockProducts = response.data.outOfStockProducts;
        });

    $http.get("/services/ts/codbex-electra/ui/api/DashboardService.ts/productsData/soldProducts")
        .then(function (response) {
            $scope.soldProducts = response.data.soldProducts;
        });


    $http.get("/services/ts/codbex-electra/ui/api/DashboardService.ts/customersData/newCustomers")
        .then(function (response) {
            $scope.newCustomers = response.data.newCustomers;
        });
}]);