/*global define: true */
define([
	'underscore',
	'Controllers/Constants',
	'Controllers/ControllerBase',
	'DataLayer/ErrorConstants',
	'Views/Constants',
	'Models/Constants',
	'Models/UserProfileCollection',
	'Utils/Dialog',
	'Views/AddUserView',
	'text!Templates/UserAdded.html',
	'formatter'
], function (_, Constants, ControllerBase, ErrorConstants, ViewsConstants, ModelsConstants, UserProfileCollection, Dialog, AddUserView, UserAdded) {
	'use strict';
	return ControllerBase.extend({

		_UserAddedMessage: _.template(UserAdded),

		initialize: function () {
			ControllerBase.prototype.initialize.apply(this, arguments);
			this._checkAttribute("applicationView");
			this.dialog = new Dialog();

		},

		parseParams: function (params) {
			return params;
		},

		activate: function (params) {
			var accountManager = this.get("accountManager"), that = this;

			if (params) {
				this._projectUsers = params.projectUsers;
				this._users = params.users;
				this._project = params.project;
			}


			if (!this._users || !this._project || !this._projectUsers) {
				this.trigger('not-enough-data');
				return;
			}
			this.model = new UserProfileCollection();

			this.view = new AddUserView();

			this.listenTo(this.view, {
				'cancel': function () {
					that.trigger('cancel', that._project);
				},
				'search': this._onSearch,
				'add-user': this._addUser
			});

			// Initialize menu
			var applicationView = this.get("applicationView");

			//get user role and show proper menu
			var role = this.get("accountManager").get("currentUser") && this.get("accountManager").get("currentUser").get("role");


			// Show view
			applicationView.showView(this.view);
		},

		initializeMenu: function () {
			this.get("applicationView").header.showMenu(ViewsConstants.HeaderMenu.SiteAdmin);
		},

		deactivate: function () {
			this._reset();
		},

		_onSearch: function (name, email) {
			var that = this, foundUsers = _.filter(this._users, function (user) {
				if (!_.where(user.get('project'), {id: that._project}).length) {
					var userName = user.get('firstName').toLowerCase() + ' ' + user.get('secondName').toLowerCase();

					if (name && userName.indexOf(name.toLowerCase()) >= 0) {
						return true;
					}

					if (email && user.get('email') && user.get('email').toLowerCase().indexOf(email.toLowerCase()) >= 0) {
						return true;
					}

				}
				return false;
			});
			this.view.trigger('found-users', foundUsers);
			this.lastSearch = {name: name, email: email};
		},

		_addUser: function (id) {
			var that = this;

			this.model.saveAssignments({
				project: this._project,
				accountManager: this.get("accountManager"),
				users: _.union(this._projectUsers, [id]),
				success: function () {
					that._projectUsers.push(id);
					that._users = _.filter(that._users, function (user) {
						return user.get('id') !== id;
					});

					that.dialog.show('alert', that._UserAddedMessage());
					that._onSearch(that.lastSearch.name, that.lastSearch.email);
				}
			});
		},

		_onAssignmentSaved: function () {
			var that = this;

			//LOGIC with this._users


		}

	});
});
