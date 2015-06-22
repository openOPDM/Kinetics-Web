/*global define:true */
define([
	'Testing/Views/ScreenViewBase',
	'Utils/KeyboardListener',
	'jQuery.ui'
], function (ScreenViewBase, KeyboardListener) {
	'use strict';

	return ScreenViewBase.extend({
		events: {
			"click .id-button-stop": "_onStop"
		},

		initialize: function () {
			ScreenViewBase.prototype.initialize.call(this);

			this.listenTo(this.model, {
				"change:percentsDone": this._updateProgressbar
			});

			this._keyboardListener = new KeyboardListener();
			this.listenTo(this._keyboardListener, "keyup", this._onKeyUp);
			this.listenTo(this._keyboardListener, "keydown", this._onKeyDown);
		},

		_updateProgressbar: function (model, percentsDone) {
			this.$progressbar.progressbar({ value: percentsDone });
		},

		render: function () {
			ScreenViewBase.prototype.render.call(this);
			this.$progressbar = this.$(".progressbar");

			return this;
		},

		_unbindFromContext: function () {
			if (!this._testResults) {
				throw new Error("Assertion failed.");
			}
			this.listenTo(this._testResults);
		},

		_onActivated: function () {
			ScreenViewBase.prototype._onActivated.call(this);

			// Initial UI update by model attributes
			this._updateProgressbar(this.model, this.model.get("percentsDone"));

			this._keyboardListener.start();
		},

		_onDeactivated: function () {
			this._keyboardListener.stop();
			ScreenViewBase.prototype._onDeactivated.call(this);
		},

		_onStop: function () {
			this.model.stopPressed();
		},

		_onKeyUp: function (keyName/*, keyPressed*/) {
			this.model.keyUp(keyName);
		},

		_onKeyDown: function (keyName/*, keyPressed*/) {
			this.model.keyDown(keyName);
		}
	});

});
