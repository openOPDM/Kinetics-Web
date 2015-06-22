/*global define:true */
define([
	'jQuery',
	'underscore',
	'backbone',
	'Views/Constants',
	'Models/Constants',
	'Models/Extension',
	'Models/ErrorConstants',
	'Utils/Dialog',
	'text!Templates/TestCustomFields.html',
	'jQuery.placeholder',
	'formatter'
], function ($, _, Backbone, Constants, ModelsConstants, Extension, ErrorConstants, Dialog, templateHtml) {
	'use strict';

	return Backbone.View.extend({
		tagName: "div",
		className: "content-wrapper test-custom-fields",
		template: _.template(templateHtml),

		events: {
			"click .id-add-new-question": "_triggerViews",
			"click .id-cancel-adding": "_onCancel",
			"click .id-save-new-question": "_createField",
			"keydown #question-label": "_createFieldOnEnter",
			"click .remove-custom-field": "_removeField",
			"click .editable-label-id": "_editLabel",
			"click .editable-options-id": "_editList",
			"change .required-checkbox": "_saveRequired"
		},

		initialize: function (params) {
			var that = this;
			this.accountManager = params.accountManager;
			this.dialog = new Dialog();
			this.listenTo(this.dialog, {
				'remove-confirmed': function () {
					var field = that.model._byId[that._removeId];

					if (field) {
						field.destroy({accountManager: that.accountManager});
					}

					this.render();
				}
			});
		},

		render: function () {
			this.$el.html(this.template());

			this.$questionsList = this.$('.questions-list');
			this.$questionsListContainer = this.$questionsList.find('.content-container');

			//Add new custom field Form part
			this.$addNewQuestionForm = this.$('.add-new-question-form');
			this.$questionLabel = this.$addNewQuestionForm.find('.id-question-label');
			this.$questionType = this.$addNewQuestionForm.find('.id-question-type');
			this.$isRequiredQuestion = this.$addNewQuestionForm.find('.id-question-required');
			this.$optionsListRow = this.$addNewQuestionForm.find('.options-list-row');
			this.$optionsListInput = this.$optionsListRow.find('.id-options-list');
			this.$optionsListDemo = this.$optionsListRow.find('.id-options-list-demo');
			this.$validationErrors = this.$addNewQuestionForm.find('.validationErrors');

			var $optionsListRow = this.$optionsListRow;
			this.$questionType.change(function () {
				if ($(this).val() === 'list') {
					$optionsListRow.show();
				} else {
					$optionsListRow.hide();
				}
			});

			var $optionsListDemo = this.$optionsListDemo;
			this.$optionsListInput.keyup(function () {
				var optionsList = $.trim($(this).val()).split(';');
				$optionsListDemo.empty();
				_.each(optionsList, function (e) {
					e = $.trim(e);
					if (e !== '') {
						$optionsListDemo.append('<option>' + e + '</option>');
					}
				});
			});

			//custom fields list part
			this.$noCustomFields = this.$questionsList.find('.no-fields');
			this.$customFieldsTable = this.$questionsList.find('.fields-table');

			if (this.model.length) {
				var self = this;
				_.each(this.model.models, function (customFieldModel) {
					self.$customFieldsTable.append(customFieldModel.getHtml(true));
				});
			}
			else {
				this.$noCustomFields.show();
				this.$customFieldsTable.hide();
			}

			return this;
		},

		_onCancel: function () {
			this._triggerViews();
			this._resetAddForm();
		},

		_triggerViews: function () {
			this.$questionsList.toggle();
			this.$addNewQuestionForm.toggle();
		},

		_createField: function () {
			if (!this._isAddFormValid()) {
				this.$validationErrors.text("Please fill all required fields");
			} else {
				var model = new Extension();
				var listData = this.$optionsListInput.val().split(";");
				model.set("name", this.$questionLabel.val());
				model.set("entity", "TEST_SESSION");
				model.set("type", this.$questionType.val().toUpperCase());
				if (this.$isRequiredQuestion.attr("checked")) {
					model.set("properties", ["REQUIRED"]);
				} else {
					model.set("properties", []);
				}
				model.set("listdata", listData);


				var fn = _.bind(this._successCallback, this),
					er = _.bind(this._errorCallback, this);
				if (this.$questionType.val() !== "list") {
					model.sync("createSimpleExtension", model, {accountManager: this.accountManager, success: fn, error: er});
				} else {
					model.sync("createListExtension", model, {accountManager: this.accountManager, success: fn, error: er});
				}
			}
		},

		_createFieldOnEnter: function (e) {
			if (e.keyCode === 13) {
				this._createField();
			}
		},

		_successCallback: function () {
			var fn = _.bind(this._successRender, this);
			this.model.fetch({accountManager: this.accountManager, success: fn});
		},

		_errorCallback: function (model, xhr, options) {
			this.$validationErrors.text(options.responseError.description);
		},

		_successRender: function () {
			this.render();
		},

		_removeField: function (e) {
			this._removeId = $(e.target).attr('data-field-id');
			this.dialog.show('confirm', 'Remove this field?', 'remove');
		},

		_saveRequired: function (e) {
			var cmp = $(e.currentTarget),
				id = cmp.attr('data-field-id'),
				field = this.model._byId[id],
				fn = _.bind(this._saveCheckBoxSuccess, cmp),
				er = _.bind(this._saveCheckBoxError, cmp),
				props = _.without(field.get("properties"), "REQUIRED");

			if (cmp.attr("checked")) {
				props.push("REQUIRED");
			}

			field.set("properties", props);

			cmp.attr("disabled", true);
			field.sync("changeProperties", field, {accountManager: this.accountManager, success: fn, error: er});
		},

		_saveCheckBoxSuccess: function () {
			this.attr("disabled", false);
		},

		_saveCheckBoxError: function () {
			this.attr("disabled", false);
			this.attr("checked", !this.attr("checked"));
		},

		_resetAddForm: function () {
			this.$questionLabel.val("");
			this.$questionType.val("numeric");
			this.$isRequiredQuestion.attr("checked", false);
			this.$optionsListInput.val("");
			this.$optionsListRow.hide();
			$("option", this.$optionsListDemo).remove();
			this.$validationErrors.text("");
		},

		_isAddFormValid: function () {
			var isLabelValid = this.$questionLabel.val() !== "",
				areOptionsValid = this.$optionsListInput.val() !== "",
				questionType = this.$questionType.val(),
				isFormValid = isLabelValid;

			if (questionType === "list") {
				isFormValid = isLabelValid && areOptionsValid;
			}

			return isFormValid;
		},

		_editLabel: function (e) {
			var cell = $(e.target),
				originalValue = cell.text(),
				id = cell.attr('data-field-id'),
				record = this.model._byId[id],
				am = this.accountManager;

			var fn = (function (e) {
				return function (e) {
					var newValue = $("input", cell).val(),
						isSaveTriggered = e.keyCode === 13,
						isRestoreTriggered = e.keyCode === 27;
					if (isRestoreTriggered) {
						cell.html(originalValue);
					} else if (isSaveTriggered) {
						if (newValue === "") {
							return;
						}
						if (originalValue !== newValue) {
							var er = (function () {
								return function () {
									cell.html(originalValue);
								};
							})();
							record.set("name", newValue);
							record.sync("modifyExtensionName", record, {accountManager: am, error: er});
						}
						cell.html(newValue);
					}
				};
			})();

			var blurFn = (function () {
				return function () {
					cell.html(originalValue);
				};
			})();

			cell.text("").append($('<input>', { value: originalValue, blur: blurFn, keydown: fn }));
			$("input", cell).focus().select();
		},

		_editList: function (e) {
			var cell = $(e.target),
				originalValue = cell.text(),
				id = cell.attr('data-field-id'),
				record = this.model._byId[id],
				am = this.accountManager;

			var fn = (function (e) {
				return function (e) {
					var newValue = $("input", cell).val(),
						isSaveTriggered = e.keyCode === 13,
						isRestoreTriggered = e.keyCode === 27;
					if (isRestoreTriggered) {
						cell.html(originalValue);
					} else if (isSaveTriggered) {
						if (newValue === "") {
							return;
						}
						if (originalValue !== newValue) {
							var er = (function () {
								return function () {
									cell.html(originalValue);
								};
							})();
							record.set("list", newValue.split(";"));
							record.sync("changeList", record, {accountManager: am, error: er});
						}
						cell.html(newValue);
					}
				};
			})();

			var blurFn = (function () {
				return function () {
					cell.html(originalValue);
				};
			})();

			cell.text("").append($('<input>', { value: originalValue, blur: blurFn, keydown: fn, style: 'width: 95%' }));
			$("input", cell).focus().select();
		}

	});

});
