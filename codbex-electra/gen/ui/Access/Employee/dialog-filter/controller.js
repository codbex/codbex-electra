angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-electra.Access.Employee';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-electra/gen/api/Access/EmployeeService.ts";
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
				if (params?.entity?.DateModifiedFrom) {
					params.entity.DateModifiedFrom = new Date(params.entity.DateModifiedFrom);
				}
				if (params?.entity?.DateModifiedTo) {
					params.entity.DateModifiedTo = new Date(params.entity.DateModifiedTo);
				}
				$scope.entity = params.entity ?? {};
				$scope.selectedMainEntityKey = params.selectedMainEntityKey;
				$scope.selectedMainEntityId = params.selectedMainEntityId;
				$scope.optionsStatus = params.optionsStatus;
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
			if (entity.FirstName) {
				filter.$filter.contains.FirstName = entity.FirstName;
			}
			if (entity.LastName) {
				filter.$filter.contains.LastName = entity.LastName;
			}
			if (entity.Email) {
				filter.$filter.contains.Email = entity.Email;
			}
			if (entity.Status) {
				filter.$filter.equals.Status = entity.Status;
			}
			if (entity.Image) {
				filter.$filter.contains.Image = entity.Image;
			}
			if (entity.Code) {
				filter.$filter.contains.Code = entity.Code;
			}
			if (entity.UpdatedBy) {
				filter.$filter.contains.UpdatedBy = entity.UpdatedBy;
			}
			if (entity.DateModifiedFrom) {
				filter.$filter.greaterThanOrEqual.DateModified = entity.DateModifiedFrom;
			}
			if (entity.DateModifiedTo) {
				filter.$filter.lessThanOrEqual.DateModified = entity.DateModifiedTo;
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
			messageHub.closeDialogWindow("Employee-filter");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);