angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-electra.Products.ProductAttribute';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/js/codbex-electra/gen/api/Products/ProductAttribute.js";
	}])
	.controller('PageController', ['$scope', '$http', 'messageHub', 'entityApi', function ($scope, $http, messageHub, entityApi) {

		//-----------------Custom Actions-------------------//
		$http.get("/services/js/resources-core/services/custom-actions.js?extensionPoint=codbex-electra-custom-action").then(function (response) {
			$scope.pageActions = response.data.filter(e => e.perspective === "Products" && e.view === "ProductAttribute" && (e.type === "page" || e.type === undefined));
			$scope.entityActions = response.data.filter(e => e.perspective === "Products" && e.view === "ProductAttribute" && e.type === "entity");
		});

		$scope.triggerPageAction = function (actionId) {
			for (const next of $scope.pageActions) {
				if (next.id === actionId) {
					messageHub.showDialogWindow("codbex-electra-custom-action", {
						src: next.link,
					});
					break;
				}
			}
		};

		$scope.triggerEntityAction = function (actionId, selectedEntity) {
			for (const next of $scope.entityActions) {
				if (next.id === actionId) {
					messageHub.showDialogWindow("codbex-electra-custom-action", {
						src: `${next.link}?id=${selectedEntity.Id}`,
					});
					break;
				}
			}
		};
		//-----------------Custom Actions-------------------//

		function resetPagination() {
			$scope.dataPage = 1;
			$scope.dataCount = 0;
			$scope.dataLimit = 10;
		}
		resetPagination();

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("codbex-electra.Products.Product.entitySelected", function (msg) {
			resetPagination();
			$scope.selectedMainEntityId = msg.data.selectedMainEntityId;
			$scope.loadPage($scope.dataPage);
		}, true);

		messageHub.onDidReceiveMessage("codbex-electra.Products.Product.clearDetails", function (msg) {
			$scope.$apply(function () {
				resetPagination();
				$scope.selectedMainEntityId = null;
				$scope.data = null;
			});
		}, true);

		messageHub.onDidReceiveMessage("clearDetails", function (msg) {
			$scope.$apply(function () {
				$scope.entity = {};
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("entityCreated", function (msg) {
			$scope.loadPage($scope.dataPage);
		});

		messageHub.onDidReceiveMessage("entityUpdated", function (msg) {
			$scope.loadPage($scope.dataPage);
		});
		//-----------------Events-------------------//

		$scope.loadPage = function (pageNumber) {
			let Product = $scope.selectedMainEntityId;
			$scope.dataPage = pageNumber;
			entityApi.count(Product).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("ProductAttribute", `Unable to count ProductAttribute: '${response.message}'`);
					return;
				}
				$scope.dataCount = response.data;
				let query = `Product=${Product}`;
				let offset = (pageNumber - 1) * $scope.dataLimit;
				let limit = $scope.dataLimit;
				entityApi.filter(query, offset, limit).then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("ProductAttribute", `Unable to list ProductAttribute: '${response.message}'`);
						return;
					}
					$scope.data = response.data;
				});
			});
		};

		$scope.selectEntity = function (entity) {
			$scope.selectedEntity = entity;
		};

		$scope.openDetails = function (entity) {
			$scope.selectedEntity = entity;
			messageHub.showDialogWindow("ProductAttribute-details", {
				action: "select",
				entity: entity,
				optionsName: $scope.optionsName,
				optionsLanguage: $scope.optionsLanguage,
				optionsProduct: $scope.optionsProduct,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			messageHub.showDialogWindow("ProductAttribute-details", {
				action: "create",
				entity: {},
				selectedMainEntityKey: "Product",
				selectedMainEntityId: $scope.selectedMainEntityId,
				optionsName: $scope.optionsName,
				optionsLanguage: $scope.optionsLanguage,
				optionsProduct: $scope.optionsProduct,
			}, null, false);
		};

		$scope.updateEntity = function (entity) {
			messageHub.showDialogWindow("ProductAttribute-details", {
				action: "update",
				entity: entity,
				selectedMainEntityKey: "Product",
				selectedMainEntityId: $scope.selectedMainEntityId,
				optionsName: $scope.optionsName,
				optionsLanguage: $scope.optionsLanguage,
				optionsProduct: $scope.optionsProduct,
			}, null, false);
		};

		$scope.deleteEntity = function (entity) {
			let id = entity.Id;
			messageHub.showDialogAsync(
				'Delete ProductAttribute?',
				`Are you sure you want to delete ProductAttribute? This action cannot be undone.`,
				[{
					id: "delete-btn-yes",
					type: "emphasized",
					label: "Yes",
				},
				{
					id: "delete-btn-no",
					type: "normal",
					label: "No",
				}],
			).then(function (msg) {
				if (msg.data === "delete-btn-yes") {
					entityApi.delete(id).then(function (response) {
						if (response.status != 204) {
							messageHub.showAlertError("ProductAttribute", `Unable to delete ProductAttribute: '${response.message}'`);
							return;
						}
						$scope.loadPage($scope.dataPage);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsName = [];
		$scope.optionsLanguage = [];
		$scope.optionsProduct = [];

		$http.get("/services/js/codbex-electra/gen/api/Products/AttributeDescription.js").then(function (response) {
			$scope.optionsName = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/js/codbex-electra/gen/api/Settings/Language.js").then(function (response) {
			$scope.optionsLanguage = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/js/codbex-electra/gen/api/Products/Product.js").then(function (response) {
			$scope.optionsProduct = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Model
				}
			});
		});
		$scope.optionsNameValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsName.length; i++) {
				if ($scope.optionsName[i].value === optionKey) {
					return $scope.optionsName[i].text;
				}
			}
			return null;
		};
		$scope.optionsLanguageValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsLanguage.length; i++) {
				if ($scope.optionsLanguage[i].value === optionKey) {
					return $scope.optionsLanguage[i].text;
				}
			}
			return null;
		};
		$scope.optionsProductValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsProduct.length; i++) {
				if ($scope.optionsProduct[i].value === optionKey) {
					return $scope.optionsProduct[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	}]);
