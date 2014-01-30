/**
 * The main application file.
 */
var ADOBE = ADOBE || {};

ADOBE.AppView = Backbone.View.extend({
	el: $("body"),

	// Stores the FolioItemView instances.
	folioItemViewArray: [],
	
	// Displays the grid of folios.
	$grid: null,
	
	// Collection of folios.
	libraryCollection: null,
	
	// The HTML for the subscribe buttons.
	subscriptions: "",
	
	isOnline: false,
	
	showMore: null,
	
	folios: null,
	
	// The number of folios to add for each page.
	foliosPerPage: 9,
	
	subscribeDialog: null,
	
	// Whether or not a subscription is active.
	isSubscriptionActive: false,
	
	// Whether or not the user owns the most recent folio.
	userOwnsLatestFolio: false,

	LBL_SIGN_OUT: "Sign Out",
	LBL_SIGN_IN: "Sign In",
	LBL_RESTORE_ALL_PURCHASES: "Restore All Purchases",
	LBL_REMOVE_ISSUES_FROM_IPAD: "Remove Issues from iPad",
	
	initialize: function(isAPIAvailable, isOnline) {
		// Set a flag for the API availability in the ADOBE namespace.
		ADOBE.isAPIAvailable = isAPIAvailable;
		
		$("body").append("<div id='header'><div id='spinner-title'><div id='spinner' class='spinner'></div>Updating Library...</div></div>");
		
		// Options for the indeterminate spinner.
		var opts = {
				  lines: 13, // The number of lines to draw
				  length: 3, // The length of each line
				  width: 2, // The line thickness
				  radius: 6, // The radius of the inner circle
				  corners: 0, // Corner roundness (0..1)
				  rotate: 0, // The rotation offset
				  direction: 1, // 1: clockwise, -1: counterclockwise
				  color: '#000000', // #rgb or #rrggbb
				  speed: 1, // Rounds per second
				  trail: 60, // Afterglow percentage
				  shadow: false, // Whether to render a shadow
				  hwaccel: false, // Whether to use hardware acceleration
				  className: 'spinner', // The CSS class to assign to the spinner
				  zIndex: 2e9, // The z-index (defaults to 2000000000)
				  top: -1, // Top position relative to parent in px
				  left: 92 // Left position relative to parent in px
				};
		var target = document.getElementById("spinner");
		var spinner = new Spinner(opts).spin(target);
		
		this.isOnline = isOnline;

		if (isAPIAvailable) {
			var transaction = adobeDPS.libraryService.updateLibrary();
			transaction.completedSignal.addOnce(this.updateLibraryHandler, this);
		} else { // Testing on the desktop.
			this.updateLibraryHandler();
		}
	},
	
	updateLibraryHandler: function() {		
		var loginLbl;
		if (ADOBE.isAPIAvailable) {
			// Put the FolioStates in the ADOBE namespace for easier lookup later.
			ADOBE.FolioStates = adobeDPS.libraryService.folioStates;
			
			this.folios = [];
			// Sort the folios descending.
			var list = adobeDPS.libraryService.folioMap.sort(function (a, b) {
				if (a.publicationDate < b.publicationDate)
					return 1;
				else if (a.publicationDate > b.publicationDate)
					return -1;
				else
					return 0;
			});
	 
			// list is an associative array so put them in a regular array.
			for (var i in list) {
				var folio = list[i];
				if (this.isOnline) { // User is online so display all the folios.
					this.folios.push(folio);
				} else {			// User is offline so only display the installed folios.
					if (folio.state == ADOBE.FolioStates.INSTALLED)
						this.folios.push(folio);
				}
			}
			
			// If the latest folio is not purchasable then the user is entitled to it.
			// If true then do not display the subscription button.
			if (this.folios.length > 0) {
				var latestFolio = this.folios[0];
				this.userOwnsLatestFolio = !(latestFolio.state == ADOBE.FolioStates.PURCHASABLE || latestFolio.state == ADOBE.FolioStates.UNAVAILABLE || latestFolio.state == ADOBE.FolioStates.INVALID);
			} else if (!this.isOnline) { // Folio list is empty and user is not online.
				alert("Unable to connect to the internet.");
			}

			if (!this.userOwnsLatestFolio) {
				// Loop through the subscriptions and populate the buttons.
				var availableSubscriptions = adobeDPS.receiptService.availableSubscriptions;
				for (var s in availableSubscriptions) {
					var availableSubscription = availableSubscriptions[s];
					if (availableSubscription.isActive()) { // Users owns a subscription so do not display the subscription menu option. 
						this.isSubscriptionActive = true;
						break;
					} else { // Create a string for the subscription buttons.
						this.subscriptions += "<div class='subscribe-button' id='" + availableSubscription.productId + "'>" + availableSubscription.duration + " subscription for " + availableSubscription.price + "</div>";
						this.isSubscriptionActive = false;
					}
				}
			}
			
			// Determine the login label for the drop down menu.
			loginLbl = adobeDPS.authenticationService.isUserAuthenticated ? this.LBL_SIGN_OUT: this.LBL_SIGN_IN;
		} else { // Placeholder values for testing on the desktop.
			this.subscriptions += "<div class='subscribe-button' id='1year'>1 Year Subscription for $12.99</div>";
			this.subscriptions += "<div class='subscribe-button' id='1month'>1 Month Subscription for $1.99</div>";
			loginLbl = this.LBL_SIGN_IN;
		}
		
		var html = "";

		if (ADOBE.Config.IS_ENTITLEMENT_VIEWER) {
			// Displays the entitlement banner if this is an entitlement viewer.
			// Code should be added to allow a user to register. Keep in mind that
			// <a> tags open in the current window.
			html += "<div id='banner'>";
			html += "</div>"
		}

			html += "<div id='header'>";
			html += 	"<div id='header-left-column-container'>";
		
		// If API is not available then testing on the desktop so show the button, otherwise only if this is an entitlement viewer.
		if (!ADOBE.isAPIAvailable || ADOBE.Config.IS_ENTITLEMENT_VIEWER)
			html +=     	"<div class='text-link' id='print-subscriber-login'>" + loginLbl + "</div>";

		// If API is not available then testing on the desktop so show the button, otherwise only if the user doesn't own the latest folio and doesn't have an active subscription.
		if (!ADOBE.isAPIAvailable || (!this.userOwnsLatestFolio && !this.isSubscriptionActive))
			html +=     	"<div class='text-link' id='subscribe'>Subscribe</div>";

			html +=		"</div>";

			
		if (ADOBE.Config.IS_HEADER_TEXT)
			html +=		"<div id='title'>Local</div>";
		else
			html +=		"<img id='title-image' src=''>";
			
			html +=     "<div class='drop-down' id='header-drop-down'>";
			html +=         "<div id='restore-all-purchases'>" + this.LBL_RESTORE_ALL_PURCHASES + "</div>";
		
			html +=         "<div id='remove-issues-from-ipad'>" + this.LBL_REMOVE_ISSUES_FROM_IPAD + "</div>";

		// If testing on desktop then include the switch otherwise make sure it is supported.
		if (!ADOBE.isAPIAvailable || adobeDPS.settingsService.autoArchive.isSupported)
			html +=     	"<div id='auto-archive' class='flip-switch' state='" + (!ADOBE.isAPIAvailable || adobeDPS.settingsService.autoArchive.isEnabled ? "on" : "off") + "'>Auto Archive</div>";

			html +=     "</div>";
		    html += "</div>";

		    // The container to hold the grid of folios.
		    html += "<div id='grid'>";
			html += 	"<div id='loading'>Loading...</div>";
		    html += "</div>"
		    html += "<div class='text-link' id='show-more'>Show More</div>"

		// Uncomment the textarea below to enable debug output via debug().
		//html += "<textarea class='debug'></textarea>";
		window.debug = function(value) {
			$(".debug").val($(".debug").val() + ($(".debug").val() == "" ? "" : "\n") + value);
		}
		
		// Remove the header that contains the "updating library" message.
		$("#header").remove();
		
		$("body").html(html);
		
		this.$grid = $("#grid");
		
		// Entitlement banner isn't displayed so add spacing.
		if (!ADOBE.Config.IS_ENTITLEMENT_VIEWER) {
			this.$grid.css("margin-top", 82);
		} else {
			$("#banner").on("click", function() { adobeDPS.dialogService.open(ADOBE.Config.BANNER_TARGET_URL) });
		}
		
		$("#header-drop-down").dropDown({verticalGap: -20});
		
		this.showMore = $("#show-more");
		
		var scope = this;
		
		// Handler for the auto archive switch in the drop down.
		$("body").on("change", "#auto-archive", function(e, isOn){ scope.autoArchive_changeHandler(e, isOn) });

		// Handler for the drop down menu.
		$("body").on("change", "#header-drop-down", function(e){ scope.header_dropDownChangeHandler(e) });
		
		// Click handler for "show more" link at the bottom of the grid.
		this.showMore.on("click", function(){ scope.addFolios() });
		
		// Click handler for the login dialog.
		$("#print-subscriber-login").on("click", function(){ scope.displayLoginDialog() });
		
		$(window).on("resize", function(){ scope.setGridHeight() });

		$("#subscribe").on("click", function(){ scope.displaySubscribeDialog() });
		$("body").on("subscribeButtonClicked", function(){ scope.displaySubscribeDialog() });
		
		$("body").on("folioThumbClicked", function(e, folio, elementId){ scope.displayPreviewDialog(e, folio, elementId) });
		
		$("body").on("displaySectionsClicked", function(e, folio){ scope.displaySectionsView(folio) });

		// Triggered from the dialog when a purchase is successful.
		$("body").on("subscriptionPurchased", function() {
			$("#subscribe").css("display", "none");
			$("body").off("subscriptionPurchased");
		});
		
		if (ADOBE.isAPIAvailable) {
			// The collection creates a clone of the folio objects so addFolios() passes a reference to the object.
			// Since the folios are not on a server we don't need to load anything so pass the folios to the constructor.
			this.libraryCollection = new ADOBE.LibraryCollection(this.folios);
			
			// Add the folios which are currently available. On the first launch this
			// does not guarentee that all folios are immediately available. The callback
			// below for folioMap.addedSignal will handle folios which are added after
			// startup. Added does not mean, pushed from folio producer, rather they
			// are folios that the viewer becomes aware of after startup.
			this.addFolios();
			
			// Add a listener for when new folios are added.
			adobeDPS.libraryService.folioMap.addedSignal.add(function(folios) {
				for (var i = 0; i < folios.length; i++) {
					scope.addFolio(folios[i]);
				}
			}, this);
		} else { // Testing on the desktop so load the data from the fulfillment server.
			_.bindAll(this, "addFolios");
			this.libraryCollection = new ADOBE.LibraryCollection();
			this.libraryCollection.url = ADOBE.Config.FULFILLMENT_URL;
			this.libraryCollection.on("all", this.addFolios);
			this.libraryCollection.fetch({dataType: "xml"});
		}
		
		// Add to global for the configurator to set values.
		window.Config = ADOBE.Config;
	},
	
	addFolios: function() {
		if (this.libraryCollection.length > 0)
			$("#loading").remove();
		else
			return;
			
		var startIndex = this.getNumFoliosVisible();
		var endIndex = Math.min(startIndex + this.foliosPerPage, this.libraryCollection.length);
		for (var i = startIndex; i < endIndex; i++) {
			// When using the DPS api this is a clone of the original folio.
			var folio = this.libraryCollection.at(i);
			// Testing on the desktop so create the path to the image.
			if (!ADOBE.isAPIAvailable)
				folio.attributes.libraryPreviewUrl +=  "/portrait";
				
			var view = new ADOBE.FolioItemView({model: folio});
			var el = view.render().el;
			this.$grid.append(el);
			
			this.folioItemViewArray.push(view);
		}
		
		this.setGridHeight();
	},

	getNumFoliosVisible: function() {
		return this.$grid.children().length;
	},
	
	// This will be triggered when folios are added through the API.
	addFolio: function(folio) {
		$("#loading").remove();
		
		var len = this.folios.length;
		// Find the insert index. Folios are sorted by publicationDate with the most recent first.
		for (var i = 0; i < len; i++) {
			if (folio.publicationDate >= this.folios[i].publicationDate)
				break;
		}
		
		// Add the folio to the collection.
		this.libraryCollection.add(folio, {at: i});
		
		// Add the folio to the folios.
		this.folios.splice(i, 0, folio);
		
		// Figure out if the user has or is entitled to the latest folio or has a subscription covering today's date.
		// If the latest folio is not purchasable then the user is entitled to it.
		// If true then do not display the subscription button or tile.
		if (this.folios.length > 0) {
			var latestFolio = this.folios[0];
			this.userOwnsLatestFolio = !(latestFolio.state == ADOBE.FolioStates.PURCHASABLE || latestFolio.state == ADOBE.FolioStates.UNAVAILABLE || latestFolio.state == ADOBE.FolioStates.INVALID);
		}

		// Figure out if this folio should be dispayed.
		// Folios can be added in any order so see if this folio is within the range of publication
		// dates of the folios that are currently displayed.
		var numFoliosDisplayed = this.getNumFoliosVisible();
		var endIndex = Math.max(this.foliosPerPage, numFoliosDisplayed);
		if (i < endIndex) {
			var view;
			// See more button is visible so remove the last folio view before inserting a new one.
			if (numFoliosDisplayed >= this.foliosPerPage) {
				$("#grid div.folio-item-view:last-child").remove();
				 view = this.folioItemViewArray.pop();
				 view.clear();
			}
				
			view = new ADOBE.FolioItemView({model: this.libraryCollection.at(i)});
			var el = view.render().el;
			
			if (numFoliosDisplayed == 0)
				this.$grid.append(el);
			else
				$("#grid div.folio-item-view").eq(i).before(el);
				
			this.folioItemViewArray.splice(i, 0, view);
		}
		
		// Hide the subscribe button.
		if (this.userOwnsLatestFolio)
			$("#subscribe").hide();
		else
			$("#subscribe").show();
		
		this.setGridHeight();
	},
	
	setGridHeight: function() {
		var windowWidth = $(window).width();
		// Need to explicitly set the width otherwise it doesn't always update if width=100% in css.
		$("#header").width(windowWidth);
		var numFoliosDisplayed = this.getNumFoliosVisible();
		this.$grid.css("height", Math.ceil(numFoliosDisplayed / 3) * (windowWidth > $(window).height() ? 285 : 367));
		this.showMore.css("display", numFoliosDisplayed < this.libraryCollection.length ? "block" : "none");
	},
	
	// Handler for the drop down menu.
	header_dropDownChangeHandler: function(e) {
		var selectedLabel = $(e.target).dropDown("getSelectedLabel");
		if (selectedLabel == this.LBL_RESTORE_ALL_PURCHASES) {	// Display the restore dialog.
			this.displayRestorePurchasesDialog();
		} else if (selectedLabel == this.LBL_REMOVE_ISSUES_FROM_IPAD) {
			var archiveView = new ADOBE.ArchiveView({model: this.libraryCollection});
			$("body").append(archiveView.render().el);
			
			// Need to remove the grid so it is not scrollable in the background.
			var previewScrollPosition = $(window).scrollTop(); // get the current scroll position
			$("#grid").hide();
			
			archiveView.$el.on("archiveViewClosed", function() {
				$(window).scrollTop(previewScrollPosition); // set the scroll position back to what it was.
				$("#grid").show();
				
				archiveView.$el.off("archiveViewClosed");
			});
		}
	},
	
	displayRestorePurchasesDialog: function() {
		var restoreDialog = new ADOBE.RestoreDialog();
		$("body").append(restoreDialog.render().el);
		restoreDialog.open();
		
		restoreDialog.$el.on("restorePurchasesStarted", function(e, transaction) {
			restoreDialog.$el.off("restorePurchasesStarted");
			
			$("#header #title, #header #title-image").hide();
			$("<div id='spinner-title'><div id='spinner' class='spinner'></div>Restoring Purchases...</div>").appendTo("#header");
			
			// Options for the indeterminate spinner.
			var opts = {
					  lines: 13, // The number of lines to draw
					  length: 3, // The length of each line
					  width: 2, // The line thickness
					  radius: 6, // The radius of the inner circle
					  corners: 0, // Corner roundness (0..1)
					  rotate: 0, // The rotation offset
					  direction: 1, // 1: clockwise, -1: counterclockwise
					  color: '#000000', // #rgb or #rrggbb
					  speed: 1, // Rounds per second
					  trail: 60, // Afterglow percentage
					  shadow: false, // Whether to render a shadow
					  hwaccel: false, // Whether to use hardware acceleration
					  className: 'spinner', // The CSS class to assign to the spinner
					  zIndex: 2e9, // The z-index (defaults to 2000000000)
					  top: -1, // Top position relative to parent in px
					  left: 80 // Left position relative to parent in px
					};
			var target = document.getElementById("spinner");
			var spinner = new Spinner(opts).spin(target);
			
			transaction.completedSignal.addOnce(function() {
				$("#header #title, #header #title-image").show();
				spinner.stop();
				$("#spinner-title").remove();
			}, this);
		});
	},
	
	displayLoginDialog: function() {
		if (!ADOBE.isAPIAvailable || !adobeDPS.authenticationService.isUserAuthenticated) {
			var loginDialog = new ADOBE.LoginDialog();
			$("body").append(loginDialog.render().el);
			
			var scope = this;
			// Triggered from the dialog when a login is successful.
			loginDialog.$el.on("loginSuccess", function() {
				$("#print-subscriber-login").html(scope.LBL_SIGN_OUT);
			});
		} else {
			adobeDPS.authenticationService.logout();
			
			$("#print-subscriber-login").html(this.LBL_SIGN_IN);
		}
	},
	
	displaySubscribeDialog: function() {
		if (!this.subscribeDialog) {
			this.subscribeDialog = new ADOBE.SubscribeDialog({model: this.subscriptions});

			var scope = this;
			this.subscribeDialog.$el.on("subscribeDialogClosed", function() {
				scope.subscribeDialog = null;
			});
			
			$("body").append(this.subscribeDialog.render().el);
		}
	},
	
	displayPreviewDialog: function(e, folio, elementId) {
		var previewDialog = new ADOBE.PreviewDialog({model: folio});
		$("body").append(previewDialog.render().el);
		previewDialog.setImageProperties($(e.target), elementId);
		
		// Only show the subscribe button if testing on the desktop or
		// if the user doesn't own the latest folio and does not have an active subscription.
		if (ADOBE.isAPIAvailable) {
			if ((!this.userOwnsLatestFolio && !this.isSubscriptionActive) && folio == this.folios[0]) // Only show the subscribe button for the most recent.
				previewDialog.showSubscribeButton();
		} else {
			previewDialog.showSubscribeButton();
		}
		
		// Only show the preview button if testing on the desktop.
		// Otherwise the preview button visibility is determined in PreviewDialog.
		if (!ADOBE.isAPIAvailable)
			previewDialog.showPreviewButton();
	},
	
	displaySectionsView: function(folio) {
		var sectionsView = new ADOBE.SectionsView({model: folio});
		$("body").append(sectionsView.render().el);
		
		// Need to remove the grid so it is not scrollable in the background.
		var previewScrollPosition = $(window).scrollTop(); // get the current scroll position
		$("#grid").hide();
		
		sectionsView.$el.on("sectionsViewClosed", function() {
			$(window).scrollTop(previewScrollPosition); // set the scroll position back to what it was.
			$("#grid").show();
			
			sectionsView.$el.off("sectionsViewClosed");
		});
	},
	
	// Handler for when a user changes the auto archive setting.
	autoArchive_changeHandler: function(e, isOn) {
		adobeDPS.settingsService.autoArchive.toggle(isOn);
	}
});