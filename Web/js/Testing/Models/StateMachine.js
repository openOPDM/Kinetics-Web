define([
	'backbone',
	'Utils/ConsoleStub',
	'formatter'
], function (Backbone) {
	// Represent state machine for implement test sequence and sequence of test screens.
	// Generate events:
	//  - state:deactivate(oldStateItem)
	//  - change:currentStateItem
	//  - state:activate(newStateItem)
	//  - translate out_signal:<signal_name> from state objects
	var StateMachine = Backbone.Model.extend({
			defaults: {
				currentStateItem: null
			},

			initialize: function (attributes, options, screenTransitions) {
				this.screenTransitions = screenTransitions;
				this._isStarted = false;
			},

			isStarted: function () {
				return this._isStarted;
			},

			// Start state machine.
			// If reset is true then activate first state otherwise
			// activate last state had been gotten in last stop() call or
			// activate first state if it's first start of state machine.
			start: function (reset) {
				if (this.isStarted()) {
					throw new Error("State machine already started.");
				}

				// Set start flag
				this._isStarted = true;

				//console.log("StateMachine.start()");

				var currentStateItem = this.get("currentStateItem");

				if (reset || !currentStateItem) {
					var stateItem = this.screenTransitions.getStateItemByName(this.screenTransitions.startStateName);
					this._activateState(stateItem);
				} else {
					// Activate current state
					this._activateState(currentStateItem);
				}
			},

			// Stop state machine.
			// Deactivate current state and set it to null
			stop: function () {
				if (!this._isStarted) {
					throw new Error("State machine already stoped.");
				}

				// Reset start flag
				this._isStarted = false;

				var currentStateItem = this.get("currentStateItem");
				if (currentStateItem) {
					this._deactivateState(currentStateItem);
				}

				//console.log("StateMachine.stop()");
			},

			// Deactivate the state logic representation
			_deactivateState: function (stateItem) {
				if (stateItem.state.deactivate) {
					stateItem.state.deactivate();
				}

				this.stopListening(stateItem.state);

				stateItem.state.trigger("state:deactivated");
				this.trigger("state:deactivated", stateItem);
			},

			_activateState: function (stateItem) {
				this.listenTo(stateItem.state, "all", this._onStateEvent);

				this.set("currentStateItem", stateItem);

				stateItem.state.trigger("state:activating");
				this.trigger("state:activating", stateItem);

				if (stateItem.state.activate) {
					stateItem.state.activate();
				}

				stateItem.state.trigger("state:activated");
				this.trigger("state:activated", stateItem);
			},

			_switchToState: function (stateItem) {
				//console.log("StateMachine._switchToState('{0}')".format(stateItem.stateName));

				var currentStateItem = this.get("currentStateItem");
				if (currentStateItem) {
					this._deactivateState(currentStateItem);
				}
				this._activateState(stateItem);
			},

			_onStateEvent: function (eventName) {
				var splitName = eventName.split(":");

				//console.log("StateMachine._onStateEvent('{0}')".format(eventName));

				if (splitName.length > 1) {
					var category = splitName[0];
					var signal = splitName[1];

					switch (category) {
					case "signal":
						var currentStateItem = this.get("currentStateItem");
						var stateName = this.screenTransitions.getTransitionTarget(currentStateItem, signal);
						var stateItem = this.screenTransitions.getStateItemByName(stateName);
						if (stateItem.stateName != currentStateItem.stateName) {
							this._switchToState(stateItem);
						}
						break;

					case "out_signal":
						// Retransmits event
						this.trigger(eventName);
						break;
					}
				}
			}
		}
	);
	return StateMachine;
});
