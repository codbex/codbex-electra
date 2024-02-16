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
				if (params?.entity?.CreatedAtFrom) {
					params.entity.CreatedAtFrom = new Date(params.entity.CreatedAtFrom);
				}
				if (params?.entity?.CreatedAtTo) {
					params.entity.CreatedAtTo = new Date(params.entity.CreatedAtTo);
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
			if (entity.CreatedAtFrom) {
				filter.$filter.greaterThanOrEqual.CreatedAt = entity.CreatedAtFrom;
			}
			if (entity.CreatedAtTo) {
				filter.$filter.lessThanOrEqual.CreatedAt = entity.CreatedAtTo;
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