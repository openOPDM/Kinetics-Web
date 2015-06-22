/*global define:true */
define([
	'Controllers/Constants',
	'Controllers/ControllerBase',
	'Models/ExtensionsCollection',
	'Views/Constants',
	'Views/TestCustomFieldsView'
], function (Constants, ControllerBase, ExtensionsCollection, ViewsConstants, TestCustomFieldsView) {
	'use strict';

	return ControllerBase.extend({
		initialize: function () {
			ControllerBase.prototype.initialize.apply(this, arguments);
			this._checkAttribute("applicationView");
			this._checkAttribute("accountManager");
		},

		activate: function () {
			this._loadTestCustomFields();
		},

		// Initialize menu
		initializeMenu: function () {
			this.get("applicationView").header.showMenu(ViewsConstants.HeaderMenu.SiteAdmin, 'customFields');
		},

		deactivate: function () {
			this._reset();
		},

		_showView: function () {
			this.view = new TestCustomFieldsView({
				model: this.customFieldsCollection,
				accountManager: this.get('accountManager')
			});

			this.get("applicationView").showView(this.view);
		},

		_loadTestCustomFields: function () {
			this.customFieldsCollection = new ExtensionsCollection();
			var self = this;
			var options = this._getFetchOptions(true, function () {
				self._showView();
			}, this._loadTestCustomFields);
			this.customFieldsCollection.fetch(options);
		}

	});

});
