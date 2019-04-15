sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/routing/History"
	], function (BaseController, JSONModel, History) {
		"use strict";

		return BaseController.extend("com.sap.build.standard.untitledPrototype.controller.App", {

			onInit : function () {
				var oViewModel,
					oListSelector = this.getOwnerComponent().oListSelector,
					iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

				oViewModel = new JSONModel({
					busy : true,
					delay : 0
				});
				this.getView().setModel(oViewModel, "appView");

                // apply content density mode to root view
                this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
                //FCL
                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.attachRouteMatched(this.onRouteMatched, this);
                this.oFclModel = this.getOwnerComponent().getModel("FclRouter");
            
                return new Promise(function (fnResolve) {
                    
                    var oModel, aPromises = [];
                    var aModelNames = ["-APIPortal", "-C4C_Employee"];
                    for (var i = 0; i < aModelNames.length; i++) {
                        oModel = this.getOwnerComponent().getModel(aModelNames[i]);
                        aPromises.push(oModel.metadataLoaded);
                    }
                    return Promise.all(aPromises).then(function () {
                        oViewModel.setProperty("/busy", false);
                        oViewModel.setProperty("/delay", iOriginalBusyDelay);
                        fnResolve();
                    });
                }.bind(this));
			},

			onRouteMatched: function (oEvent) {
                var sRouteName = oEvent.getParameter("name");
            	var sLayout = oEvent.getParameters().arguments.layout;
            	this._updateUIState(sLayout);
            	this.currentRouteName = sRouteName;
            },

            onStateChanged: function (oEvent) {
            	var bIsNavigationArrow = oEvent.getParameter("isNavigationArrow"),
            	sLayout = oEvent.getParameter("layout"),
            	sBeginContext = this.oFclModel.getProperty("/beginContext"),
            	sMidContext = this.oFclModel.getProperty("/midContext"),
            	sEndContext = this.oFclModel.getProperty("/endContext");

            	if (bIsNavigationArrow) {
            	    var oNavProperties = {
            		    layout: sLayout,
            		    beginContext: sBeginContext,
            			midContext: sMidContext,
            			endContext: sEndContext
            	    };
            		this.oRouter.navTo(this.currentRouteName, oNavProperties, true);
            	}
            },

            _updateUIState: function (sNewLayout) {
                var oUIState = this.getOwnerComponent().getSemanticHelper().getCurrentUIState();
            	this.oFclModel.setProperty('/uiState', oUIState);
            	this.oFclModel.setProperty("/uiState/layout", sNewLayout);
            }
		});
	}
);
