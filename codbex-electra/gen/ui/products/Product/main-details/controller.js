angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-electra.products.Product';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-electra/gen/api/products/ProductService.ts";
	}])
	.controller('PageController', ['$scope', 'Extensions', 'messageHub', 'entityApi', function ($scope, Extensions, messageHub, entityApi) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: "Product Details",
			create: "Create Product",
			update: "Update Product"
		};
		$scope.action = 'select';

		//-----------------Custom Actions-------------------//
		Extensions.get('dialogWindow', 'codbex-electra-custom-action').then(function (response) {
			$scope.entityActions = response.filter(e => e.perspective === "products" && e.view === "Product" && e.type === "entity");
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
				$scope.optionsManufacturer = [];
				$scope.optionsStockStatus = [];
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("entitySelected", function (msg) {
			$scope.$apply(function () {
				if (msg.data.entity.DateAvailable) {
					msg.data.entity.DateAvailable = new Date(msg.data.entity.DateAvailable);
				}
				if (msg.data.entity.DateAdded) {
					msg.data.entity.DateAdded = new Date(msg.data.entity.DateAdded);
				}
				if (msg.data.entity.DateModified) {
					msg.data.entity.DateModified = new Date(msg.data.entity.DateModified);
				}
				$scope.entity = msg.data.entity;
				$scope.optionsManufacturer = msg.data.optionsManufacturer;
				$scope.optionsStockStatus = msg.data.optionsStockStatus;
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("createEntity", function (msg) {
			$scope.$apply(function () {
				$scope.entity = {};
				$scope.optionsManufacturer = msg.data.optionsManufacturer;
				$scope.optionsStockStatus = msg.data.optionsStockStatus;
				$scope.action = 'create';
			});
		});

		messageHub.onDidReceiveMessage("updateEntity", function (msg) {
			$scope.$apply(function () {
				if (msg.data.entity.DateAvailable) {
					msg.data.entity.DateAvailable = new Date(msg.data.entity.DateAvailable);
				}
				if (msg.data.entity.DateAdded) {
					msg.data.entity.DateAdded = new Date(msg.data.entity.DateAdded);
				}
				if (msg.data.entity.DateModified) {
					msg.data.entity.DateModified = new Date(msg.data.entity.DateModified);
				}
				$scope.entity = msg.data.entity;
				$scope.optionsManufacturer = msg.data.optionsManufacturer;
				$scope.optionsStockStatus = msg.data.optionsStockStatus;
				$scope.action = 'update';
			});
		});
		//-----------------Events-------------------//

		$scope.create = function () {
			entityApi.create($scope.entity).then(function (response) {
				if (response.status != 201) {
					messageHub.showAlertError("Product", `Unable to create Product: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityCreated", response.data);
				messageHub.postMessage("clearDetails", response.data);
				messageHub.showAlertSuccess("Product", "Product successfully created");
			});
		};

		$scope.update = function () {
			entityApi.update($scope.entity.Id, $scope.entity).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("Product", `Unable to update Product: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityUpdated", response.data);
				messageHub.postMessage("clearDetails", response.data);
				messageHub.showAlertSuccess("Product", "Product successfully updated");
			});
		};

		$scope.cancel = function () {
			messageHub.postMessage("clearDetails");
		};

	}]);