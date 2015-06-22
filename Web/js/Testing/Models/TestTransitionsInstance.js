/*global define:true */
define([
	'Testing/Models/StateTransitions',
	'Testing/Models/TestInstances',
	'Testing/Models/TestScreens/TestScreenInstances'
], function (StateTransitions, tests, screens) {
	'use strict';

	// Declare test session transitions table
	// Sequence of test:
	//  - Right hand n-m
	//  - Left hand n-m
	//  - Right hand p-q
	//  - Left hand p-q
	// First and last tests will be detected and marked by TestSession object
	// on the ground of they definition order in transition table.
	return function (detailsScreenRequired) {

		var stateTransitionsTable = [
			{
				stateName: "testDetails",
				state: screens.testDetailsScreen,
				transitions: [
					{ signal: "next", stateName: "rightNMTest" }
				]
			},
			{
				stateName: "rightNMTest",
				state: tests.rightNMTest,
				transitions: [
					{ signal: "next", stateName: "leftNMTest" }
				]
			},
			{
				stateName: "leftNMTest",
				state: tests.leftNMTest,
				transitions: [
					{ signal: "back", stateName: "rightNMTest" },
					{ signal: "next", stateName: "rightPQTest" }
				]
			},
			{
				stateName: "rightPQTest",
				state: tests.rightPQTest,
				transitions: [
					{ signal: "back", stateName: "leftNMTest" },
					{ signal: "next", stateName: "leftPQTest" }
				]
			},
			{
				stateName: "leftPQTest",
				state: tests.leftPQTest,
				transitions: [
					{ signal: "back", stateName: "rightPQTest" },
					{ signal: "next", stateName: "summary" }
				]
			},
			{
				stateName: "summary",
				state: screens.summaryScreen,
				transitions: [
					{ signal: "back", stateName: "leftPQTest" }
				]
			}
		];

		if (!detailsScreenRequired) {
			stateTransitionsTable.shift();
		}

		return new StateTransitions(stateTransitionsTable[0].stateName, stateTransitionsTable);
	};



});
