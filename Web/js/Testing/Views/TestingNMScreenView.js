/*global define:true */
define([
	'underscore',
	'Testing/Views/TestingScreenViewBase',
	'Testing/Views/CorrectPressesUIUpdater',
	'text!Testing/Templates/TestingNMScreen.html'
], function (_, TestingScreenViewBase, CorrectPressesUIUpdater, templateSource) {
	'use strict';

	return TestingScreenViewBase.extend({
		template: _.template(templateSource),

		initialize: function () {
			TestingScreenViewBase.prototype.initialize.call(this);
			this._correctPressesUpdater = new CorrectPressesUIUpdater();

			this.listenTo(this.model, {
				"change:remainedSeconds": this._updateRemainedSeconds
			});
		},

		_bindToContext: function () {
			TestingScreenViewBase.prototype._bindToContext.call(this);
			this.listenTo(this._testResults, {
				"change:keyPresses": this._updateKeyPresses
			});
		},

		render: function () {
			TestingScreenViewBase.prototype.render.call(this);
			this._correctPressesUpdater.findControls(this.$el);
			this.$remainedSeconds = this.$(".remained-seconds");
			this.$remainedSecondsPluralEnds = this.$(".remained-seconds-plural-ends");
			return this;
		},

		// Overridden for initial UI update by model attributes
		_onActivated: function () {
			// Call base implementation
			TestingScreenViewBase.prototype._onActivated.call(this);

			this._updateRemainedSeconds(this.model, this.model.get("remainedSeconds"));
			this._updateKeyPresses(this._testResults, this._testResults.get("keyPresses"));
		},


		_updateRemainedSeconds: function (model, remainedSeconds) {
			this.$remainedSeconds.html(remainedSeconds);
			if (remainedSeconds == 1) {
				this.$remainedSecondsPluralEnds.hide();
			} else {
				this.$remainedSecondsPluralEnds.show();
			}
		},

		_updateKeyPresses: function (model, keyPresses) {
			this._correctPressesUpdater.updateControls(keyPresses);
		}
	});

});
