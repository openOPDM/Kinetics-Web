define([
	'Testing/Views/TestEndsScreenViewBase',
	'text!Testing/Templates/TestCanceledScreen.html'
], function (TestEndsScreenViewBase, templateSource) {
	'use strict';

	var TestCanceledScreenView = TestEndsScreenViewBase.extend({
		template: _.template(templateSource)
	});
	return TestCanceledScreenView;
});
