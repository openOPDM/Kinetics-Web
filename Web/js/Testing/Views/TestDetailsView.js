/*global define:true */
define([
	'underscore',
	'Testing/Views/ScreenViewBase',
	'text!Testing/Templates/TestDetailsScreen.html'
], function (_, ScreenViewBase, templateHtml) {
	'use strict';

	return ScreenViewBase.extend({
		template: _.template(templateHtml),

		events: {
			"click .id-button-continue": "_onSubmit",
			"keypress .customField": "_submitOnEnter"
		},

		render: function () {
			// Call base implementation
			ScreenViewBase.prototype.render.call(this);
			this.$contentContainer = this.$('.content-container');
		},

		// Overridden for initial UI update by model attributes
		_onActivated: function () {
			// Call base implementation
			ScreenViewBase.prototype._onActivated.call(this);

			var customFields = this.model.get('customFields');
			var self = this;

			_.each(customFields.models, function (customFieldModel) {
				self.$contentContainer.append(customFieldModel.getHtml());
			});

			this.$contentContainer.append("<div class='validationErrors'></div>");
		},

		_onSubmit: function () {

			var errorMessages = [],
				inputs = $("input, select", this.$el),
				fn = this._isInvalidInput,
				result = false;

			inputs.each(function (index, input) {
				result = fn(input);
				if (result) {
					errorMessages.push(result);
				}
			});

			if (errorMessages.length === 0) {
				this.model.get('sessionResults').set("extension", this._getCustomFields());
				this.model.continuePressed();
			} else {
				$(".validationErrors", this.$el).empty().append(errorMessages.join("<br/>"));
			}
		},

		_submitOnEnter: function (e) {
			if (e.keyCode === 13) {
				this._onSubmit();
			}

		},

		_isInvalidInput: function (input) {
			if ($(input).attr("required") && ($.trim(input.value) === "" || input.value === "(None)")) {
				return ["Please fill '", input.id, "' field"].join("");
			}
			if ($(input).attr("type") === "number" && isNaN(parseFloat(input.value)) && !isFinite(input.value)) {
				return ["Please type numeric value into '", input.id, "' field"].join("");
			}
		},

		_getCustomFields: function () {
			var results = [];
			$(".customField", this.$el).each(function (index, field) {
				results.push(
					{
						"name": field.id,
						"metaId": $(field).attr("data-field-id"),
						"value": $.trim(field.value)
					}
				);
			});
			return results;
		}

	});
});
