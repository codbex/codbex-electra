angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-electra.sales-orders.SalesOrder';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-electra/gen/api/sales-orders/SalesOrderService.ts";
	}])
	.controller('PageController', ['$scope', '$http', 'messageHub', 'entityApi', 'Extensions', function ($scope, $http, messageHub, entityApi, Extensions) {

		$scope.dataPage = 1;
		$scope.dataCount = 0;
		$scope.dataOffset = 0;
		$scope.dataLimit = 10;
		$scope.action = "select";

		//-----------------Custom Actions-------------------//
		Extensions.get('dialogWindow', 'codbex-electra-custom-action').then(function (response) {
			$scope.pageActions = response.filter(e => e.perspective === "sales-orders" && e.view === "SalesOrder" && (e.type === "page" || e.type === undefined));
		});

		$scope.triggerPageAction = function (action) {
			messageHub.showDialogWindow(
				action.id,
				{},
				null,
				true,
				action
			);
		};
		//-----------------Custom Actions-------------------//

		function refreshData() {
			$scope.dataReset = true;
			$scope.dataPage--;
		}

		function resetPagination() {
			$scope.dataReset = true;
			$scope.dataPage = 1;
			$scope.dataCount = 0;
			$scope.dataLimit = 10;
		}

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("clearDetails", function (msg) {
			$scope.$apply(function () {
				$scope.selectedEntity = null;
				$scope.action = "select";
			});
		});

		messageHub.onDidReceiveMessage("entityCreated", function (msg) {
			refreshData();
			$scope.loadPage($scope.dataPage, $scope.filter);
		});

		messageHub.onDidReceiveMessage("entityUpdated", function (msg) {
			refreshData();
			$scope.loadPage($scope.dataPage, $scope.filter);
		});

		messageHub.onDidReceiveMessage("entitySearch", function (msg) {
			resetPagination();
			$scope.filter = msg.data.filter;
			$scope.filterEntity = msg.data.entity;
			$scope.loadPage($scope.dataPage, $scope.filter);
		});
		//-----------------Events-------------------//

		$scope.loadPage = function (pageNumber, filter) {
			if (!filter && $scope.filter) {
				filter = $scope.filter;
			}
			if (!filter) {
				filter = {};
			}
			$scope.selectedEntity = null;
			entityApi.count(filter).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("SalesOrder", `Unable to count SalesOrder: '${response.message}'`);
					return;
				}
				if (response.data) {
					$scope.dataCount = response.data;
				}
				$scope.dataPages = Math.ceil($scope.dataCount / $scope.dataLimit);
				filter.$offset = ($scope.dataPage - 1) * $scope.dataLimit;
				filter.$limit = $scope.dataLimit;
				if ($scope.dataReset) {
					filter.$offset = 0;
					filter.$limit = $scope.dataPage * $scope.dataLimit;
				}

				entityApi.search(filter).then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("SalesOrder", `Unable to list/filter SalesOrder: '${response.message}'`);
						return;
					}
					if ($scope.data == null || $scope.dataReset) {
						$scope.data = [];
						$scope.dataReset = false;
					}

					response.data.forEach(e => {
						if (e.DateAdded) {
							e.DateAdded = new Date(e.DateAdded);
						}
						if (e.DateModified) {
							e.DateModified = new Date(e.DateModified);
						}
					});

					$scope.data = $scope.data.concat(response.data);
					$scope.dataPage++;
				});
			});
		};
		$scope.loadPage($scope.dataPage, $scope.filter);

		$scope.selectEntity = function (entity) {
			$scope.selectedEntity = entity;
			messageHub.postMessage("entitySelected", {
				entity: entity,
				selectedMainEntityId: entity.Id,
				optionsStore: $scope.optionsStore,
				optionsStatus: $scope.optionsStatus,
				optionsCurrency: $scope.optionsCurrency,
				optionsCustomer: $scope.optionsCustomer,
				optionsLanguage: $scope.optionsLanguage,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			$scope.action = "create";

			messageHub.postMessage("createEntity", {
				entity: {},
				optionsStore: $scope.optionsStore,
				optionsStatus: $scope.optionsStatus,
				optionsCurrency: $scope.optionsCurrency,
				optionsCustomer: $scope.optionsCustomer,
				optionsLanguage: $scope.optionsLanguage,
			});
		};

		$scope.updateEntity = function () {
			$scope.action = "update";
			messageHub.postMessage("updateEntity", {
				entity: $scope.selectedEntity,
				optionsStore: $scope.optionsStore,
				optionsStatus: $scope.optionsStatus,
				optionsCurrency: $scope.optionsCurrency,
				optionsCustomer: $scope.optionsCustomer,
				optionsLanguage: $scope.optionsLanguage,
			});
		};

		$scope.deleteEntity = function () {
			let id = $scope.selectedEntity.Id;
			messageHub.showDialogAsync(
				'Delete SalesOrder?',
				`Are you sure you want to delete SalesOrder? This action cannot be undone.`,
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
							messageHub.showAlertError("SalesOrder", `Unable to delete SalesOrder: '${response.message}'`);
							return;
						}
						refreshData();
						$scope.loadPage($scope.dataPage, $scope.filter);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		$scope.openFilter = function (entity) {
			messageHub.showDialogWindow("SalesOrder-filter", {
				entity: $scope.filterEntity,
				optionsStore: $scope.optionsStore,
				optionsStatus: $scope.optionsStatus,
				optionsCurrency: $scope.optionsCurrency,
				optionsCustomer: $scope.optionsCustomer,
				optionsLanguage: $scope.optionsLanguage,
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsStore = [];
		$scope.optionsStatus = [];
		$scope.optionsCurrency = [];
		$scope.optionsCustomer = [];
		$scope.optionsLanguage = [];


		$http.get("/services/ts/codbex-electra/gen/api/stores/StoreService.ts").then(function (response) {
			$scope.optionsStore = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/ts/codbex-electra/gen/api/order-statuses/OrderStatusService.ts").then(function (response) {
			$scope.optionsStatus = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/ts/codbex-electra/gen/api/currencies/CurrencyService.ts").then(function (response) {
			$scope.optionsCurrency = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Code
				}
			});
		});

		$http.get("/services/ts/codbex-electra/gen/api/customers/CustomerService.ts").then(function (response) {
			$scope.optionsCustomer = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Email
				}
			});
		});

		$http.get("/services/ts/codbex-electra/gen/api/languages/LanguageService.ts").then(function (response) {
			$scope.optionsLanguage = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$scope.optionsStoreValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsStore.length; i++) {
				if ($scope.optionsStore[i].value === optionKey) {
					return $scope.optionsStore[i].text;
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
		$scope.optionsCurrencyValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsCurrency.length; i++) {
				if ($scope.optionsCurrency[i].value === optionKey) {
					return $scope.optionsCurrency[i].text;
				}
			}
			return null;
		};
		$scope.optionsCustomerValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsCustomer.length; i++) {
				if ($scope.optionsCustomer[i].value === optionKey) {
					return $scope.optionsCustomer[i].text;
				}
			}
			return null;
		};
		$scope.optionsLanguageValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsLanguage.length; i++) {
				if ($scope.optionsLanguage[i].value === optionKey) {
					return $scope.optionsLanguage[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	}]);
