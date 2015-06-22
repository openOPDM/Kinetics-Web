/*global define:true */
define([
	'jQuery',
	'underscore',
	'backbone',
	'Views/Constants',
	'Models/Constants',
	'Models/ErrorConstants',
	'text!Templates/SiteAdminCreateProject.html',
	'jQuery.placeholder',
	'formatter'
], function ($, _, Backbone, Constants, ModelsConstants, ErrorConstants, templateHtml) {
	'use strict';

	return Backbone.View.extend({
		tagName: "div",
		className: "content-wrapper create-project",
		template: _.template(templateHtml),

		events: {
			"click .id-create-project": "_onCreateProject",
			"keypress input": "_submitOnEnter",
			"click .id-cancel": "_onCancel"
		},

		initialize: function () {
			this.listenTo(this.model, {
				"invalid": function (model, errors) {
					this._updateErrorMessage(errors);
				},
				"error": function (error) {
					this._updateErrorMessage([ error ]);
				}
			});
		},

		render: function () {
			this.$el.html(this.template({
				Constants: ModelsConstants,
				model: this.model
			}));

			this.$projectName = this.$(".id-project-name");

			this.$errorProjectName = this.$(".id-error-project-name");
			this.$errorGeneral = this.$('.id-error-general');

			this.$("input, textarea").placeholder();

			this._hideErrorsAndStatuses();

            var that = this; //todo:refacor this to change render->afterRender events
            setTimeout(function(){
                that.$projectName.focus();
            });

			return this;
		},


		// Overload remove() method to reset reCaptcha inner state.
		remove: function () {
			// Call base implementation
			Backbone.View.prototype.remove.apply(this, arguments);
		},

		_hideErrorsAndStatuses: function () {
/*			this.$errorProjectName.hide();
			this.$errorGeneral.hide();*/
            this.$('.sign-row-error').hide().removeAttr('title');
            this.$('input, select').removeClass('errored');
		},

		_onCancel: function () {
			this.trigger('cancel');
		},

		_onCreateProject: function () {
			this._hideErrorsAndStatuses();

			var values = {
				projectName: $.trim(this.$projectName.val())
			};

			if (this.model.set(values, { validate: true })) {
				this.trigger("create-project", this.model);
			}
		},

		_submitOnEnter: function (e) {
			if (e.keyCode === 13) {
				this._onCreateProject();
			}
		},

		_updateErrorMessage: function (errors) {

			_.forEach(errors, function (error) {
                var errored = {
                    $container:null
                };

				switch (error.code) {
				case ErrorConstants.Validation.EmptyProjectName.code:
                    errored.$container = this.$errorProjectName;
					break;

				default:
                    errored.$container = this.$errorGeneral;
					break;
				}

                if (errored.$container){
                    errored.$container.show().html(error.description)
                        .attr('title', error.description)

                    errored.$input = errored.$input || errored.$container.closest('.sign-row').find('input[type!=radio], select');
                    errored.$input.addClass('errored');
                }

			}, this);
		}
	});

});
