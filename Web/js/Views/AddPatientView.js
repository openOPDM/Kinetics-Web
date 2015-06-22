/*global define:true */
define([
	'jQuery',
	'underscore',
	'backbone',
	'Views/Constants',
	'Models/Constants',
	'Models/ErrorConstants',
	'Models/PatientProfileCollection',
	'text!Templates/AddPatient.html',
	'Views/PatientListRowView',
	'formatter'
], function ($, _, Backbone, Constants, ModelsConstants, ErrorConstants, PatientProfileCollection, templateHtml, PatientListRowView) {
	'use strict';

	return Backbone.View.extend({
		tagName: "div",
		className: "content-wrapper add-patient",
		template: _.template(templateHtml),

		events: {
			"click .id-create-patient": "_onCreatePatient",
			"click .id-search": "_onSearch",
			"keypress input": "_submitOnEnter"
		},

		initialize: function (options) {
			if (!this.model && this.model instanceof PatientProfileCollection) {
				throw new Error("Model not set or wrong type.");
			}

			this.listenTo(this.model, {
				"reset": this._onReset
			});

			this._searchText = options.searchText;
			this._rowViews = {};
		},

		_initializeRowViews: function () {
			_.forEach(this.model.models, function (rowModel) {
				this._rowViews[rowModel.cid] = new PatientListRowView({ model: rowModel });
			}, this);
		},

		_onReset: function () {
			this._removeAllRowsViews();
			this._initializeRowViews();
			this._fillRows();
		},

		_removeAllRowsViews: function () {
			_.each(this._rowViews, function (rowView, key, collection) {
				rowView.remove();
				delete collection[key];
			});
		},

		render: function () {
			this.$el.html(this.template({
				model: this.model,
				Constants: ModelsConstants
			}));
			this.$resultTable = this.$(".result-table");
			this.$headerRow = this.$(".result-header-row");
			this.$noResultsRow = this.$(".id-no-results");

			this.$searchUid = this.$(".id-search-uid");
			this.$searchName = this.$(".id-search-name");
			this.$searchEmail = this.$(".id-search-email");

			//this.$searchText.val(this._searchText);

            var that = this; //todo:refacor this to change render->afterRender events
            setTimeout(function(){
                that.$searchName.focus();
            });

			return this;
		},

		_fillRows: function () {
			_.each(this.model.models, function (rowModel) {
				var rowView = this._rowViews[rowModel.cid];
				this.$resultTable.append(rowView.render().el);
			}, this);

			this._updateNoResultRow();
		},

		_updateNoResultRow: function () {
			if (this.model.length > 0) {
				this.$noResultsRow.hide();
			} else {
				this.$noResultsRow.show();
			}
		},

		_onCreatePatient: function () {
			this.trigger('create-patient-instead');
		},

		_onSearch: function () {
			this.trigger('search', {
				uid: this.$searchUid.val(),
				name: this.$searchName.val(),
				email: this.$searchEmail.val()
			});
		},

		_submitOnEnter: function (e) {
			if (e.keyCode === 13) {
				this._onSearch();
			}
		},

		// Overload remove() method to reset reCaptcha inner state.
		remove: function () {
			// Call base implementation
			Backbone.View.prototype.remove.apply(this, arguments);
		}

	});

});
