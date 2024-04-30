angular.module('page', ["ideUI", "ideView"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-electra.customers.Customer';
	}])
	.controller('PageController', ['$scope', 'Extensions', 'messageHub', function ($scope, Extensions, messageHub) {

		$scope.entity = {};

		//-----------------Custom Actions-------------------//
		Extensions.get('dialogWindow', 'codbex-electra-custom-action').then(function (response) {
			$scope.entityActions = response.filter(e => e.perspective === "customers" && e.view === "Customer" && e.type === "entity");
		});

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

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("clearDetails", function (msg) {
			$scope.$apply(function () {
				$scope.entity = {};
				$scope.optionsStore = [];
				$scope.optionsStatus = [];
				$scope.optionsLanguage = [];
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
			});
		});

		//-----------------Events-------------------//

		$scope.cancel = function () {
			messageHub.postMessage("clearDetails");
		};

	}]);