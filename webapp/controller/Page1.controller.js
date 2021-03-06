sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/m/MessageBox",
		"./utilities",
		"sap/ui/core/routing/History"
	], function (BaseController, MessageBox, Utilities, History) {
		"use strict";
		return BaseController.extend("com.sap.build.standard.untitledPrototype.controller.Page1", {
			handleRouteMatched: function (oEvent) {
				var oParams = oEvent.getParameters();
				this.currentRouteName = oParams.name;
				var sContext;
				if (oParams.arguments.beginContext) {
					sContext = oParams.arguments.beginContext;
				} else {
					if (this.getOwnerComponent().getComponentData()) {
						var patternConvert = function (oParam) {
							if (Object.keys(oParam).length !== 0) {
								for (var prop in oParam) {
									if (prop !== "sourcePrototype") {
										return prop + "(" + oParam[prop][0] + ")";
									}
								}
							}
						};
						sContext = patternConvert(this.getOwnerComponent().getComponentData().startupParameters);
					}
				}
				var sContextModelProperty = "/beginContext";
				if (sContext) {
					var oPath = {
						path: "/" + sContext,
						parameters: {}
					};
					this.getView().bindObject(oPath);
					this.oFclModel.setProperty(sContextModelProperty, sContext);
				}
				this.oView.getModel("fclButton").setProperty("/visible", false);
				if (oEvent.mParameters.arguments.layout && oEvent.mParameters.arguments.layout.includes("FullScreen")) {
					this.oFclModel.setProperty("/expandIcon/img", "sap-icon://exit-full-screen");
					this.oFclModel.setProperty("/expandIcon/tooltip", "Exit Full Screen Mode");
				} else {
					this.oFclModel.setProperty("/expandIcon/img", "sap-icon://full-screen");
					this.oFclModel.setProperty("/expandIcon/tooltip", "Enter Full Screen Mode");
				}
			},
			_onObjectListItemPress: function (oEvent) {
				debugger;
				var oBindingContext = oEvent.getParameter("listItem").getBindingContext();
				return new Promise(function (fnResolve) {
					this.doNavigate("Page4", oBindingContext, fnResolve, "", 0);
				}.bind(this)).catch(function (err) {
					if (err !== undefined) {
						MessageBox.error(err.message);
					}
				});
			},
			doNavigate: function (sRouteName, oBindingContext, fnPromiseResolve, sViaRelation, iNextLevel) {
				debugger;
				var sPath = oBindingContext ? oBindingContext.getPath() : null;
				var oModel = oBindingContext ? oBindingContext.getModel() : null;
				var routePattern = this.oRouter.getRoute(sRouteName).getPattern().split("/");
				var contextFilter = new RegExp("^:.+:$");
				var pagePattern = routePattern.filter(function (pattern) {
					var contextPattern = pattern.match(contextFilter);
					return contextPattern === null || contextPattern === undefined;
				});
				iNextLevel = iNextLevel !== undefined ? iNextLevel : pagePattern ? pagePattern.length - 1 : 0;
				this.oFclModel = this.oFclModel ? this.oFclModel : this.getOwnerComponent().getModel("FclRouter");
				var sEntityNameSet;
				var oNextUIState = this.getOwnerComponent().getSemanticHelper().getNextUIState(iNextLevel);
				var sBeginContext, sMidContext, sEndContext;
				if (iNextLevel === 0) {
					sBeginContext = sPath;
				}
				if (iNextLevel === 1) {
					sBeginContext = this.oFclModel.getProperty("/beginContext");
					sMidContext = sPath;
				}
				if (iNextLevel === 2) {
					sBeginContext = this.oFclModel.getProperty("/beginContext");
					sMidContext = this.oFclModel.getProperty("/midContext");
					sEndContext = sPath;
				}
				var sNextLayout = oNextUIState.layout;
				if (sPath !== null && sPath !== "") {
					if (sPath.substring(0, 1) === "/") {
						debugger;
						sPath = sPath.substring(1);
						if (iNextLevel === 0) {
							sBeginContext = sPath;
						} else if (iNextLevel === 1) {
							sMidContext = sPath;
						} else {
							sEndContext = sPath;
						}
					}
					sEntityNameSet = sPath.split("(")[0];
				}
				var sNavigationPropertyName;
				if (sEntityNameSet !== null) {
					sNavigationPropertyName = sViaRelation || this.getOwnerComponent().getNavigationPropertyForNavigationWithContext(sEntityNameSet,
						sRouteName);
				}
				if (sNavigationPropertyName !== null && sNavigationPropertyName !== undefined) {
					if (sNavigationPropertyName === "") {
						this.oRouter.navTo(sRouteName, {
							beginContext: sBeginContext,
							midContext: sMidContext,
							endContext: sEndContext,
							layout: sNextLayout
						}, false);
					} else {
						oModel.createBindingContext(sNavigationPropertyName, oBindingContext, null, function (bindingContext) {
							if (bindingContext) {
								sPath = bindingContext.getPath();
								if (sPath.substring(0, 1) === "/") {
									sPath = sPath.substring(1);
								}
							} else {
								sPath = "undefined";
							}
							if (iNextLevel === 0) {
								sBeginContext = sPath;
							} else if (iNextLevel === 1) {
								sMidContext = sPath;
							} else {
								sEndContext = sPath;
							}
							// If the navigation is a 1-n, sPath would be "undefined" as this is not supported in Build
							if (sPath === "undefined") {
								this.oRouter.navTo(sRouteName, {
									layout: sNextLayout
								});
							} else {
								this.oRouter.navTo(sRouteName, {
									beginContext: sBeginContext,
									midContext: sMidContext,
									endContext: sEndContext,
									layout: sNextLayout
								}, false);
							}
						}.bind(this));
					}
				} else {
					this.oRouter.navTo(sRouteName, {
						layout: sNextLayout
					});
				}
				if (typeof fnPromiseResolve === "function") {
					fnPromiseResolve();
				}
			},
			_onExpandButtonPress: function () {
				var endColumn = this.getOwnerComponent().getSemanticHelper().getCurrentUIState().columnsVisibility.endColumn;
				var isFullScreen = this.getOwnerComponent().getSemanticHelper().getCurrentUIState().isFullScreen;
				var nextLayout;
				var actionsButtonsInfo = this.getOwnerComponent().getSemanticHelper().getCurrentUIState().actionButtonsInfo;
				if (endColumn && isFullScreen) {
					nextLayout = actionsButtonsInfo.endColumn.exitFullScreen;
					nextLayout = nextLayout ? nextLayout : this.getOwnerComponent().getSemanticHelper().getNextUIState(2).layout;
				}
				if (!endColumn && isFullScreen) {
					nextLayout = actionsButtonsInfo.midColumn.exitFullScreen;
					nextLayout = nextLayout ? nextLayout : this.getOwnerComponent().getSemanticHelper().getNextUIState(1).layout;
				}
				if (endColumn && !isFullScreen) {
					nextLayout = actionsButtonsInfo.endColumn.fullScreen;
					nextLayout = nextLayout ? nextLayout : this.getOwnerComponent().getSemanticHelper().getNextUIState(3).layout;
				}
				if (!endColumn && !isFullScreen) {
					nextLayout = actionsButtonsInfo.midColumn.fullScreen;
					nextLayout = nextLayout ? nextLayout : "MidColumnFullScreen";
				}
				var pageName = this.oView.sViewName.split(".");
				pageName = pageName[pageName.length - 1];
				this.oRouter.navTo(pageName, {
					layout: nextLayout
				});
			},
			_onCloseButtonPress: function () {
				var endColumn = this.getOwnerComponent().getSemanticHelper().getCurrentUIState().columnsVisibility.endColumn;
				var nextPage;
				var nextLevel = 0;
				var actionsButtonsInfo = this.getOwnerComponent().getSemanticHelper().getCurrentUIState().actionButtonsInfo;
				var nextLayout = actionsButtonsInfo.midColumn.closeColumn;
				nextLayout = nextLayout ? nextLayout : this.getOwnerComponent().getSemanticHelper().getNextUIState(0).layout;
				if (endColumn) {
					nextLevel = 1;
					nextLayout = actionsButtonsInfo.endColumn.closeColumn;
					nextLayout = nextLayout ? nextLayout : this.getOwnerComponent().getSemanticHelper().getNextUIState(1).layout;
				}
				var pageName = this.oView.sViewName.split(".");
				pageName = pageName[pageName.length - 1];
				var routePattern = this.oRouter.getRoute(pageName).getPattern().split("/");
				var contextFilter = new RegExp("^:.+:$");
				var pagePattern = routePattern.filter(function (pattern) {
					var contextPattern = pattern.match(contextFilter);
					return contextPattern === null || contextPattern === undefined;
				});
				var nextPage = pagePattern[nextLevel];
				this.oRouter.navTo(nextPage, {
					layout: nextLayout
				});
			},
			onInit: function () {
				this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				this.oRouter.attachRouteMatched(this.handleRouteMatched, this);
				this.oFclModel = this.getOwnerComponent().getModel("FclRouter");
				this.oFclModel.setProperty("/targetAggregation", "beginColumnPages");
				this.oFclModel.setProperty("/expandIcon", {});
				this.oView.setModel(new sap.ui.model.json.JSONModel({}), "fclButton");
			},
			/**
			 *@memberOf com.sap.build.standard.untitledPrototype.controller.Page1
			 */
			_onShearch: function (oEvent) {
				debugger;
				var hie = this.getView().byId("Part").getValue();
				var hie1 = this.getView().byId("name").getValue();
				var hie2 = this.getView().byId("lname").getValue();
				var hie3 = this.getView().byId("Part").getValue();
				var oView;
				//This code was generated by the layout editor.
				oView = this.getView();
				var patha = "/BUT000BPSet('" + hie + "')";
				var patha1 = "/BUT000BPSet(Partner='" + hie + "',BuSort1='" + hie1 + "',BuSort2='" + hie2 + "')";
				oView.bindElement({
					path: "/BUT000BPSet(Partner='" + hie + "',BuSort1='" + hie1 + "',BuSort2='" + hie2 + "')",
					parameters: {
						expand: "BPTOBP"
					},
					events: {
						//	change: this._onBindingChange.bind(this),
						dataRequested: function (oEvent) {
							oView.setBusy(true);
						},
						dataReceived: function (oEvent) {
							oView.setBusy(false);
						}
					}
				});
			},
			/**
			 *@memberOf com.sap.build.standard.untitledPrototype.controller.Page1
			 */
			onCreate: function (oEvent) {
				debugger;
				//This code was generated by the layout editor.
				var oName = this.getView().byId("name").getValue();
				var oLname = this.getView().byId("lname").getValue();
				var oCp = this.getView().byId("CP").getValue();

				var uploadQuoteData = {
					"NameFirst": oName,
					"NameLast": oLname,
					"Location1": oCp
				};

				// Set Data to ODataModel
			

				this.getView().getModel().create("/BUT000BPSet", uploadQuoteData, {

					success: function (uploadQuoteData) {

						sap.m.MessageBox.show("Quotation Uploaded successfully ", {

							icon: sap.m.MessageBox.Icon.SUCCESS,

							title: "Success",

							actions: [sap.m.MessageBox.Action.OK],

							onClose: function (oAction) {

								// Close the window.

							}

						});

					},

					error: function (oError) {

						sap.m.MessageBox.show(JSON.stringify(oError.message), {

							icon: sap.m.MessageBox.Icon.ERROR,

							title: "Error",

							actions: [sap.m.MessageBox.Action.OK]

						});

					}

				});
			}
		});
	}, /* bExport= */
	true);