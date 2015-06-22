/*global define:true */
define([
	'Testing/Models/TestScreens/TestScreenInstances',
	'Testing/Views/StartScreenView',
	'Testing/Views/CountdownScreenView',
	'Testing/Views/TestingNMScreenView',
	'Testing/Views/TestingPQScreenView',
	'Testing/Views/TestPassedScreenView',
	'Testing/Views/TestCanceledScreenView',
	'Testing/Views/SummaryScreenView',
	'Testing/Views/TestDetailsView'
], function (screens, StartScreenView, CountdownScreenView, TestingNMScreenView, TestingPQScreenView, TestPassedScreenView, TestCanceledScreenView, SummaryScreenView, TestDetailsView) {
	'use strict';

	return {
		createViews: function (options) {
			return [
				new StartScreenView({ model: screens.startScreen, accountManager: options.accountManager}),
				new CountdownScreenView({ model: screens.countdownScreen }),
				new TestingNMScreenView({ model: screens.testingNMScreen }),
				new TestingPQScreenView({ model: screens.testingPQScreen }),
				new TestPassedScreenView({ model: screens.testPassedScreen }),
				new TestCanceledScreenView({ model: screens.testCanceledScreen }),
				new SummaryScreenView({ model: screens.summaryScreen }),
				new TestDetailsView({ model: screens.testDetailsScreen })
			];
		}
	};

});