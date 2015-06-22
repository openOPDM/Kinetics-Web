define(['backbone'], function (Backbone) {
	var TestContext = Backbone.Model.extend({
		defaults: {
			results: null,
			properties: null,
			firstTest: false,
			lastTest: false
		}
	});
	return TestContext;
});