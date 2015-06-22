define([
	'backbone',
	'Testing/Models/Constants'
], function (Backbone, Constants) {
	var ScreenViewBase = Backbone.View.extend({
		tagName: "div",
		className: "content-wrapper",
		attributes: {
			id: "keyboard-test"
		},

		_activated: false,

		initialize: function () {
			this.$el.hide();
			this.listenTo(this.model, {
				"state:activating": this._onActivating,
				"state:activated": this._onActivated,
				"state:deactivated": this._onDeactivated
			});
		},

		render: function () {
			// Render only if model is activated
			if (this._activated) {
				this.$el.html(this.template({
					model: this.model.attributes,
					Constants: Constants
				}));
			}
			return this;
		},

		_onActivating: function () {
			if (!this.model.get("aggregator")) {
				this._bindToContext();
			}
			this._activated = true;
			this.render();
		},

		_bindToContext: function () {
			this._testContext = this.model.get("testContext");
			if (!this._testContext) {
				throw new Error("Test context not set.");
			}

			this._testResults = this._testContext.get("results");
			if (!this._testResults) {
				throw new Error("Test results not set.");
			}
		},

		_unbindFromContext: function () {
			this._testResults = null;
			this._testContext = null;
		},

		_onActivated: function () {
			this.$el.show();
		},

		_onDeactivated: function () {
			this._activated = false;

			if (!this.model.get("aggregator")) {
				this._unbindFromContext();
			}

			this.$el.hide();
		}
	});

	return ScreenViewBase;
});
