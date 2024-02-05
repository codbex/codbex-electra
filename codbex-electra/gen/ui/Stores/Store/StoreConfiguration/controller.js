angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-electra.Stores.StoreConfiguration';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/js/codbex-electra/gen/api/Stores/StoreConfiguration.js";
	}])
	.controller('PageController', ['$scope', '$http', 'messageHub', 'entityApi', function ($scope, $http, messageHub, entityApi) {

		//-----------------Custom Actions-------------------//
		$http.get("/services/js/resources-core/services/custom-actions.js?extensionPoint=codbex-electra-custom-action").then(function (response) {
			$scope.pageActions = response.data.filter(e => e.perspective === "Stores" && e.view === "StoreConfiguration" && (e.type === "page" || e.type === undefined));
			$scope.entityActions = response.data.filter(e => e.perspective === "Stores" && e.view === "StoreConfiguration" && e.type === "entity");
		});

		$scope.triggerPageAction = function (actionId) {
			for (const next of $scope.pageActions) {
				if (next.id === actionId) {
					messageHub.showDialogWindow("codbex-electra-custom-action", {
						src: next.link,
					});
					break;
				}
			}
		};

		$scope.triggerEntityAction = function (actionId, selectedEntity) {
			for (const next of $scope.entityActions) {
				if (next.id === actionId) {
					messageHub.showDialogWindow("codbex-electra-custom-action", {
						src: `${next.link}?id=${selectedEntity.Id}`,
					});
					break;
				}
			}
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
			$scope.loadPage($scope.dataPage);
		});

		messageHub.onDidReceiveMessage("entityUpdated", function (msg) {
			$scope.loadPage($scope.dataPage);
		});
		//-----------------Events-------------------//

		$scope.loadPage = function (pageNumber) {
			let Store = $scope.selectedMainEntityId;
			$scope.dataPage = pageNumber;
			entityApi.count(Store).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("StoreConfiguration", `Unable to count StoreConfiguration: '${response.message}'`);
					return;
				}
				$scope.dataCount = response.data;
				let query = `Store=${Store}`;
				let offset = (pageNumber - 1) * $scope.dataLimit;
				let limit = $scope.dataLimit;
				entityApi.filter(query, offset, limit).then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("StoreConfiguration", `Unable to list StoreConfiguration: '${response.message}'`);
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
						$scope.loadPage($scope.dataPage);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsStore = [];
		$scope.optionsProperty = [];

		$http.get("/services/js/codbex-electra/gen/api/Stores/Store.js").then(function (response) {
			$scope.optionsStore = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/js/codbex-electra/gen/api/Stores/StoreConfigurationProperty.js").then(function (response) {
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