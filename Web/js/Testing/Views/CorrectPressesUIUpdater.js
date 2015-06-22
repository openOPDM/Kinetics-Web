define([
	'underscore'
], function (_) {
	"use strict";
	var CorrectPressesUIUpdater = function () {
	};
	_.extend(CorrectPressesUIUpdater.prototype, {
		findControls: function ($el) {
			this.$correctPresses = $el.find(".correct-presses");
			this.$correctPressesPluralEnds = $el.find(".correct-presses-plural-ends");
		},
		updateControls: function (correctPresses) {
			this.$correctPresses.html(correctPresses);
			if (correctPresses == 1) {
				this.$correctPressesPluralEnds.hide();
			} else {
				this.$correctPressesPluralEnds.show();
			}
		}
	});

	return CorrectPressesUIUpdater;
});
