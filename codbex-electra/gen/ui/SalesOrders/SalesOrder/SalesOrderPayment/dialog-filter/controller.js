angular.module('page', ["ideUI", "ideView"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-electra.SalesOrders.SalesOrderPayment';
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
			$scope.optionsZone = params.optionsZone;
			$scope.optionsCountry = params.optionsCountry;
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
			if (entity.Zone) {
				filter.$filter.equals.Zone = entity.Zone;
			}
			if (entity.FirstName) {
				filter.$filter.contains.FirstName = entity.FirstName;
			}
			if (entity.LastName) {
				filter.$filter.contains.LastName = entity.LastName;
			}
			if (entity.Company) {
				filter.$filter.contains.Company = entity.Company;
			}
			if (entity.Address1) {
				filter.$filter.contains.Address1 = entity.Address1;
			}
			if (entity.Address2) {
				filter.$filter.contains.Address2 = entity.Address2;
			}
			if (entity.Country) {
				filter.$filter.equals.Country = entity.Country;
			}
			if (entity.City) {
				filter.$filter.contains.City = entity.City;
			}
			if (entity.Postcode) {
				filter.$filter.contains.Postcode = entity.Postcode;
			}
			if (entity.Method) {
				filter.$filter.contains.Method = entity.Method;
			}
			if (entity.Code) {
				filter.$filter.contains.Code = entity.Code;
			}
			if (entity.AddressFormat) {
				filter.$filter.contains.AddressFormat = entity.AddressFormat;
			}
			if (entity.CustomField) {
				filter.$filter.contains.CustomField = entity.CustomField;
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
			messageHub.closeDialogWindow("SalesOrderPayment-filter");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);