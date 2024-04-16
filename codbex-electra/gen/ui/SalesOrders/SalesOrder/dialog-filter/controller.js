angular.module('page', ["ideUI", "ideView"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-electra.SalesOrders.SalesOrder';
	}])
	.controller('PageController', ['$scope', 'messageHub', 'ViewParameters', function ($scope, messageHub, ViewParameters) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
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
			$scope.optionsStore = params.optionsStore;
			$scope.optionsStatus = params.optionsStatus;
			$scope.optionsCurrency = params.optionsCurrency;
			$scope.optionsCustomer = params.optionsCustomer;
			$scope.optionsLanguage = params.optionsLanguage;
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
			if (entity.Number) {
				filter.$filter.contains.Number = entity.Number;
			}
			if (entity.Store) {
				filter.$filter.equals.Store = entity.Store;
			}
			if (entity.Status) {
				filter.$filter.equals.Status = entity.Status;
			}
			if (entity.Total) {
				filter.$filter.equals.Total = entity.Total;
			}
			if (entity.Currency) {
				filter.$filter.equals.Currency = entity.Currency;
			}
			if (entity.Customer) {
				filter.$filter.equals.Customer = entity.Customer;
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
			if (entity.UpdatedBy) {
				filter.$filter.contains.UpdatedBy = entity.UpdatedBy;
			}
			if (entity.Tracking) {
				filter.$filter.contains.Tracking = entity.Tracking;
			}
			if (entity.Comment) {
				filter.$filter.contains.Comment = entity.Comment;
			}
			if (entity.InvoiceNumber) {
				filter.$filter.equals.InvoiceNumber = entity.InvoiceNumber;
			}
			if (entity.InvoicePrefix) {
				filter.$filter.contains.InvoicePrefix = entity.InvoicePrefix;
			}
			if (entity.Language) {
				filter.$filter.equals.Language = entity.Language;
			}
			messageHub.postMessage("entitySearch", {
				entity: entity,
				filter: filter
			});
			messageHub.postMessage("clearDetails");
			$scope.cancel();
		};

		$scope.resetFilter = function () {
			$scope.entity = {};
			$scope.filter();
		};

		$scope.cancel = function () {
			messageHub.closeDialogWindow("SalesOrder-filter");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);