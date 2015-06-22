/*global define:true */
define([
	'underscore',
	'DataLayer/Constants'
], function (_, Constants) {
		"use strict";
		return {
			AccountManager: {
				authenticate: {
					signInRequired: false,
					buildRequest: function (options) {
						return {
							"request": {
								"function": {
									"method": "authenticate",
									"timestamp": null,
									"target": "AccountManager",
									"arguments": [
										{
											"name": "email",
											"value": options.email
										},
										{
											"name": "passHash",
											"value": options.password
										}
									]
								}
							}
						};
					},

					parseResponse: function (resp) {
						return resp.response['function'].data.project;
					}
				},
				login: {
					signInRequired: false,
					buildRequest: function (options) {
						return {
							"request": {
								"function": {
									"method": "login",
									"timestamp": null,
									"target": "AccountManager",
									"arguments": [
										{
											"name": "email",
											"value": options.email
										},
										{
											"name": "passHash",
											"value": options.password
										},
										{
											"name": "project",
											"value": options.project
										}
									]
								}
							}
						};
					},

					parseResponse: function (resp) {
						return resp.response['function'].data.sessionToken;
					}
				},

				logout: {
					signInRequired: false,
					buildRequest: function (options) {
						return {
							"request": {
								"function": {
									"method": "logout",
									"target": "AccountManager",
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										}
									]
								}
							}
						};
					},

					parseResponse: function () {
					}
				},

				confirmCreate: {
					signInRequired: false,
					buildRequest: function (options) {
						return {
							"request": {
								"function": {
									"method": "confirmCreate",
									"target": "AccountManager",
									"arguments": [
										{
											"name": "email",
											"value": options.email
										},
										{
											"name": "confirmationCode",
											"value": options.confirmationCode
										}
									]
								}
							}
						};
					},

					parseResponse: function () {
					}
				},

				resendConfirmation: {
					signInRequired: false,
					buildRequest: function (options) {
						return {
							"request": {
								"function": {
									"method": "resendConfirmation",
									"target": "AccountManager",
									"arguments": [
										{
											"name": "email",
											"value": options.email
										},
										{
											"name": "token",
											"value": options.token
										}
									]
								}
							}
						};
					},

					parseResponse: function () {
					}
				},

				resendInvite: {
					buildRequest: function (options) {
						return {
							"request": {
								"function": {
									"method": "resendInvite",
									"target": "AccountManager",
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										},
										{
											"name": "email",
											"value": options.email
										}
									]
								}
							}
						};
					},

					parseResponse: function () {
					}
				},

				sendPatientInvite: {
					signInRequired: false,
					buildRequest: function (options, model) {
						return {
							"request": {
								"function": {
									"method": "sendPatientInvite",
									"target": "AccountManager",
									"arguments": [
										{
											"name": "id",
											"value": model.id
										},
										{
											"name": "sessionToken",
											"value": options.sessionToken
										}
									]
								}
							}
						};
					},

					parseResponse: function () {
					}
				},

				resetPassword: {
					signInRequired: false,
					buildRequest: function (options) {
						return {
							"request": {
								"function": {
									"method": "resetPassword",
									"target": "AccountManager",
									"arguments": [
										{
											"name": "email",
											"value": options.email
										}
									]
								}
							}
						};
					},

					parseResponse: function () {
					}
				},

				setPassword: {
					signInRequired: false,
					buildRequest: function (options) {
						var persist = {
							email: options.email,
							passHash: options.password,
							token: options.token
						};

						var requestArguments = _.map(persist, function (value, key) {
							return { name: key, value: value };
						});

						return {
							"request": {
								"function": {
									"method": "setPassword",
									"target": "AccountManager",
									"timestamp": $.now(),
									"arguments": requestArguments
								}
							}
						};
					},

					parseResponse: function (/*resp, options*/) {
						return {};
					}
				},

				getUserInfo: {
					buildRequest: function (options) {
						return {
							"request": {
								"function": {
									"method": "getUserInfo",
									"target": "AccountManager",
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										}
									]
								}
							}
						};
					},

					parseResponse: function (resp/*, options*/) {
						return resp.response['function'].data.user;
					}
				},

				getUserInfoById: {
					buildRequest: function (options, model) {
						return {
							"request": {
								"function": {
									"method": "getUserInfoById",
									"target": "AccountManager",
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										},
										{
											"name": "ids",
											"value": [ model.id ]
										}
									]
								}
							}
						};
					},

					parseResponse: function (resp/*, options*/) {
						return resp.response['function'].data.user[0];
					}
				},

				getPatientInfoById: {
					buildRequest: function (options, model) {
						return {
							"request": {
								"function": {
									"method": "getPatientInfoById",
									"target": "AccountManager",
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										},
										{
											"name": "id",
											"value": model.id
										}
									]
								}
							}
						};
					},

					parseResponse: function (resp/*, options*/) {
						return resp.response['function'].data.user;
					}
				},
				getPatientInfoByConfCode: {
					signInRequired: false,
					buildRequest: function (options, model) {
						return {
							"request": {
								"function": {
									"method": "getPatientInfoByConfCode",
									"target": "AccountManager",
									"arguments": [
										{
											"name": "confirmationCode",
											"value": options.inviteId
										},
										{
											"name": "email",
											"value": options.inviteEmail
										}
									]
								}
							}
						};
					},

					parseResponse: function (resp/*, options*/) {
						return resp.response['function'].data.user;
					}
				},

				getRoleList: {
					buildRequest: function (options) {
						return {
							"request": {
								"function": {
									"method": "getRoleList",
									"target": "AccountManager",
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										}
									]
								}
							}
						};
					},

					parseResponse: function (resp/*, options*/) {
						return resp.response['function'].data.role;
					}
				},

				createPatient: {
					signInRequired: false,
					buildRequest: function (options, model) {
						var attributes = model.toJSON(options);

						// NOTE: Unique ID now not updateable
						var persist = {
							sessionToken: attributes.sessionToken,
							email: attributes.email,
							firstName: attributes.firstName,
							secondName: attributes.secondName,
							birthday: attributes.birthday,
							gender: attributes.gender
						};

						var requestArguments = _.map(persist, function (value, key) {
							return { name: key, value: value };
						});

						return {
							"request": {
								"function": {
									"method": "createPatient",
									"target": "AccountManager",
									"timestamp": $.now(),
									"arguments": requestArguments
								}
							}
						};
					},

					parseResponse: function (/*resp, options*/) {
						return {};
					}
				},
				createUser: {
					signInRequired: false,
					buildRequest: function (options, model) {
						var attributes = model.toJSON(options),
							persist = { // NOTE: Unique ID now not updateable
								email: attributes.email,
								firstName: attributes.firstName,
								secondName: attributes.secondName,
								birthday: attributes.birthday,
								gender: attributes.gender,
								// NOTE: Temporary workaround to set passHash
								passHash: attributes.password,
								project: attributes.projectId
							},
							method;

						if (attributes.recaptchaChallenge && attributes.recaptchaResponse) {
							persist.challenge = attributes.recaptchaChallenge;
							persist.solution = attributes.recaptchaResponse;
							method = 'createUserCaptcha';
						} else {
							method = 'createUser';
						}

						var requestArguments = _.map(persist, function (value, key) {
							return { name: key, value: value };
						});

						return {
							"request": {
								"function": {
									"method": method,
									"target": "AccountManager",
									"timestamp": $.now(),
									"arguments": requestArguments
								}
							}
						};
					},

					parseResponse: function (/*resp, options*/) {
						return {};
					}
				},


				createUserCaptcha: {
					signInRequired: false,
					buildRequest: function (options, model) {
						var attributes = model.toJSON(options);
						// NOTE: Unique ID now not updateable
						var persist = {
							email: attributes.email,
							firstName: attributes.firstName,
							secondName: attributes.secondName,
							birthday: attributes.birthday,
							gender: attributes.gender,
							// NOTE: Temporary workaround to set passHash
							passHash: attributes.password,
							challenge: attributes.recaptchaChallenge,
							solution: attributes.recaptchaResponse,
							project: attributes.projectId,
							token: options.token
						};

						var requestArguments = _.map(persist, function (value, key) {
							return { name: key, value: value };
						});

						return {
							"request": {
								"function": {
									"method": "createUserCaptcha",
									"target": "AccountManager",
									"timestamp": $.now(),
									"arguments": requestArguments
								}
							}
						};
					},

					parseResponse: function (/*resp, options*/) {
						return {};
					}
				},

				createShareUser: {
					signInRequired: false,
					buildRequest: function (options, model) {
						var attributes = model.toJSON(options);
						// NOTE: Unique ID now not updateable

						var persist = {
							email: attributes.email,
							firstName: attributes.firstName,
							secondName: attributes.secondName,
							passHash: attributes.password,
							birthday: attributes.birthday,
							gender: attributes.gender,
							project: attributes.projectId,
							user: options.user
						};

						var requestArguments = _.map(persist, function (value, key) {
							return { name: key, value: value };
						});

						return {
							"request": {
								"function": {
									"method": "createShareUser",
									"target": "AccountManager",
									"timestamp": $.now(),
									"arguments": requestArguments
								}
							}
						};
					},

					parseResponse: function (/*resp, options*/) {
						return {};
					}
				},

				createUserByAdmin: {
					signInRequired: true,
					buildRequest: function (options, model) {
						var attributes = model.toJSON(options);
						// NOTE: Unique ID now not updateable
						var persist = {
							sessionToken: options.sessionToken,
							email: attributes.email,
							firstName: attributes.firstName,
							secondName: attributes.secondName,
							birthday: attributes.birthday,
							gender: attributes.gender,
							role: attributes.role,
							project: attributes.projectId
						};

						var requestArguments = _.map(persist, function (value, key) {
							return { name: key, value: value };
						});

						return {
							"request": {
								"function": {
									"method": "createUserByAdmin",
									"target": "AccountManager",
									"timestamp": $.now(),
									"arguments": requestArguments
								}
							}
						};
					},

					parseResponse: function (/*resp, options*/) {
						return {};
					}
				},

				createUserWithTest: {
					signInRequired: false,
					buildRequest: function (options, model) {
						var attributes = model.toJSON(options);
						// NOTE: Unique ID now not updateable
						var persist = {
							email: attributes.email,
							firstName: attributes.firstName,
							secondName: attributes.secondName,
							birthday: attributes.birthday,
							gender: attributes.gender,
							// NOTE: Temporary workaround to set passHash
							passHash: attributes.password,
							challenge: attributes.recaptchaChallenge,
							solution: attributes.recaptchaResponse,
							project: attributes.projectId,
							testSession: attributes.testSessionResults
						};

						var requestArguments = _.map(persist, function (value, key) {
							return { name: key, value: value };
						});

						return {
							"request": {
								"function": {
									"method": "createUserWithTest",
									"target": "AccountManager",
									"timestamp": $.now(),
									"arguments": requestArguments
								}
							}
						};
					},

					parseResponse: function (/*resp, options*/) {
						return {};
					}
				},

				modifyUserInfo: {
					buildRequest: function (options, model) {
						var attributes = model.toJSON(options);

						// NOTE: Unique ID now not updateable
						var persist = {
							sessionToken: options.sessionToken,
							firstName: attributes.firstName,
							secondName: attributes.secondName,
							birthday: attributes.birthday,
							gender: attributes.gender
						};

						var requestArguments = _.map(persist, function (value, key) {
							return { name: key, value: value };
						});

						return {
							"request": {
								"function": {
									"method": "modifyUserInfo",
									"target": "AccountManager",
									"arguments": requestArguments
								}
							}
						};
					},

					parseResponse: function (/*resp, options*/) {
						return {};
					}
				},
				modifyPatientInfo: {
					buildRequest: function (options, model) {
						var attributes = model.toJSON(options);
						// NOTE: Unique ID now not updateable
						var persist = {
							sessionToken: options.sessionToken,
							id: attributes.id,
							email: attributes.email,
							firstName: attributes.firstName,
							secondName: attributes.secondName,
							gender: attributes.gender,
							birthday: attributes.birthday
						};

						var requestArguments = _.map(persist, function (value, key) {
							return { name: key, value: value };
						});

						return {
							"request": {
								"function": {
									"method": "modifyPatientInfo",
									"target": "AccountManager",
									"arguments": requestArguments
								}
							}
						};
					},

					parseResponse: function (/*resp, options*/) {
						return {};
					}
				},

				confirmPatientProfile: {
					signInRequired: false,
					buildRequest: function (options, model) {
						var attributes = model.toJSON(options);

						var persist = {
							confirmationCode: options.confirmationCode,
							email: attributes.email,
							passHash: attributes.password
						};

						if (attributes.firstName) {
							persist.firstName = attributes.firstName;
						}
						if (attributes.secondName) {
							persist.secondName = attributes.secondName;
						}
						if (attributes.gender) {
							persist.gender = attributes.gender;
						}
						if (attributes.birthday) {
							persist.birthday = attributes.birthday;
						}

						var requestArguments = _.map(persist, function (value, key) {
							return { name: key, value: value };
						});

						return {
							"request": {
								"function": {
									"method": "confirmPatientProfile",
									"target": "AccountManager",
									"arguments": requestArguments
								}
							}
						};
					},

					parseResponse: function (/*resp, options*/) {
						return {};
					}
				},

				getUserInfoList: {
					buildRequest: function (options) {
						return {
							"request": {
								"function": {
									"method": "getUserInfoList",
									"target": "AccountManager",
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										}
									]
								}
							}
						};
					},

					parseResponse: function (resp/*, options*/) {
						return resp.response['function'].data.user;
					}
				},
				getPatients: {
					buildRequest: function (options) {
						return {
							"request": {
								"function": {
									"method": "getPatients",
									"target": "AccountManager",
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										}
									]
								}
							}
						};
					},

					parseResponse: function (resp/*, options*/) {
						return resp.response['function'].data.user;
					}
				},

				findUser: {
					buildRequest: function (options) {
						return {
							"request": {
								"function": {
									"method": "findUser",
									"target": "AccountManager",
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										},
										{
											"name": "searchToken",
											"value": options.searchBy
										},
										{
											"name": "searchData",
											"value": options.search
										}
									]
								}
							}
						};
					},

					parseResponse: function (resp/*, options*/) {
						return resp.response['function'].data.user;
					}
				},

				findPatient: {
					buildRequest: function (options) {
						return {
							"request": {
								"function": {
									"method": "findPatient",
									"target": "AccountManager",
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										},
										{
											"name": "searchToken",
											"value": options.searchBy
										},
										{
											"name": "searchData",
											"value": options.search
										}
									]
								}
							}
						};
					},

					parseResponse: function (resp/*, options*/) {
						return resp.response['function'].data.user;
					}
				},

				modifyUserStatus: {
					buildRequest: function (options) {
						return {
							"request": {
								"function": {
									"method": "modifyUserStatus",
									"target": "AccountManager",
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										},
										{
											"name": "ids",
											"value": options.ids
										},
										{
											"name": "disable",
											"value": options.disable
										}
									]
								}
							}
						};
					},

					parseResponse: function (resp) {
						return {};
					}
				},

				assignRole: {
					buildRequest: function (options) {
						return {
							"request": {
								"function": {
									"method": "assignRole",
									"timestamp": null,
									"target": "AccountManager",
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										},
										{
											"name": "ids",
											"value": options.ids
										},
										{
											"name": "id",
											"value": options.id
										}
									]
								}
							}
						};
					},

					parseResponse: function (resp) {
						return {};
					}
				},
				changeRole: {
					buildRequest: function (options) {
						return {
							"request": {
								"function": {
									"method": "changeRole",
									"target": "AccountManager",
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										},
										{
											"name": "ids",
											"value": options.ids
										},
										{
											"name": "role",
											"value": options.role
										}
									]
								}
							}
						};
					},

					parseResponse: function (resp) {
						return {};
					}
				},
				assignSiteAdminRole: {
					buildRequest: function (options) {
						return {
							"request": {
								"function": {
									"method": "assignSiteAdminRole",
									"target": "AccountManager",
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										},
										{
											"name": "ids",
											"value": options.ids
										}
									]
								}
							}
						};
					},

					parseResponse: function (resp) {
						return {};
					}
				},

				unassignRole: {
					buildRequest: function (options) {
						return {
							"request": {
								"function": {
									"method": "unassignRole",
									"timestamp": null,
									"target": "AccountManager",
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										},
										{
											"name": "ids",
											"value": options.ids
										},
										{
											"name": "id",
											"value": options.id
										}
									]
								}
							}
						};
					},

					parseResponse: function (resp) {
						return {};
					}
				},

				modifyPassword: {
					buildRequest: function (options) {
						return {
							"request": {
								"function": {
									"method": "ModifyPassword",
									"target": "AccountManager",
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										},
										{
											"name": "newPassHash",
											"value": options.newPassHash
										},
										{
											"name": "passHash",
											"value": options.passHash
										}
									]
								}
							}
						};
					},

					parseResponse: function (resp) {
						return {};
					}
				},

				modifyProjects: {
					buildRequest: function (options) {
						return {
							"request": {
								"function": {
									"method": "ModifyProjects",
									"target": "AccountManager",
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										},
										{
											"name": "project",
											"value": options.project
										}
									]
								}
							}
						};
					},

					parseResponse: function (resp) {
						return {};
					}
				},

				deleteUser: {
					buildRequest: function (options) {
						return {
							"request": {
								"function": {
									"method": "deleteUser",
									"target": "AccountManager",
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										}
									]
								}
							}
						};
					},

					parseResponse: function (resp) {
						return {};
					}
				},

				unassignPatient: {
					buildRequest: function (options, model) {
						return {
							"request": {
								"function": {
									"method": "unassignPatient",
									"target": "AccountManager",
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										},
										{
											"name": "ids",
											"value": [ model.id ]
										}
									]
								}
							}
						};
					},

					parseResponse: function (resp/*, options*/) {
						return resp.response['function'].data.user[0];
					}
				},
				assignPatient: {
					buildRequest: function (options, model) {
						return {
							"request": {
								"function": {
									"method": "assignPatient",
									"target": "AccountManager",
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										},
										{
											"name": "ids",
											"value": [ model.id ]
										}
									]
								}
							}
						};
					},

					parseResponse: function (resp/*, options*/) {
						return resp.response['function'].data.user[0];
					}
				}

			},

			TestSessionManager: {
				add: {
					buildRequest: function (options, model) {
						var method, args = [
							{
								"name": "testSession",
								"value": model.toJSON()
							},
							{
								"name": "sessionToken",
								"value": options.sessionToken
							}
						];

						if (options.userId) {
							method = 'addForPatient';
							args.push({
								"name": "id",
								"value": options.userId
							});

						} else {
							method = 'add';
						}

						return {
							"request": {
								"function": {
									"method": method,
									"target": "TestSessionManager",
									"arguments": args
								}
							}
						};
					},

					parseResponse: function (/*resp, options*/) {
						return {};
					}
				},

				addForPatient: {
					buildRequest: function (options, model) {
						return {
							"request": {
								"function": {
									"method": "addForPatient",
									"target": "TestSessionManager",
									"arguments": [
										{
											"name": "id",
											"value": options.userId
										},
										{
											"name": "sessionToken",
											"value": options.sessionToken
										},
										{
											"name": "testSession",
											"value": model.toJSON()
										}
									]
								}
							}
						};
					},

					parseResponse: function (/*resp, options*/) {
						return {};
					}
				},

				getDetails: {
					buildRequest: function (options, model) {
						return {
							"request": {
								"function": {
									"method": "getDetails",
									"target": "TestSessionManager",
									"arguments": [
										{
											"name": "id",
											"value": model.id
										},
										{
											"name": "sessionToken",
											"value": options.sessionToken
										}
									]
								}
							}
						};
					},

					parseResponse: function (resp/*, options*/) {
						return resp.response['function'].data.testSession;
					}
				},

				getDetailsByToken: {
					signInRequired: false,
					buildRequest: function (options, model) {
						return {
							"request": {
								"function": {
									"method": "getDetailsByToken",
									"target": "TestSessionManager",
									"arguments": [
										{
											"name": "token",
											"value": options.token
										}
									]
								}
							}
						};
					},

					parseResponse: function (resp/*, options*/) {
						return resp.response['function'].data.testSession;
					}
				},

				getAll: {
					buildRequest: function (options) {
						return {
							"request": {
								"function": {
									"method": "getAll",
									"target": "TestSessionManager",
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										}
									]
								}
							}
						};
					},

					parseResponse: function (resp/*, options*/) {
						return resp.response['function'].data.testSession;
					}
				},

				getAllByDate: {
					buildRequest: function (options, model) {
						return {
							"request": {
								"function": {
									"method": "getAllByDate",
									"target": "TestSessionManager",
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										},
										{
											"name": "dateFrom",
											"value": model.fromDate
										},
										{
											"name": "dateTo",
											"value": model.toDate
										}
									]
								}
							}
						};
					},

					parseResponse: function (resp/*, options*/) {
						return resp.response['function'].data.testSession;
					}
				},

				getAllShared: {
					buildRequest: function (options, model) {
						return {
							"request": {
								"function": {
									"method": "getAllShared",
									"target": "TestSessionManager",
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										},
										{
											"name": "project",
											"value": model.project
										},
										{
											"name": "user",
											"value": model.userId
										}
									]
								}
							}
						};
					},

					parseResponse: function (resp/*, options*/) {
						return resp.response['function'].data.testSession;
					}
				},

				getAllSharedByDate: {
					buildRequest: function (options, model) {
						return {
							"request": {
								"function": {
									"method": "getAllSharedByDate",
									"target": "TestSessionManager",
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										},
										{
											"name": "project",
											"value": model.project
										},
										{
											"name": "user",
											"value": model.userId
										},
										{
											"name": "dateFrom",
											"value": model.fromDate
										},
										{
											"name": "dateTo",
											"value": model.toDate
										}
									]
								}
							}
						};
					},

					parseResponse: function (resp/*, options*/) {
						return resp.response['function'].data.testSession;
					}
				},

				getAllForUser: {
					buildRequest: function (options, model) {
						return {
							"request": {
								"function": {
									"method": "getAllForUser",
									"target": "TestSessionManager",
									"arguments": [
										{
											"name": "id",
											"value": model.userId
										},
										{
											"name": "sessionToken",
											"value": options.sessionToken
										}
									]
								}
							}
						};
					},

					parseResponse: function (resp, options) {
						return resp.response['function'].data.testSession;
					}
				},

				getAllForUserByDate: {
					buildRequest: function (options, model) {
						return {
							"request": {
								"function": {
									"method": "getAllForUserByDate",
									"target": "TestSessionManager",
									"arguments": [
										{
											"name": "id",
											"value": model.userId
										},
										{
											"name": "sessionToken",
											"value": options.sessionToken
										},
										{
											"name": "dateFrom",
											"value": model.fromDate
										},
										{
											"name": "dateTo",
											"value": model.toDate
										}
									]
								}
							}
						};
					},

					parseResponse: function (resp, options) {
						return resp.response['function'].data.testSession;
					}
				},

				'delete': {
					buildRequest: function (options, models) {
						// Get ids of deleted models
						var ids = _.map(models, function (model) {
							return model.id;
						});

						return {
							"request": {
								"function": {
									"method": "delete",
									"target": "TestSessionManager",
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										},
										{
											"name": "ids",
											"value": ids
										}
									]
								}
							}
						};
					},

					parseResponse: function (/*resp, options*/) {
						return {};
					}
				},


				modifyStatus: {
					buildRequest: function (options) {
						return {
							"request": {
								"function": {
									"method": "modifyStatus",
									"target": "TestSessionManager",
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										},
										{
											"name": "ids",
											"value": options.ids
										},
										{
											"name": "valid",
											"value": options.valid
										}
									]
								}
							}
						};
					},

					parseResponse: function () {
						return {};
					}
				},

				getTestsForExport: {
					buildRequest: function (options) {
						return {
							"request": {
								"function": {
									"method": "getTestsForExport",
									"target": "TestSessionManager",
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										},
										{
											"name": "dateFrom",
											"value": options.from
										},
										{
											"name": "dateTo",
											"value": options.to
										},
										{
											"name": "page",
											"value": options.page
										},
										{
											"name": "size",
											"value": options.size
										}

									]
								}
							}
						};
					},

					parseResponse: function (resp, options) {
						return resp.response['function'].data.testSession;
					}
				},

				getTestsForExportCount: {
					buildRequest: function (options) {
						return {
							"request": {
								"function": {
									"method": "getTestsForExportCount",
									"target": "TestSessionManager",
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										},
										{
											"name": "dateFrom",
											"value": options.from
										},
										{
											"name": "dateTo",
											"value": options.to
										}
									]
								}
							}
						};
					},

					parseResponse: function (resp, options) {
						return resp.response['function'].data.size;
					}
				}


			},

			ProjectManager: {
				getProjectInfoList: {
					signInRequired: false,
					buildRequest: function (options) {
						return {
							"request": {
								"function": {
									"method": "getProjectInfoList",
									"target": "ProjectManager",
									"arguments": []
								}
							}
						};
					},

					parseResponse: function (resp/*, options*/) {
						return resp.response['function'].data.project;
					}
				},

				getProjectInfoById: {
					signInRequired: false,
					buildRequest: function (options) {
						return {
							"request": {
								"function": {
									"method": "getProjectInfoById",
									"target": "ProjectManager",
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										},
										{
											"name": "id",
											"value": options.id
										}
									]
								}
							}
						};
					},

					parseResponse: function (resp/*, options*/) {
						return resp.response['function'].data.project;
					}
				},

				createProject: {
					buildRequest: function (options, model) {
						var attributes = model.toJSON(options);
						var persist = {
							sessionToken: options.sessionToken,
							projectName: attributes.projectName
						};

						var requestArguments = _.map(persist, function (value, key) {
							return { name: key, value: value };
						});


						return {
							"request": {
								"function": {
									"method": "createProject",
									"target": "ProjectManager",
									"arguments": requestArguments
								}
							}
						};
					},

					parseResponse: function (resp/*, options*/) {
						return resp.response['function'].data.id;
					}
				},
				deleteProject: {
					buildRequest: function (options, model) {
						return {
							"request": {
								"function": {
									"method": "deleteProject",
									"target": "ProjectManager",
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										},
										{
											"name": "id",
											"value": model.get("id")
										}
									]
								}
							}
						};
					},

					parseResponse: function (resp/*, options*/) {
						return {};
					}
				},
				modifyProjectStatus: {
					buildRequest: function (options, model) {
						return {
							"request": {
								"function": {
									"method": "modifyProjectStatus",
									"target": "ProjectManager",
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										},
										{
											"name": "id",
											"value": options.id
										},
										{
											name: "disable",
											value: options.disable
										}
									]
								}
							}
						};
					},

					parseResponse: function (resp/*, options*/) {
						return {};
					}
				},
				modifyProjectInfo: {
					buildRequest: function (options, model) {
						return {
							"request": {
								"function": {
									"method": "modifyProjectInfo",
									"target": "ProjectManager",
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										},
										{
											"name": "id",
											"value": options.id
										},
										{
											name: "projectName",
											value: options.name
										}
									]
								}
							}
						};
					},

					parseResponse: function (resp/*, options*/) {
						return {};
					}
				},

				changeProjects: {
					buildRequest: function (options, model) {
						return {
							"request": {
								"function": {
									"method": "changeProjects",
									"target": "ProjectManager",
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										},
										{
											"name": "ids",
											"value": options.ids
										}
									]
								}
							}
						};
					},

					parseResponse: function (resp/*, options*/) {
						return {};
					}
				},

				changeUserProjects: {
					buildRequest: function (options, model) {
						return {
							"request": {
								"function": {
									"method": "changeUserProjects",
									"target": "ProjectManager",
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										},
										{
											"name": "user",
											"value": options.user
										},
										{
											"name": "ids",
											"value": options.ids
										}
									]
								}
							}
						};
					},

					parseResponse: function (resp/*, options*/) {
						return {};
					}
				},

				changeProjectUsers: {
					buildRequest: function (options, model) {
						return {
							"request": {
								"function": {
									"method": "changeProjectUsers",
									"target": "ProjectManager",
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										},
										{
											"name": "project",
											"value": options.project
										},
										{
											"name": "ids",
											"value": options.ids
										}
									]
								}
							}
						};
					},

					parseResponse: function (resp/*, options*/) {
						return {};
					}
				},

				switchProject: {
					buildRequest: function (options, model) {
						return {
							"request": {
								"function": {
									"method": "switchProject",
									"target": "ProjectManager",
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										},
										{
											"name": "id",
											"value": options.id
										}
									]
								}
							}
						};
					},

					parseResponse: function (resp/*, options*/) {
						return {};
					}
				}

			},

			ExtensionManager: {
				changeList: {
					buildRequest: function (options, model) {
						return {
							"request": {
								"function": {
									"method": "modifyListExtension",
									"target": "ExtensionManager",
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										},
										{
											"name": "id",
											"value": model.get("id")
										},
										{
											"name": "listdata",
											"value": model.get("list")
										}
									]
								}
							}
						};
					},

					parseResponse: function (resp) {
						return {};
					}
				},
				changeProperties: {
					buildRequest: function (options, model) {
						return {
							"request": {
								"function": {
									"method": "modifyExtensionProperties",
									"target": "ExtensionManager",
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										},
										{
											"name": "id",
											"value": model.get("id")
										},
										{
											"name": "properties",
											"value": model.get("properties")
										}
									]
								}
							}
						};
					},

					parseResponse: function (resp) {
						return {};
					}
				},
				createListExtension: {
					buildRequest: function (options, model) {
						return {
							"request": {
								"function": {
									"method": "addListExtension",
									"target": "ExtensionManager",
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										},
										{
											"name": "name",
											"value": model.get("name")
										},
										{
											"name": "entity",
											"value": model.get("entity")
										},
										{
											"name": "listdata",
											"value": model.get("listdata")
										},
										{
											"name": "properties",
											"value": model.get("properties")
										}
									]
								}
							}
						};
					},

					parseResponse: function (resp) {
						return {};
					}
				},
				createSimpleExtension: {
					buildRequest: function (options, model) {
						return {
							"request": {
								"function": {
									"method": "addExtension",
									"target": "ExtensionManager",
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										},
										{
											"name": "name",
											"value": model.get("name")
										},
										{
											"name": "entity",
											"value": model.get("entity")
										},
										{
											"name": "type",
											"value": model.get("type")
										},
										{
											"name": "properties",
											"value": model.get("properties")
										}
									]
								}
							}
						};
					},

					parseResponse: function (resp) {
						return {};
					}
				},
				deleteExtension: {
					buildRequest: function (options, model) {
						return {
							"request": {
								"function": {
									"method": "deleteExtension",
									"target": "ExtensionManager",
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										},
										{
											"name": "ids",
											"value": [model.get("id")]
										}
									]
								}
							}
						};
					},

					parseResponse: function (resp) {
						return {};
					}
				},
				getAll: {
					buildRequest: function (options, model) {
						return {
							"request": {
								"function": {
									"method": "getAllExtensions",
									"target": "ExtensionManager",
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										}
									]
								}
							}
						};
					},

					parseResponse: function (resp) {
						return resp.response['function'].data.extension;
					}
				},
				modifyExtensionName: {
					buildRequest: function (options, model) {
						return {
							"request": {
								"function": {
									"method": "modifyExtensionName",
									"target": "ExtensionManager",
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										},
										{
											"name": "id",
											"value": model.get("id")
										},
										{
											"name": "name",
											"value": model.get("name")
										}
									]
								}
							}
						};
					},

					parseResponse: function (resp) {
						return {};
					}
				}
			},

			SharingManager: {
				addEmail: {
					buildRequest: function (options, model) {
						return {
							"request": {
								"function": {
									"method": "addEmail",
									"target": "SharingManager",
									"timestamp": null,
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										},
										{
											"name": "email",
											"value": model.get('shareData')
										}
									]
								}
							}
						};
					},
					parseResponse: function (resp) {
						return {};
					}
				},

				removeEmail: {
					buildRequest: function (options, model) {
						return {
							"request": {
								"function": {
									"method": "removeEmail",
									"target": "SharingManager",
									"timestamp": null,
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										},
										{
											"name": "email",
											"value": [options.email]
										}
									]
								}
							}
						};
					},
					parseResponse: function (resp) {
						return {};
					}
				},
				leaveTests: {
					buildRequest: function (options, model) {
						return {
							"request": {
								"function": {
									"method": "leaveTests",
									"target": "SharingManager",
									"timestamp": null,
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										},
										{
											"name": "user",
											"value": options.user
										},
										{
											"name": "project",
											"value": options.project
										}
									]
								}
							}
						};
					},
					parseResponse: function (resp) {
						return {};
					}
				},

				getAllShareInfo: {
					buildRequest: function (options, model) {
						return {
							"request": {
								"function": {
									"method": "getAllShareInfo",
									"target": "SharingManager",
									"timestamp": null,
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										}
									]
								}
							}
						};
					},
					parseResponse: function (resp) {
						return resp.response['function'].data.shareData;
					}
				},

				checkToken: {
					buildRequest: function (options, model) {
						return {
							"request": {
								"function": {
									"method": "checkToken",
									"target": "SharingManager",
									"timestamp": null,
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										},
										{
											"name": "id",
											"value": options.id
										}
									]
								}
							}
						};
					},
					parseResponse: function (resp) {
						return resp.response['function'].data.token;
					}
				},

				generateToken: {
					buildRequest: function (options, model) {
						return {
							"request": {
								"function": {
									"method": "generateToken",
									"target": "SharingManager",
									"timestamp": null,
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										},
										{
											"name": "id",
											"value": options.id
										}

									]
								}
							}
						};
					},
					parseResponse: function (resp) {
						return resp.response['function'].data.token;
					}
				},

				dropToken: {
					buildRequest: function (options, model) {
						return {
							"request": {
								"function": {
									"method": "dropToken",
									"target": "SharingManager",
									"timestamp": null,
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										},
										{
											"name": "id",
											"value": options.id
										}
									]
								}
							}
						};
					},
					parseResponse: function (resp) {
						return {};
					}
				},

				shareByMail: {
					buildRequest: function (options, model) {
						return {
							"request": {
								"function": {
									"method": "shareByMail",
									"target": "SharingManager",
									"timestamp": null,
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										},
										{
											"name": "message",
											"value": options.message
										},
										{
											"name": "email",
											"value": options.email
										},
										{
											"name": "urlPath",
											"value": options.urlPath
										}
									]
								}
							}
						};
					},
					parseResponse: function (resp) {
						return {};
					}
				}



			},

			AuditManager: {
				getAuditEvents: {
					buildRequest: function (options, model) {
						return {
							"request": {
								"function": {
									"method": "getAuditEvents",
									"target": "AuditManager",
									"timestamp": null,
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										}
									]
								}
							}
						};
					},
					parseResponse: function (resp) {
						return resp.response['function'].data.type;
					}
				},

				getAuditData: {
					buildRequest: function (options, model) {
						return {
							"request": {
								"function": {
									"method": "getAuditData",
									"target": "AuditManager",
									"timestamp": null,
									"arguments": [
										{
											"name": "sessionToken",
											"value": options.sessionToken
										},
										{
											"name": "dateFrom",
											"value": options.from
										},
										{
											"name": "dateTo",
											"value": options.to
										},
										{
											"name": "type",
											"value": options.eventType
										}
									]
								}
							}
						};
					},
					parseResponse: function (resp) {
						return resp.response['function'].data.auditData;
					}
				}

			}
		};
	}
);
