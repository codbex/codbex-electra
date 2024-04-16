angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-electra.Stores.StoreConfiguration';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-electra/gen/api/Stores/StoreConfigurationService.ts";
	}])
	.controller('PageController', ['$scope', '$http', 'messageHub', 'entityApi', 'Extensions', function ($scope, $http, messageHub, entityApi, Extensions) {
		//-----------------Custom Actions-------------------//
		Extensions.get('dialogWindow', 'codbex-electra-custom-action').then(function (response) {
			$scope.pageActions = response.filter(e => e.perspective === "Stores" && e.view === "StoreConfiguration" && (e.type === "page" || e.type === undefined));
			$scope.entityActions = response.filter(e => e.perspective === "Stores" && e.view === "StoreConfiguration" && e.type === "entity");
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

		$scope.triggerEntityAction = function (action) {
			messageHub.showDialogWindow(
				action.id,
				{
					id: $scope.entity.Id
				},
				null,
				true,
				action
			);
		};
		//-----------------Custom Actions-------------------//

		function resetPagination() {
			$scope.dataPage = 1;
			$scope.dataCount = 0;
			$scope.dataLimit = 10;
		}
		resetPagination();

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("codbex-electra.Stores.Store.entitySelected", function (msg) {
			resetPagination();
			$scope.selectedMainEntityId = msg.data.selectedMainEntityId;
			$scope.loadPage($scope.dataPage);
		}, true);

		messageHub.onDidReceiveMessage("codbex-electra.Stores.Store.clearDetails", function (msg) {
			$scope.$apply(function () {
				resetPagination();
				$scope.selectedMainEntityId = null;
				$scope.data = null;
			});
		}, true);

		messageHub.onDidReceiveMessage("clearDetails", function (msg) {
			$scope.$apply(function () {
				$scope.entity = {};
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("entityCreated", function (msg) {
			$scope.loadPage($scope.dataPage, $scope.filter);
		});

		messageHub.onDidReceiveMessage("entityUpdated", function (msg) {
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
			let Store = $scope.selectedMainEntityId;
			$scope.dataPage = pageNumber;
			if (!filter && $scope.filter) {
				filter = $scope.filter;
			}
			if (!filter) {
				filter = {};
			}
			if (!filter.$filter) {
				filter.$filter = {};
			}
			if (!filter.$filter.equals) {
				filter.$filter.equals = {};
			}
			filter.$filter.equals.Store = Store;
			entityApi.count(filter).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("StoreConfiguration", `Unable to count StoreConfiguration: '${response.message}'`);
					return;
				}
				if (response.data) {
					$scope.dataCount = response.data;
				}
				filter.$offset = (pageNumber - 1) * $scope.dataLimit;
				filter.$limit = $scope.dataLimit;
				entityApi.search(filter).then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("StoreConfiguration", `Unable to list/filter StoreConfiguration: '${response.message}'`);
						return;
					}
					$scope.data = response.data;
				});
			});
		};

		$scope.selectEntity = function (entity) {
			$scope.selectedEntity = entity;
		};

		$scope.openDetails = function (entity) {
			$scope.selectedEntity = entity;
			messageHub.showDialogWindow("StoreConfiguration-details", {
				action: "select",
				entity: entity,
				optionsStore: $scope.optionsStore,
				optionsProperty: $scope.optionsProperty,
			});
		};

		$scope.openFilter = function (entity) {
			messageHub.showDialogWindow("StoreConfiguration-filter", {
				entity: $scope.filterEntity,
				optionsStore: $scope.optionsStore,
				optionsProperty: $scope.optionsProperty,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			messageHub.showDialogWindow("StoreConfiguration-details", {
				action: "create",
				entity: {},
				selectedMainEntityKey: "Store",
				selectedMainEntityId: $scope.selectedMainEntityId,
				optionsStore: $scope.optionsStore,
				optionsProperty: $scope.optionsProperty,
			}, null, false);
		};

		$scope.updateEntity = function (entity) {
			messageHub.showDialogWindow("StoreConfiguration-details", {
				action: "update",
				entity: entity,
				selectedMainEntityKey: "Store",
				selectedMainEntityId: $scope.selectedMainEntityId,
				optionsStore: $scope.optionsStore,
				optionsProperty: $scope.optionsProperty,
			}, null, false);
		};

		$scope.deleteEntity = function (entity) {
			let id = entity.Id;
			messageHub.showDialogAsync(
				'Delete StoreConfiguration?',
				`Are you sure you want to delete StoreConfiguration? This action cannot be undone.`,
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
							messageHub.showAlertError("StoreConfiguration", `Unable to delete StoreConfiguration: '${response.message}'`);
							return;
						}
						$scope.loadPage($scope.dataPage, $scope.filter);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsStore = [];
		$scope.optionsProperty = [];


		$http.get("/services/ts/codbex-electra/gen/api/Stores/StoreService.ts").then(function (response) {
			$scope.optionsStore = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/ts/codbex-electra/gen/api/Store configurations/StoreConfigurationPropertyService.ts").then(function (response) {
			$scope.optionsProperty = response.data.map(e => {
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
		$scope.optionsPropertyValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsProperty.length; i++) {
				if ($scope.optionsProperty[i].value === optionKey) {
					return $scope.optionsProperty[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	}]);
