angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-electra.Settings.EntityReference';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-electra/gen/api/Settings/EntityReferenceService.ts";
	}])
	.controller('PageController', ['$scope', 'messageHub', 'entityApi', function ($scope, messageHub, entityApi) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};

		if (window != null && window.frameElement != null && window.frameElement.hasAttribute("data-parameters")) {
			let dataParameters = window.frameElement.getAttribute("data-parameters");
			if (dataParameters) {
				let params = JSON.parse(dataParameters);
				$scope.entity = params.entity ?? {};
				$scope.selectedMainEntityKey = params.selectedMainEntityKey;
				$scope.selectedMainEntityId = params.selectedMainEntityId;
			}
		}

		$scope.filter = function () {
			let entity = $scope.entity;
			const filter = {
				$filter: {
					equals: {
					},
					notEquals: {
					},
					contains: {
					},
					greaterThan: {
					},
					greaterThanOrEqual: {
					},
					lessThan: {
					},
					lessThanOrEqual: {
					}
				},
			};
			if (entity.Id) {
				filter.$filter.equals.Id = entity.Id;
			}
			if (entity.EntityName) {
				filter.$filter.contains.EntityName = entity.EntityName;
			}
			if (entity.EntityIntegerId) {
				filter.$filter.equals.EntityIntegerId = entity.EntityIntegerId;
			}
			if (entity.EntityStringId) {
				filter.$filter.contains.EntityStringId = entity.EntityStringId;
			}
			if (entity.ReferenceIntegerId) {
				filter.$filter.equals.ReferenceIntegerId = entity.ReferenceIntegerId;
			}
			if (entity.ReferenceStringId) {
				filter.$filter.contains.ReferenceStringId = entity.ReferenceStringId;
			}
			if (entity.ScopeIntegerId) {
				filter.$filter.equals.ScopeIntegerId = entity.ScopeIntegerId;
			}
			if (entity.ScopeStringId) {
				filter.$filter.contains.ScopeStringId = entity.ScopeStringId;
			}
			messageHub.postMessage("entitySearch", {
				entity: entity,
				filter: filter
			});
			$scope.cancel();
		};

		$scope.resetFilter = function () {
			$scope.entity = {};
			$scope.filter();
		};

		$scope.cancel = function () {
			messageHub.closeDialogWindow("EntityReference-filter");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);