define([
	'backbone',
	'Utils/ConsoleStub',
	'formatter'
], function (Backbone) {
	'use strict';

	var DexterityCalculator = Backbone.Model.extend({
		defaults: {
			sessionResults: null
		},

		initialize: function () {
			this.on("change:sessionResults", this._bindResultsListener);

			// First initialization call of bind method
			if (this.has("sessionResults")) {
				this._bindResultsListener(this, this.get("sessionResults"));
			}
		},

		_bindResultsListener: function (model, sessionResults) {
			var previousSessionResults = this.previous("sessionResults");
			if (previousSessionResults) {
				this.stopListening(previousSessionResults.get("testResultsCollection"));
			}
			if (sessionResults) {
				this.listenTo(sessionResults.get("testResultsCollection"),
					{
						"add remove change:spentTime change:keyPresses": this._calculateTestDexterityScore,
						"reset change:state": this._calculateTotalScore
					});
			}
		},

		_calculateTestDexterityScore: function (testResults) {
			var spentTime = testResults.get("spentTime");
			var keyPresses = testResults.get("keyPresses");

			if (spentTime != null && keyPresses != null) {
				var spentSeconds = spentTime.totalSeconds;
				var score = spentSeconds == 0 ? 0 :
					keyPresses / spentSeconds;

				//console.log("DexterityCalculator keyPresses={0} spentSeconds={1} score={2}".format(keyPresses, spentSeconds, score));

				testResults.set("score", score);
			} else if (testResults.has("score")) {
				testResults.set("score", null);
			}
		},

		_calculateTotalScore: function () {
			var sessionResults = this.get("sessionResults");
			var testResultsCollection = sessionResults.get("testResultsCollection");

			var testScores = testResultsCollection.chain()
				.map(function (testResults) {
					return testResults.get("state") == "passed" ? testResults.get("score") : null;
				}).filter(function (testScore) {
					return testScore != null;
				}).value();

			if (testScores.length > 0) {
				var average = 0;

				if (testScores.length > 0) {
					for (var i = 0; i < testScores.length; i++) {
						average += testScores[i];
					}
					average = average / testScores.length;
				}

				console.log("DexterityCalculator total dexterity score = {0}".format(average));

				sessionResults.set("totalScore", average);
			}
		}
	});
	return DexterityCalculator;
});
