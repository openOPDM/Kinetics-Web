define([
	'backbone',
	'Utils/TimerManager'
], function (Backbone, TimerManager) {
	'use strict';

	var CountdownTimer = Backbone.Model.extend({
		defaults: {
			remainedSeconds: null
		},

		initialize: function () {
			var remainedSeconds = this.get("remainedSeconds");
			if (!remainedSeconds && remainedSeconds <= 0) {
				throw new Error("Invalid 'remainedSeconds' value.");
			}
			this._timer = new TimerManager(this._tick.bind(this), 1000);
		},

		start: function () {
			this._timer.startTimer();
		},

		stop: function () {
			this._timer.stopTimer();
			this.trigger("complete");
		},

		_tick: function () {
			var remainedSeconds = this.get("remainedSeconds");
			this.set("remainedSeconds", --remainedSeconds);
			if (remainedSeconds <= 0) this.stop();
		}
	});

	return CountdownTimer;
});
