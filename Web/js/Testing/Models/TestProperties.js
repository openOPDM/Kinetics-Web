define(['backbone'], function (Backbone) {
	'use strict';

	var TestProperties = Backbone.Model.extend({
		defaults: {
			testType: null,
			secondsForCountdown: 3,
			nmTestTimeout: 30,
			pqTestCountOfExpectedCorrectPresses: 20
		}
	});
	return TestProperties;
});