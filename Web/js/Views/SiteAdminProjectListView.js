/*global define: true */
define([
	'jQuery',
	'underscore',
	'backbone',
	'text!Templates/SiteAdminProjectList.html',
	'Models/ProjectCollection',
	'Models/Constants',
	'Views/SiteAdminProjectListRowView'
], function ($, _, Backbone, templateHtml, ProjectCollection, Constants, SiteAdminProjectListRowView) {
	'use strict';

	return Backbone.View.extend({
		tagName: "div",
		className: "content-wrapper project-list",
		template: _.template(templateHtml),

		events: {
			"click .id-button-create": "_onClickCreateNew"
		},

		_rowViews: {},
		initialize: function () {
			this._initializeRowViews();

			this.listenTo(this.model, {
				"reset": this._onReset
			});

			//this._rowViews = {};

		},

		_onReset: function () {
			this._removeAllRowsViews();
			this._initializeRowViews();
			this._fillRows();
		},

		// Remove view from DOM
		remove: function () {
			// Destroy row views
			this._removeAllRowsViews();

			// Call base implementation
			Backbone.View.prototype.remove.call(this);
		},

		// Destroy all row view
		_removeAllRowsViews: function () {
			_.each(this._rowViews, function (rowView, key, collection) {
				rowView.remove();
				delete collection[key];
			});
		},

		_initializeRowViews: function () {
            if (this.model){
                _.forEach(this.model.models, function (rowModel) {
                    this._rowViews[rowModel.cid] = new SiteAdminProjectListRowView({ model: rowModel });
                }, this);
            }
		},

		_fillRows: function () {
			_.each(this.model.models, function (rowModel) {
				var rowView = this._rowViews[rowModel.cid];
				this.$projectList.append(rowView.render().el);
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

		render: function () {
			this.$el.html(this.template({
				model: this.model,
				Constants: Constants
			}));
			this.$projectList = this.$(".project-list");
			this.$noResultsRow = this.$(".id-no-results");
			this._fillRows();

			return this;
		},

		hide: function () {
			this.$el.hide();
		},

		show: function () {
			this.$el.show();
		},

		_onClickCreateNew: function () {
			this.model.trigger("create");
		}
	});

});
