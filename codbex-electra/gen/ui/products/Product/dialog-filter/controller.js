angular.module('page', ["ideUI", "ideView"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-electra.products.Product';
	}])
	.controller('PageController', ['$scope', 'messageHub', 'ViewParameters', function ($scope, messageHub, ViewParameters) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			if (params?.entity?.DateAvailableFrom) {
				params.entity.DateAvailableFrom = new Date(params.entity.DateAvailableFrom);
			}
			if (params?.entity?.DateAvailableTo) {
				params.entity.DateAvailableTo = new Date(params.entity.DateAvailableTo);
			}
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
			$scope.optionsManufacturer = params.optionsManufacturer;
			$scope.optionsStockStatus = params.optionsStockStatus;
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
			if (entity.Model) {
				filter.$filter.contains.Model = entity.Model;
			}
			if (entity.Manufacturer !== undefined) {
				filter.$filter.equals.Manufacturer = entity.Manufacturer;
			}
			if (entity.Status !== undefined && entity.isStatusIndeterminate === false) {
				filter.$filter.equals.Status = entity.Status;
			}
			if (entity.Quantity !== undefined) {
				filter.$filter.equals.Quantity = entity.Quantity;
			}
			if (entity.Price !== undefined) {
				filter.$filter.equals.Price = entity.Price;
			}
			if (entity.Image) {
				filter.$filter.contains.Image = entity.Image;
			}
			if (entity.SKU) {
				filter.$filter.contains.SKU = entity.SKU;
			}
			if (entity.UPC) {
				filter.$filter.contains.UPC = entity.UPC;
			}
			if (entity.EAN) {
				filter.$filter.contains.EAN = entity.EAN;
			}
			if (entity.JAN) {
				filter.$filter.contains.JAN = entity.JAN;
			}
			if (entity.ISBN) {
				filter.$filter.contains.ISBN = entity.ISBN;
			}
			if (entity.MPN) {
				filter.$filter.contains.MPN = entity.MPN;
			}
			if (entity.DateAvailableFrom) {
				filter.$filter.greaterThanOrEqual.DateAvailable = entity.DateAvailableFrom;
			}
			if (entity.DateAvailableTo) {
				filter.$filter.lessThanOrEqual.DateAvailable = entity.DateAvailableTo;
			}
			if (entity.Weight !== undefined) {
				filter.$filter.equals.Weight = entity.Weight;
			}
			if (entity.Length !== undefined) {
				filter.$filter.equals.Length = entity.Length;
			}
			if (entity.Width !== undefined) {
				filter.$filter.equals.Width = entity.Width;
			}
			if (entity.Height !== undefined) {
				filter.$filter.equals.Height = entity.Height;
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
			if (entity.Points !== undefined) {
				filter.$filter.equals.Points = entity.Points;
			}
			if (entity.Shipping !== undefined && entity.isShippingIndeterminate === false) {
				filter.$filter.equals.Shipping = entity.Shipping;
			}
			if (entity.Location) {
				filter.$filter.contains.Location = entity.Location;
			}
			if (entity.Subtract !== undefined && entity.isSubtractIndeterminate === false) {
				filter.$filter.equals.Subtract = entity.Subtract;
			}
			if (entity.Minimum !== undefined) {
				filter.$filter.equals.Minimum = entity.Minimum;
			}
			if (entity.StockStatus !== undefined) {
				filter.$filter.equals.StockStatus = entity.StockStatus;
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
			messageHub.closeDialogWindow("Product-filter");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);