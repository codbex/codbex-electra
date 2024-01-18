angular.module('page', ["ideUI", "ideView"])
	.controller('PageController', ['$scope', function ($scope) {

		$scope.entity = {};

		if (window != null && window.frameElement != null && window.frameElement.hasAttribute("data-parameters")) {
			let dataParameters = window.frameElement.getAttribute("data-parameters");
			if (dataParameters) {
				let params = JSON.parse(dataParameters);
				$scope.action = "select";;

				if (params.entity.DateModified) {
					params.entity.DateModified = new Date(params.entity.DateModified);
				}
				$scope.entity = params.entity;
				$scope.optionsStatus = params.optionsStatus;
			}
		}

	}]);