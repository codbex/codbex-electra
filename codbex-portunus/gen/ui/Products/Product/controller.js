angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'new-portunus.Products.Product';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/js/new-portunus/gen/api/Products/Product.js";
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
					messageHub.showAlertError("Product", `Unable to count Product: '${response.message}'`);
					return;
				}
				$scope.dataCount = response.data;
				let offset = (pageNumber - 1) * $scope.dataLimit;
				let limit = $scope.dataLimit;
				entityApi.list(offset, limit).then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("Product", `Unable to list Product: '${response.message}'`);
						return;
					}

					response.data.forEach(e => {
						if (e.DateAvailable) {
							e.DateAvailable = new Date(e.DateAvailable);
						}
						if (e.DateAdded) {
							e.DateAdded = new Date(e.DateAdded);
						}
						if (e.DateModified) {
							e.DateModified = new Date(e.DateModified);
						}
					});

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
			messageHub.showDialogWindow("Product-details", {
				action: "select",
				entity: entity,
				optionsStockStatus: $scope.optionsStockStatus,
				optionsManifacturer: $scope.optionsManifacturer,
				optionsStatus: $scope.optionsStatus,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			messageHub.showDialogWindow("Product-details", {
				action: "create",
				entity: {},
				optionsStockStatus: $scope.optionsStockStatus,
				optionsManifacturer: $scope.optionsManifacturer,
				optionsStatus: $scope.optionsStatus,
			}, null, false);
		};

		$scope.updateEntity = function (entity) {
			messageHub.showDialogWindow("Product-details", {
				action: "update",
				entity: entity,
				optionsStockStatus: $scope.optionsStockStatus,
				optionsManifacturer: $scope.optionsManifacturer,
				optionsStatus: $scope.optionsStatus,
			}, null, false);
		};

		$scope.deleteEntity = function (entity) {
			let id = entity.Id;
			messageHub.showDialogAsync(
				'Delete Product?',
				`Are you sure you want to delete Product? This action cannot be undone.`,
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
							messageHub.showAlertError("Product", `Unable to delete Product: '${response.message}'`);
							return;
						}
						$scope.loadPage($scope.dataPage);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsStockStatus = [];
		$scope.optionsManifacturer = [];
		$scope.optionsStatus = [];

		$http.get("/services/js/new-portunus/gen/api/Settings/StockStatus.js").then(function (response) {
			$scope.optionsStockStatus = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/js/new-portunus/gen/api/Manufacturers/Manifacturer.js").then(function (response) {
			$scope.optionsManifacturer = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/js/new-portunus/gen/api/Settings/ProductStatus.js").then(function (response) {
			$scope.optionsStatus = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});
		$scope.optionsStockStatusValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsStockStatus.length; i++) {
				if ($scope.optionsStockStatus[i].value === optionKey) {
					return $scope.optionsStockStatus[i].text;
				}
			}
			return null;
		};
		$scope.optionsManifacturerValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsManifacturer.length; i++) {
				if ($scope.optionsManifacturer[i].value === optionKey) {
					return $scope.optionsManifacturer[i].text;
				}
			}
			return null;
		};
		$scope.optionsStatusValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsStatus.length; i++) {
				if ($scope.optionsStatus[i].value === optionKey) {
					return $scope.optionsStatus[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	}]);
