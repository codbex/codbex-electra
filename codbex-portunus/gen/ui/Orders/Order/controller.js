angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-portunus.Orders.Order';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/js/codbex-portunus/gen/api/Orders/Order.js";
	}])
	.controller('PageController', ['$scope', '$http', 'messageHub', 'entityApi', function ($scope, $http, messageHub, entityApi) {

		function resetPagination() {
			$scope.dataPage = 1;
			$scope.dataCount = 0;
			$scope.dataLimit = 20;
		}
		resetPagination();

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("entityCreated", function (msg) {
			$scope.loadPage($scope.dataPage);
		});

		messageHub.onDidReceiveMessage("entityUpdated", function (msg) {
			$scope.loadPage($scope.dataPage);
		});
		//-----------------Events-------------------//

		$scope.loadPage = function (pageNumber) {
			$scope.dataPage = pageNumber;
			entityApi.count().then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("Order", `Unable to count Order: '${response.message}'`);
					return;
				}
				$scope.dataCount = response.data;
				let offset = (pageNumber - 1) * $scope.dataLimit;
				let limit = $scope.dataLimit;
				entityApi.list(offset, limit).then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("Order", `Unable to list Order: '${response.message}'`);
						return;
					}
					$scope.data = response.data;
				});
			});
		};
		$scope.loadPage($scope.dataPage);

		$scope.selectEntity = function (entity) {
			$scope.selectedEntity = entity;
		};

		$scope.openDetails = function (entity) {
			$scope.selectedEntity = entity;
			messageHub.showDialogWindow("Order-details", {
				action: "select",
				entity: entity,
				optionsCustomerId: $scope.optionsCustomerId,
				optionsOrderStatus: $scope.optionsOrderStatus,
				optionsStoreId: $scope.optionsStoreId,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			messageHub.showDialogWindow("Order-details", {
				action: "create",
				entity: {},
				optionsCustomerId: $scope.optionsCustomerId,
				optionsOrderStatus: $scope.optionsOrderStatus,
				optionsStoreId: $scope.optionsStoreId,
			}, null, false);
		};

		$scope.updateEntity = function (entity) {
			messageHub.showDialogWindow("Order-details", {
				action: "update",
				entity: entity,
				optionsCustomerId: $scope.optionsCustomerId,
				optionsOrderStatus: $scope.optionsOrderStatus,
				optionsStoreId: $scope.optionsStoreId,
			}, null, false);
		};

		$scope.deleteEntity = function (entity) {
			let id = entity.Id;
			messageHub.showDialogAsync(
				'Delete Order?',
				`Are you sure you want to delete Order? This action cannot be undone.`,
				[{
					id: "delete-btn-yes",
					type: "emphasized",
					label: "Yes",
				},
				{
					id: "delete-btn-no",
					type: "normal",
					label: "No",
				}],
			).then(function (msg) {
				if (msg.data === "delete-btn-yes") {
					entityApi.delete(id).then(function (response) {
						if (response.status != 204) {
							messageHub.showAlertError("Order", `Unable to delete Order: '${response.message}'`);
							return;
						}
						$scope.loadPage($scope.dataPage);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsCustomerId = [];
		$scope.optionsOrderStatus = [];
		$scope.optionsStoreId = [];

		$http.get("/services/js/codbex-portunus/gen/api/Customers/Customer.js").then(function (response) {
			$scope.optionsCustomerId = response.data.map(e => {
				return {
					value: e.Id,
					text: e.FirstName
				}
			});
		});

		$http.get("/services/js/codbex-portunus/gen/api/Settings/OrderStatus.js").then(function (response) {
			$scope.optionsOrderStatus = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/js/codbex-portunus/gen/api/Stores/Store.js").then(function (response) {
			$scope.optionsStoreId = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});
		$scope.optionsCustomerIdValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsCustomerId.length; i++) {
				if ($scope.optionsCustomerId[i].value === optionKey) {
					return $scope.optionsCustomerId[i].text;
				}
			}
			return null;
		};
		$scope.optionsOrderStatusValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsOrderStatus.length; i++) {
				if ($scope.optionsOrderStatus[i].value === optionKey) {
					return $scope.optionsOrderStatus[i].text;
				}
			}
			return null;
		};
		$scope.optionsStoreIdValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsStoreId.length; i++) {
				if ($scope.optionsStoreId[i].value === optionKey) {
					return $scope.optionsStoreId[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	}]);
