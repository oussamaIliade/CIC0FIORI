function initModel() {
	var sUrl = "/CB1/sap/opu/odata/sap/Z_LUI5_CIC_FIORI_BUT000_SRV_01/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}