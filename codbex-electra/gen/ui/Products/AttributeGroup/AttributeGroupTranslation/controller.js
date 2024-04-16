angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-electra.Products.AttributeGroupTranslation';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-electra/gen/api/Products/AttributeGroupTranslationService.ts";
	}])
	.controller('PageController', ['$scope', '$http', 'messageHub', 'entityApi', 'Extensions', function ($scope, $http, messageHub, entityApi, Extensions) {
		//-----------------Custom Actions-------------------//
		Extensions.get('dialogWindow', 'codbex-electra-custom-action').then(function (response) {
			$scope.pageActions = response.filter(e => e.perspective === "Products" && e.view === "AttributeGroupTranslation" && (e.type === "page" || e.type === undefined));
			$scope.entityActions = response.filter(e => e.perspective === "Products" && e.view === "AttributeGroupTranslation" && e.type === "entity");
		});

		$scope.triggerPageAction = function (action) {
			messageHub.showDialogWindow(
				action.id,
				{},
				null,
				true,
				action
			);
		};

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

		function resetPagination() {
			$scope.dataPage = 1;
			$scope.dataCount = 0;
			$scope.dataLimit = 10;
		}
		resetPagination();

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("codbex-electra.Products.AttributeGroup.entitySelected", function (msg) {
			resetPagination();
			$scope.selectedMainEntityId = msg.data.selectedMainEntityId;
			$scope.loadPage($scope.dataPage);
		}, true);

		messageHub.onDidReceiveMessage("codbex-electra.Products.AttributeGroup.clearDetails", function (msg) {
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
			$scope.loadPage($scope.dataPage, $scope.filter);
		});

		messageHub.onDidReceiveMessage("entityUpdated", function (msg) {
			$scope.loadPage($scope.dataPage, $scope.filter);
		});

		messageHub.onDidReceiveMessage("entitySearch", function (msg) {
			resetPagination();
			$scope.filter = msg.data.filter;
			$scope.filterEntity = msg.data.entity;
			$scope.loadPage($scope.dataPage, $scope.filter);
		});
		//-----------------Events-------------------//

		$scope.loadPage = function (pageNumber, filter) {
			let AttributeGroup = $scope.selectedMainEntityId;
			$scope.dataPage = pageNumber;
			if (!filter && $scope.filter) {
				filter = $scope.filter;
			}
			if (!filter) {
				filter = {};
			}
			if (!filter.$filter) {
				filter.$filter = {};
			}
			if (!filter.$filter.equals) {
				filter.$filter.equals = {};
			}
			filter.$filter.equals.AttributeGroup = AttributeGroup;
			entityApi.count(filter).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("AttributeGroupTranslation", `Unable to count AttributeGroupTranslation: '${response.message}'`);
					return;
				}
				if (response.data) {
					$scope.dataCount = response.data;
				}
				filter.$offset = (pageNumber - 1) * $scope.dataLimit;
				filter.$limit = $scope.dataLimit;
				entityApi.search(filter).then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("AttributeGroupTranslation", `Unable to list/filter AttributeGroupTranslation: '${response.message}'`);
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
			messageHub.showDialogWindow("AttributeGroupTranslation-details", {
				action: "select",
				entity: entity,
				optionsAttributeGroup: $scope.optionsAttributeGroup,
				optionsLanguage: $scope.optionsLanguage,
			});
		};

		$scope.openFilter = function (entity) {
			messageHub.showDialogWindow("AttributeGroupTranslation-filter", {
				entity: $scope.filterEntity,
				optionsAttributeGroup: $scope.optionsAttributeGroup,
				optionsLanguage: $scope.optionsLanguage,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			messageHub.showDialogWindow("AttributeGroupTranslation-details", {
				action: "create",
				entity: {},
				selectedMainEntityKey: "AttributeGroup",
				selectedMainEntityId: $scope.selectedMainEntityId,
				optionsAttributeGroup: $scope.optionsAttributeGroup,
				optionsLanguage: $scope.optionsLanguage,
			}, null, false);
		};

		$scope.updateEntity = function (entity) {
			messageHub.showDialogWindow("AttributeGroupTranslation-details", {
				action: "update",
				entity: entity,
				selectedMainEntityKey: "AttributeGroup",
				selectedMainEntityId: $scope.selectedMainEntityId,
				optionsAttributeGroup: $scope.optionsAttributeGroup,
				optionsLanguage: $scope.optionsLanguage,
			}, null, false);
		};

		$scope.deleteEntity = function (entity) {
			let id = entity.Id;
			messageHub.showDialogAsync(
				'Delete AttributeGroupTranslation?',
				`Are you sure you want to delete AttributeGroupTranslation? This action cannot be undone.`,
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
							messageHub.showAlertError("AttributeGroupTranslation", `Unable to delete AttributeGroupTranslation: '${response.message}'`);
							return;
						}
						$scope.loadPage($scope.dataPage, $scope.filter);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsAttributeGroup = [];
		$scope.optionsLanguage = [];


		$http.get("/services/ts/codbex-electra/gen/api/Products/AttributeGroupService.ts").then(function (response) {
			$scope.optionsAttributeGroup = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/ts/codbex-electra/gen/api/Settings/LanguageService.ts").then(function (response) {
			$scope.optionsLanguage = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$scope.optionsAttributeGroupValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsAttributeGroup.length; i++) {
				if ($scope.optionsAttributeGroup[i].value === optionKey) {
					return $scope.optionsAttributeGroup[i].text;
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
		//----------------Dropdowns-----------------//

	}]);
