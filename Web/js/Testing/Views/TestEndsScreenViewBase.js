define([
	'Testing/Views/ScreenViewBase'
], function (ScreenViewBase) {
	'use strict';

	var TestEndsScreenViewBase = ScreenViewBase.extend({
		events: {
			"click .id-button-back": "_onBack",
			"click .id-button-repeat": "_onRepeat",
			"click .id-button-next": "_onNext"
		},

		render: function () {
			ScreenViewBase.prototype.render.call(this);

			// Hide Back button for first test
			if (this._testContext) {
				if (this._testContext.get("firstTest")) {
					this.$(".id-button-back").addClass('hidden');
				}
			}
		},

		_onBack: function () {
			this.model.backPressed();
		},

		_onRepeat: function () {
			this.model.repeatPressed();
		},

		_onNext: function () {
			this.model.nextPressed();
		}
	});

	return TestEndsScreenViewBase;
});
