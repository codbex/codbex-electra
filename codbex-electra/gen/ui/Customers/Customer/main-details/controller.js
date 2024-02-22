angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-electra.Customers.Customer';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-electra/gen/api/Customers/CustomerService.ts";
	}])
	.controller('PageController', ['$scope', '$http', 'messageHub', 'entityApi', function ($scope, $http, messageHub, entityApi) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: "Customer Details",
			create: "Create Customer",
			update: "Update Customer"
		};
		$scope.action = 'select';

		//-----------------Custom Actions-------------------//
		$http.get("/services/js/resources-core/services/custom-actions.js?extensionPoint=codbex-electra-custom-action").then(function (response) {
			$scope.entityActions = response.data.filter(e => e.perspective === "Customers" && e.view === "Customer" && e.type === "entity");
		});

		$scope.triggerEntityAction = function (actionId, selectedEntity) {
			for (const next of $scope.entityActions) {
				if (next.id === actionId) {
					messageHub.showDialogWindow("codbex-electra-custom-action", {
						src: `${next.link}?id=${$scope.entity.Id}`,
					});
					break;
				}
			}
		};
		//-----------------Custom Actions-------------------//

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("clearDetails", function (msg) {
			$scope.$apply(function () {
				$scope.entity = {};
				$scope.optionsStore = [];
				$scope.optionsStatus = [];
				$scope.optionsLanguage = [];
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("entitySelected", function (msg) {
			$scope.$apply(function () {
				if (msg.data.entity.DateAdded) {
					msg.data.entity.DateAdded = new Date(msg.data.entity.DateAdded);
				}
				$scope.entity = msg.data.entity;
				$scope.optionsStore = msg.data.optionsStore;
				$scope.optionsStatus = msg.data.optionsStatus;
				$scope.optionsLanguage = msg.data.optionsLanguage;
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("createEntity", function (msg) {
			$scope.$apply(function () {
				$scope.entity = {};
				$scope.optionsStore = msg.data.optionsStore;
				$scope.optionsStatus = msg.data.optionsStatus;
				$scope.optionsLanguage = msg.data.optionsLanguage;
				$scope.action = 'create';
			});
		});

		messageHub.onDidReceiveMessage("updateEntity", function (msg) {
			$scope.$apply(function () {
				if (msg.data.entity.DateAdded) {
					msg.data.entity.DateAdded = new Date(msg.data.entity.DateAdded);
				}
				$scope.entity = msg.data.entity;
				$scope.optionsStore = msg.data.optionsStore;
				$scope.optionsStatus = msg.data.optionsStatus;
				$scope.optionsLanguage = msg.data.optionsLanguage;
				$scope.action = 'update';
			});
		});
		//-----------------Events-------------------//

		$scope.create = function () {
			entityApi.create($scope.entity).then(function (response) {
				if (response.status != 201) {
					messageHub.showAlertError("Customer", `Unable to create Customer: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityCreated", response.data);
				messageHub.postMessage("clearDetails", response.data);
				messageHub.showAlertSuccess("Customer", "Customer successfully created");
			});
		};

		$scope.update = function () {
			entityApi.update($scope.entity.Id, $scope.entity).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("Customer", `Unable to update Customer: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityUpdated", response.data);
				messageHub.postMessage("clearDetails", response.data);
				messageHub.showAlertSuccess("Customer", "Customer successfully updated");
			});
		};

		$scope.cancel = function () {
			messageHub.postMessage("clearDetails");
		};

	}]);