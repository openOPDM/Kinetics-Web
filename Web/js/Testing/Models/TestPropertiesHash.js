define([
	'Testing/Models/Constants',
	'Testing/Models/TestProperties'
], function (Constants, TestProperties) {
	'use strict';

	// Declare test properties
	// NOTE: Sort index used for sort left panel item in right order or when output results in Test Room.
	// Actual order of test execution determinate by test transition table (see TestTransitionsInstance).
	var testPropertiesHash = {
		rightNMTest: new TestProperties({
			testType: Constants.TestType.NM,
			testHand: Constants.TestHand.Right,
			tag: "Rnm",
			sortIndex: 0,
			name: "Right hand 2-finger (mn) test",
			description: "Press keys 'N' and 'M' keys sequentially by RIGHT hand as quick as you can..."
		}),
		leftNMTest: new TestProperties({
			testType: Constants.TestType.NM,
			testHand: Constants.TestHand.Left,
			tag: "Lnm",
			sortIndex: 1,
			name: "Left hand 2-finger (mn) test",
			description: "Press keys 'N' and 'M' keys sequentially by LEFT hand as quick as you can..."
		}),
		rightPQTest: new TestProperties({
			testType: Constants.TestType.PQ,
			testHand: Constants.TestHand.Right,
			tag: "Rpq",
			sortIndex: 2,
			name: "Right hand 1-finger (pq) test",
			description: "Press keys 'P' and 'Q' keys sequentially by RIGHT hand as quick as you can..."
		}),
		leftPQTest: new TestProperties({
			testType: Constants.TestType.PQ,
			testHand: Constants.TestHand.Left,
			tag: "Lpq",
			sortIndex: 3,
			name: "Left hand 1-finger (pq) test",
			description: "Press keys 'P' and 'Q' keys sequentially by LEFT hand as quick as you can..."
		})
	};
	return testPropertiesHash;
});
