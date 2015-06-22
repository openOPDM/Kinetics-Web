define(['underscore', 'formatter'], function (_) {
	// Represent state machine transitions table
	var StateTransitions = function (startStateName, stateTransitionsTable) {
		this.startStateName = startStateName;
		this.table = stateTransitionsTable;
	};

	_.extend(StateTransitions.prototype, {
		getStateItemByName: function (stateName) {
			var stateItem = _.find(this.table, function (elem) {
				return elem.stateName == stateName;
			});

			if (!stateItem) {
				throw new Error("State '{0}' not found in transition table.".format(stateName));
			}

			return stateItem;
		},

		getTransitionTarget: function (stateItem, signal) {
			var transitionItem = _.find(stateItem.transitions, function (elem) {
				return elem.signal == signal;
			});

			if (!transitionItem) {
				throw new Error("Not found transition for state '{0}' by signal '{1}'."
					.format(stateItem.stateName, signal));
			}

			return transitionItem.stateName;
		}
	});

	return StateTransitions;
});
