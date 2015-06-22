/*global define: true */
define([
	'Models/Constants'
], function (Constants) {
	"use strict";
	return {
		Validation: {
			EmptyEMail: {
				code: 2000,
				description: "Please enter e-mail"
			},
			InvalidEMail: {
				code: 2001,
				description: "Email has invalid format"
			},
			EMailIsNotUnique: {
				code: 2011,
				description: "Email is not unique"
			},
			EmptyBirthday: {
				code: 2002,
				description: "Please enter valid birthday date"
			},
			InvalidBirthday: {
				code: 2003,
				description: "Birthday date is not valid"
			},
			EmptyPassword: {
				code: 2004,
				description: "Please enter the password"
			},
			InvalidPasswordConfirmation: {
				code: 2005,
				description: "Password confirmation mismatch with password"
			},
			EmptyFirstName: {
				code: 2006,
				description: "Please enter " + Constants.customLabel("first name")
			},
			EmptySecondName: {
				code: 2007,
				description: "Please enter " + Constants.customLabel("last name")
			},
			EmptyOldPassword: {
				code: 2008,
				description: "Please enter the old password or leave this field empty"
			},
			EmptyNewPassword: {
				code: 2009,
				description: "Please enter the new password or leave this field empty"
			},
			EmptyGenderSelected: {
				code: 2010,
				description: "Please select gender"
			},

			EmptyConfirmationCode: {
				code: 2100,
				description: "Please enter confirmation code from sent e-mail."
			},
			EmptyProjectName: {
				code: 9000,
				description: "Please enter " + Constants.customLabel("project name")
			},
			EmptyFromDate: {
				code: 9001,
				description: "Please enter starting date"
			},
			EmptyToDate: {
				code: 9002,
				description: "Please enter ending date"
			},
			InvalidFromDate: {
				code: 9003,
				description: "Invalid date format"
			},
			InvalidToDate: {
				code: 9004,
				description: "Invalid date format"
			},
			NoProjectSelected: {
				code: 9005,
				description: "Please select at least one " + Constants.customLabel("project")
			},
			EmptyCaptcha: {
				code: 9006,
				description: "Please enter captcha solution"
			},
			MismatchedDates: {
				code: 9007,
				description: "Starting date cannot be greater than ending date"
			},
			InvalidFutureDate: {
				code: 9008,
				description: "Please do not enter dates from future"
			}
		},

		Confirm: {

		}
	};

});
