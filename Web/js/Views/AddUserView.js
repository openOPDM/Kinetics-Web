/*global define: true */
define([
	'backbone',
	'underscore',
	'Models/Constants',
	'text!Templates/AddUser.html',
	'text!Templates/AddUserRow.html'
], function (Backbone, _, ModelsConstants, templateHtml, userRowHtml) {
	'use strict';

	return Backbone.View.extend({
		tagName: "div",
		className: "content-wrapper add-patient",
		template: _.template(templateHtml),
		userRowTemplate: _.template(userRowHtml),

		events: {
			'click .id-search': '_onSearch',
			'keypress #searchName, #searchEmail': '_onSubmitSearchByEnter',
			'click .id-cancel': '_onCancel',
			'click .id-add-user': '_onAddUser'
		},

		initialize: function () {
			this.listenTo(this, {
				'found-users': function (users) {
					var that = this;
					this.$results.html('');
					if (!users.length) {
						this.$noResults.show();
					} else {
						this.$noResults.hide();
						var rows = '';
						_.each(users, function (user) {
							rows += that.userRowTemplate({model: user});
						});
						this.$results.html(rows);
					}
				}
			});

		},

		remove: function () {
			// Call base implementation
			Backbone.View.prototype.remove.apply(this, arguments);
		},


		render: function () {
			this.$el.html(this.template({
				Constants: ModelsConstants
			}));
			this.$name = this.$('#searchName');
			this.$email = this.$('#searchEmail');
			this.$noResults = this.$('.id-no-results');
			this.$results = this.$('.results');

            var that = this; //todo:refacor this to change render->afterRender events
            setTimeout(function(){
                that.$name.focus();
            });

			return this;
		},

		_renderResults: function () {

		},

		_onSearch: function () {
			this.trigger('search', this.$name.val(), this.$email.val());
		},

		_onSubmitSearchByEnter: function (e) {
			if (e.keyCode === 13) {
				this._onSearch();
			}
		},

		_onCancel: function () {
			this.trigger('cancel');
		},

		_onAddUser: function (e) {
			this.trigger('add-user', $(e.target).data('id'));
		}
	});

});
