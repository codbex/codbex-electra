angular.module('page', ["ideUI", "ideView"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-electra.entity-references.EntityReference';
	}])
	.controller('PageController', ['$scope', 'messageHub', 'ViewParameters', function ($scope, messageHub, ViewParameters) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			$scope.entity = params.entity ?? {};
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
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
			if (entity.Id !== undefined) {
				filter.$filter.equals.Id = entity.Id;
			}
			if (entity.EntityName) {
				filter.$filter.contains.EntityName = entity.EntityName;
			}
			if (entity.EntityIntegerId !== undefined) {
				filter.$filter.equals.EntityIntegerId = entity.EntityIntegerId;
			}
			if (entity.EntityStringId) {
				filter.$filter.contains.EntityStringId = entity.EntityStringId;
			}
			if (entity.ReferenceIntegerId !== undefined) {
				filter.$filter.equals.ReferenceIntegerId = entity.ReferenceIntegerId;
			}
			if (entity.ReferenceStringId) {
				filter.$filter.contains.ReferenceStringId = entity.ReferenceStringId;
			}
			if (entity.ScopeIntegerId !== undefined) {
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