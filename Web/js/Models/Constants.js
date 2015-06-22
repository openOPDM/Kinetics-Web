/*global define:true */
define([
	'moment',
	'DataLayer/Constants'
], function (moment, DataConstants) {
	"use strict";
	var Constants = {
		CurrentUserIdMarker: "CurrentUser",

		UserStatus: {
			Active: "ACTIVE",
			Disabled: "DISABLED",
			WaitingConfirmation: "WAITING_CONFIRMATION",
			Waiting: 'WAITING_PASS'
		},

		ProjectStatus: {
			Active: 'ACTIVE',
			Disabled: 'DISABLED'
		},

		TestSessionType: {
			Keyboard: "kb",
			TUG: "TUG",
			PST: "PST"
		},

		Gender: {
			Male: "MALE",
			Female: "FEMALE"
		},

		EmailPattern: /[a-zA-Z0-9\+\.\_\%\-\+]{1,256}\@[a-zA-Z0-9][a-zA-Z0-9\-]{0,64}(\.[a-zA-Z0-9][a-zA-Z0-9\-]{0,25})+/,

		FullDayOffset: moment.duration({
			hours: 23,
			minutes: 59,
			seconds: 59
		}),

		UserListSearchToken: {
			Name: "name",
			Email: "email",
			UID: "uid",
			Summary: "summary"
		},

		UserRole: {
			Analyst: "analyst",
			Patient: "patient",
			SiteAdmin: "site_admin"
		},

		UserRoleId: {},

		CustomFields: {
			List: "LIST",
			Numeric: "NUMERIC",
			Required: "REQUIRED"
		},

		CustomLabels: {
			'Avanir': {
				'First Name': 'Subject Initials',
				'first name': 'subject initials',
				'Last Name': 'Subject ID',
				'last name': 'subject ID',
				'Project': 'Site ID',
				'project': 'site',
				'Project list': 'Site list',
				'Current Project': 'Current Site',
				'Projects': 'Sites',
				'projects': 'sites',
				'Create project': 'Create site',
				'new Project': 'new Site',
				'Project Name': 'Site ID',
				'project name': 'site ID',
				'Not Applicable': 'Not Applicable',
				'Name': 'Name/Subject ID',
				'by name': 'by name/subject ID',
				'NAME': 'NAME/SUBJECT ID'
			},
			'default': {
				'Not Applicable': ''
			}
		},

		customLabel: function (label) {
			var project = DataConstants.branding;
			return Constants.CustomLabels[project] && Constants.CustomLabels[project][label] ? Constants.CustomLabels[project][label] : Constants.CustomLabels['default'][label] || label;
		}

	};

	Constants.TestSessionTypeCaptions = {};
	Constants.TestSessionTypeCaptions[Constants.TestSessionType.Keyboard] = "Keyboard";
	Constants.TestSessionTypeCaptions[Constants.TestSessionType.TUG] = "Timed Up and Go (TUG)";
	Constants.TestSessionTypeCaptions[Constants.TestSessionType.PST] = "Postural Sway tests (PST)";

	Constants.UserStatusCaptions = {};
	Constants.UserStatusCaptions[Constants.UserStatus.Active] = "Active";
	Constants.UserStatusCaptions[Constants.UserStatus.Disabled] = "Inactive";
	Constants.UserStatusCaptions[Constants.UserStatus.WaitingConfirmation] = "Not confirmed";
	Constants.UserStatusCaptions[Constants.UserStatus.Waiting] = "Waiting";

	Constants.GenderCaptions = {};
	Constants.GenderCaptions[Constants.Gender.Male] = "Male";
	Constants.GenderCaptions[Constants.Gender.Female] = "Female";


	return Constants;
});