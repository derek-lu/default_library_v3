/**
 * The main file to start the library.
 */

$(document).ready(function() {
	// Removes the 300ms delay for click events.
	FastClick.attach(document.body);
	
	// Specify an absolute path for development so a new IPA does not have to be created for each change.
	var path = "";//"http://lighthouse.adobe.com/users/derek/default_library_v3/";
	
	var jsFiles = [path + "js/controls/DropDown.js?r=" + Math.random(), 				// Drop down that displays a list of items to select from.
	               path + "js/controls/FlipSwitch.js?r=" + Math.random(),				// Horizontal switch that toggles between off and on.
	               path + "js/model/LibraryCollection.js?r=" + Math.random(),			// Collection which stores the folio data for the library.
	               path + "js/view/archive/ArchiveFolioItemView.js?r=" + Math.random(),	// The folio item view for archiving.
	               path + "js/view/archive/ArchiveView.js?r=" + Math.random(),			// The view for archiving folios.
	               path + "js/view/dialogs/LoginDialog.js?r=" + Math.random(),			// Dialog used to display the login form.
	               path + "js/view/dialogs/PreviewDialog.js?r=" + Math.random(),		// Dialog used to display the folio preview.
	               path + "js/view/dialogs/RestoreDialog.js?r=" + Math.random(),		// Dialog used to display "restore purchases" confirmation.
	               path + "js/view/dialogs/SubscribeDialog.js?r=" + Math.random(),		// Dialog used to display the subscription options.
	               path + "js/view/folioItems/FolioItemView.js?r=" + Math.random(),		// Item renderer used to display a folio in the grid.
	               path + "js/view/section/SectionFolioItemView.js?r=" + Math.random(),	// The folio item view for sections.
	               path + "js/view/section/SectionsView.js?r=" + Math.random(),			// The view for downloading sections.
	               path + "js/view/AppView.js?r=" + Math.random(),						// The application file which handles the main view.
	               path + "js/Config.js?r=" + Math.random()];							// The config data for the application.
	
	var css = path + "styles.css?r=" + Math.random();
	
	var jsFilesLoaded = 0;
	var isOnline = false;
	
	function init() {
		if (typeof adobeDPS == "undefined") { // testing on the desktop.
			loadAssets();
		} else {
			// Check to see if there is an internet connection.
			$.ajax({
				type: "HEAD",
				url: "http://stats.adobe.com/",
				success: function() {
					isOnline = true;
					loadAssets();
				},
				
				// Unable to connect.
				error: function() {
					loadAssets();
				}
			})
		}
	}
	
	function loadAssets() {
		// Load the stylesheet.
		var el = document.createElement("link");
		el.setAttribute("rel", "stylesheet");
		el.setAttribute("type", "text/css");
		el.setAttribute("href", css);
		document.getElementsByTagName("head")[0].appendChild(el);
		
		loadJavaScriptFile(0);
	}
	
	function loadJavaScriptFile(index) {
		var path = jsFiles[index];
		var script = document.getElementsByTagName("script")[0];
		var el = document.createElement("script");
		el.onload = javascriptLoadHandler; 
		el.src = path;
		script.parentNode.insertBefore(el, script);
	}
	
	function javascriptLoadHandler() {
		jsFilesLoaded += 1;
		if (jsFilesLoaded == jsFiles.length) {
			new ADOBE.AppView(typeof adobeDPS != "undefined", isOnline);
		} else {
			loadJavaScriptFile(jsFilesLoaded);
		}
	}

	// To test on the desktop remove the JavaScript include for AdobeLibraryAPI.js.
	if (typeof adobeDPS == "undefined") // Call init() immediately. This will be the case for dev on the desktop.
		init(); 
	else								// API is available so wait for adobeDPS.initializationComplete.
		adobeDPS.initializationComplete.addOnce(function(){ init() });
});