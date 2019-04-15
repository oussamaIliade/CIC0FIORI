sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"sap/f/FlexibleColumnLayoutSemanticHelper",
	"com/sap/build/standard/untitledPrototype/model/models"

], function(UIComponent, Device, FlexibleColumnLayoutSemanticHelper, models) {
	"use strict";

	var navigationWithContext = {

	};

	return UIComponent.extend("com.sap.build.standard.untitledPrototype.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * In this method, the FLP and device models are set and the router is initialized.
		 * @public
		 * @override
		 */
		init: function() {
			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			// set the FLP model
			this.setModel(models.createFLPModel(), "FLP");

			// set the dataSource model
			this.setModel(new sap.ui.model.json.JSONModel({}), "dataSource");

			// set application model
			var oApplicationModel = new sap.ui.model.json.JSONModel({});
			this.setModel(oApplicationModel, "applicationModel");
			// set FCL model
			var oFclRouterModel = new sap.ui.model.json.JSONModel();
			this.setModel(oFclRouterModel, "FclRouter");
			////////// -APIPortal
			var sModelUriApiPortal = "/apihub_sandbox/apimanagement/apiportal/api/1.0/Management.svc";
			var oModelApiPortal = new sap.ui.model.odata.v2.ODataModel(sModelUriApiPortal, {
				refreshAfterChange: false,
				defaultBindingMode: sap.ui.model.BindingMode.TwoWay,
				useBatch: true,
				disableHeadRequestForToken: true
			});
			this.setModel(oModelApiPortal, "-APIPortal");

			////////// -C4C_Employee
			var sModelUriC4CEmployee = "/apihub_sandbox/c4c/sap/byd/odata/v1/c4codata";
			var oModelC4CEmployee = new sap.ui.model.odata.v2.ODataModel(sModelUriC4CEmployee, {
				refreshAfterChange: false,
				defaultBindingMode: sap.ui.model.BindingMode.TwoWay,
				useBatch: true,
				disableHeadRequestForToken: true
			});
			this.setModel(oModelC4CEmployee, "-C4C_Employee");

			// call the base component's init function and create the App view
			UIComponent.prototype.init.apply(this, arguments);

			// create the views based on the url/hash
			this.getRouter().initialize();
		},

		/**
		 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
		 * design mode class should be set, which influences the size appearance of some controls.
		 * @public
		 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
		 */
		getContentDensityClass: function() {
			if (this._sContentDensityClass === undefined) {
				// check whether FLP has already set the content density class; do nothing in this case
				if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
					this._sContentDensityClass = "";
				} else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		},

		getNavigationPropertyForNavigationWithContext: function(sEntityNameSet, targetPageName) {
			var entityNavigations = navigationWithContext[sEntityNameSet];
			return entityNavigations == null ? null : entityNavigations[targetPageName];
		},

		/**
		 * Returns an instance of the semantic helper
		 * @returns {sap.f.FlexibleColumnLayoutSemanticHelper} An instance of the semantic helper
		 */
		getSemanticHelper: function() {
			var oFCL = this.getRootControl().byId("idAppControl"),
				oSettings = {
					defaultTwoColumnLayoutType: sap.f.LayoutType.TwoColumnsMidExpanded,
					defaultThreeColumnLayoutType: sap.f.LayoutType.ThreeColumnsEndExpanded
				};
			return FlexibleColumnLayoutSemanticHelper.getInstanceFor(oFCL, oSettings);
		}

	});

});
