define([
	'Testing/Views/TestingScreenViewBase',
	'Testing/Views/SpentTimeUIUpdater',
	'text!Testing/Templates/TestingPQScreen.html'
], function (TestingScreenViewBase, SpentTimeUIUpdater, templateSource) {
	'use strict';

	var TestingPQScreenView = TestingScreenViewBase.extend({
		template: _.template(templateSource),

		initialize: function () {
			TestingScreenViewBase.prototype.initialize.call(this);
			this._spentTimeUpdater = new SpentTimeUIUpdater();

			this.listenTo(this.model, {
				"change:remainedPresses": this._updateRemainedPresses
			});
		},

		_bindToContext: function () {
			TestingScreenViewBase.prototype._bindToContext.call(this);
			this.listenTo(this._testResults, {
				"change:spentTime": this._updateSpentTime
			});
		},

		render: function () {
			TestingScreenViewBase.prototype.render.call(this);
			this._spentTimeUpdater.findControls(this.$el);
			this.$remainedPresses = this.$(".remained-presses");
			this.$remainedPressesPluralEnds = this.$(".remained-presses-plural-ends");
			return this;
		},

		// Overridden for initial UI update by model attributes
		_onActivated: function () {
			// Call base implementation
			TestingScreenViewBase.prototype._onActivated.call(this);

			this._updateRemainedPresses(this.model, this.model.get("remainedPresses"));
			this._updateSpentTime(this._testResults, this._testResults.get("spentTime"));
		},

		_updateRemainedPresses: function (model, remainedPresses) {
			this.$remainedPresses.html(remainedPresses);
			if (remainedPresses == 1) {
				this.$remainedPressesPluralEnds.hide();
			} else {
				this.$remainedPressesPluralEnds.show();
			}
		},

		_updateSpentTime: function (model, spentTime) {
			this._spentTimeUpdater.updateControls(spentTime);
		}
	});

	return TestingPQScreenView;
});
