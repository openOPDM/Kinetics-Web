/*global define:  true */
define([
	'underscore',
	'Testing/Views/ScreenViewBase',
	'text!Testing/Templates/CountDownScreen.html',
	'Utils/AudioHelper'
], function (_, ScreenViewBase, templateSource, sound) {
	'use strict';

	return ScreenViewBase.extend({
		events: {
			"click .id-button-stop": "_onStop"
		},

		template: _.template(templateSource),

		initialize: function () {
			// Call base implementation
			ScreenViewBase.prototype.initialize.call(this);
			this.listenTo(this.model, {
				"change:spentSeconds": this._updateTimer
			});
		},

		_updateTimer: function (model, spentSeconds) {
			this.$timer.html(spentSeconds);
			if (spentSeconds == 1) {
				this.$pluralEnds.hide();
			} else {
				this.$pluralEnds.show();
			}
		},

		render: function () {
			// Call base implementation
			ScreenViewBase.prototype.render.call(this);
			this.$timer = this.$(".timer");
			this.$pluralEnds = this.$(".plural-ends");

			return this;
		},

		// Overridden for initial UI update by model attributes
		_onActivated: function () {
			// Call base implementation
			ScreenViewBase.prototype._onActivated.call(this);

			this._updateTimer(this.model, this.model.get("spentSeconds"));
			var timerLabel = $(".timer-label").offset().top,
				activeNav = $(".test-nav-row.active").offset().top;
			//test-nav-row active
			$('html, body').animate({
				scrollTop: timerLabel > activeNav ? activeNav : timerLabel
			}, 1000);

		},

		_onStop: function () {
			this.model.stopPressed();
			sound.pause('test-sound-start');
		}
	});

});
