define(['backbone'], function (Backbone) {
	// Base class for test screen model.
	var ScreenBase = Backbone.Model.extend({
		activate: function () {
			this._checkContext();
		},

		_checkContext: function () {
			this._testContext = this.get("testContext");
			if (!this._testContext) {
				throw new Error("Test context not specified.");
			}

			this._testProperties = this._testContext.get("properties");
			if (!this._testProperties) {
				throw new Error("Test properties not specified.");
			}
		},

		deactivate: function () {
			this._testContext = null;
			this._testProperties = null;
		}
	});
	return ScreenBase;
});

