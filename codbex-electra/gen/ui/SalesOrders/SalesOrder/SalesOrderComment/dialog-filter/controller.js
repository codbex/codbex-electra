angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-electra.SalesOrders.SalesOrderComment';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-electra/gen/api/SalesOrders/SalesOrderCommentService.ts";
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
				if (params?.entity?.DateAddedFrom) {
					params.entity.DateAddedFrom = new Date(params.entity.DateAddedFrom);
				}
				if (params?.entity?.DateAddedTo) {
					params.entity.DateAddedTo = new Date(params.entity.DateAddedTo);
				}
				if (params?.entity?.DateModifiedFrom) {
					params.entity.DateModifiedFrom = new Date(params.entity.DateModifiedFrom);
				}
				if (params?.entity?.DateModifiedTo) {
					params.entity.DateModifiedTo = new Date(params.entity.DateModifiedTo);
				}
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
			if (entity.Text) {
				filter.$filter.contains.Text = entity.Text;
			}
			if (entity.CreatedBy) {
				filter.$filter.contains.CreatedBy = entity.CreatedBy;
			}
			if (entity.UpdatedBy) {
				filter.$filter.contains.UpdatedBy = entity.UpdatedBy;
			}
			if (entity.DateAddedFrom) {
				filter.$filter.greaterThanOrEqual.DateAdded = entity.DateAddedFrom;
			}
			if (entity.DateAddedTo) {
				filter.$filter.lessThanOrEqual.DateAdded = entity.DateAddedTo;
			}
			if (entity.DateModifiedFrom) {
				filter.$filter.greaterThanOrEqual.DateModified = entity.DateModifiedFrom;
			}
			if (entity.DateModifiedTo) {
				filter.$filter.lessThanOrEqual.DateModified = entity.DateModifiedTo;
			}
			if (entity.SalesOrder) {
				filter.$filter.equals.SalesOrder = entity.SalesOrder;
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
			messageHub.closeDialogWindow("SalesOrderComment-filter");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);