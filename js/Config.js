var ADOBE = ADOBE || {};

ADOBE.Config = {
	// Whether or not this is an entitlement viewer. If true, then display the signin button and banner, otherwise do not.
	// This should be updated by the publisher.
	IS_ENTITLEMENT_VIEWER: true,
	
	BANNER_TARGET_URL: "",
	
	CREATE_ACCOUNT_URL: "",
	
	FORGOT_PASSWORD_URL: "",
	
	// Used to get the folios when testing on the desktop since the API is not available.
	// The value after "accountId=" should be updated with the publisher account id.
	// To get your account id, go to http://lighthouse.adobe.com/dps/entitlement/.
	// The actual URL for the fulfillment xml is http://edge.adobe-dcfs.com/ddp/issueServer/issues?accountId=,
	// but Safari 6 does not allow x-domain requests from local files anymore so a proxy has been created
	// with a CORS header to allow access from local files.
	FULFILLMENT_URL: "http://www.dpsapps.com/dps/v2_library_store_templates/fulfillment_proxy.php?accountId=ed04c68418b74672a98fdcbbb2d90878",

	IS_HEADER_TEXT: true,
	
	// Flag to determine whether or not a folio will automatically open when enough of it has been downloaded.
	IS_AUTO_OPEN_DOWNLOADED_FOLIO: true,

	VERSION: .1
}
