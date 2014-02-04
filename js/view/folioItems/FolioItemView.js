/**
 * Displays a folio in the grid.
 */
var ADOBE = ADOBE || {};

ADOBE.FolioItemView = Backbone.View.extend({
	tagName:  "div",
	
	className: "folio-item-view",
	
	// The dialog asking whether or not to update the folio if an update is available.
	updateDialog: null,
	
	isTrackingTransaction: false,
	
	// A reference to the current downloadTransaction. Used to pause and resume a download.
	currentDownloadTransaction: null,
	
	// A reference to the original folio since the collection uses a cloned copy.
	folio: null,
	
	isBuyButtonEnabled: true,
	
	// Flag to track whether or not the download button initiated a download.
	// If it was clicked and the folio is viewable && Config.IS_AUTO_OPEN_DOWNLOADED_FOLIO then automatically open the folio.
	// This will not be the case if a user toggled views and a download is resumed.
	downloadButtonWasClicked: false,
	
	// Whether or not a preview is downloading.
	isPreviewDownloading: false,
	
	initialize: function() {
		// folio-thumb-container visible in landscape.
		var html  = "<div class='folio-thumb-container'><img class='folio-thumb' /></div>";
		    html += "<div class='text'>";
		    html +=     "<div class='magazine-title'><%= title %></div>";
			html +=		"<div class='folio-number'><%= folioNumber %></div>";
		    html +=     "<div class='state'></div>";
		    html +=     "<div class='blue-button button' id='buy-button'></div>";
		    html += "</div>";
			
		this.template = _.template(html);
	},
	
	render: function() {
		var json = this.model.toJSON();
		
		this.$el.html(this.template(json));
		
		var scope = this;
		
		var $folioThumb = this.$el.find(".folio-thumb");
		
		this.$buyButton = this.$el.find("#buy-button");

		if (ADOBE.isAPIAvailable) {
			//Get a reference to the original folio object.
			this.folio = adobeDPS.libraryService.folioMap.internal[this.model.attributes.id];
			
			// Set a delay to load the preview image in case this renderer has
			// already been removed from the DOM. This will be the case when
			// multiple folios are added within the same frame from the API causing
			// some folios to be added and then removed immediately.
			setTimeout(function(){ scope.loadPreviewImage() }, 100);
			
			this.updateView();

			// Add a handler to listen for updates.
			this.folio.updatedSignal.add(this.updatedSignalHandler, this);

			// Determine if the folio was in the middle of downloading.
			// If the folio is downloading then find the paused transaction and resume.
			if (this.folio.state == ADOBE.FolioStates.DOWNLOADING) {
				var transactions = this.folio.currentTransactions;
				var len = transactions.length;
				for (var i = 0; i < len; i++) {
					var transaction = transactions[i];
					if (transaction.state == adobeDPS.transactionManager.transactionStates.PAUSED) {
						transaction.resume();
						break;
					}
				}
			}
		} else { // Testing on the desktop.
			$folioThumb.attr("src", json.libraryPreviewUrl);
			this.$buyButton.html("$.98");
		}
		
		$folioThumb.load(function() { scope.folioThumbLoadedHandler() });
		
		$folioThumb.on("click", function(e) {
			if (ADOBE.isAPIAvailable) {
				if (scope.folio.isUpdatable)
					scope.displayUpdateDialog();
				else if (scope.folio.state > ADOBE.FolioStates.PURCHASABLE && scope.folio.hasSections)
					scope.$el.trigger("displaySectionsClicked", [scope.model]);
				else if (ADOBE.isAPIAvailable && scope.folio.isViewable)
					scope.folio.view();
				else if (scope.folio.state != ADOBE.FolioStates.DOWNLOADING)
					$(e.currentTarget).trigger("folioThumbClicked", [scope.folio, "folioThumb" + json.productId]);
			} else {
				$(e.currentTarget).trigger("folioThumbClicked", [json, "folioThumb" + json.productId]);
			}
		});
		
		$folioThumb.attr("id", "folioThumb" + json.productId);
		
		this.$buyButton.on("click", function() { scope.buyButton_clickHandler() });
		
		if (this.model.get("hasSections"))
			this.$el.append("<div id='folio-section-shadow'></div>");
		
		return this;
	},
	
	clear: function() {
		this.$el.off();
		this.$buyButton.off();
		this.folio.updatedSignal.remove(this.updatedSignalHandler, this);
	},
	
	loadPreviewImage: function() {
		if (this.el.parentElement) {
			var transaction = this.folio.getPreviewImage(135, 180, true);
			transaction.completedSignal.addOnce(this.getPreviewImageHandler, this);
		}
	},
	
	getPreviewImageHandler: function(transaction) {
		if (transaction.state == adobeDPS.transactionManager.transactionStates.FINISHED && transaction.previewImageURL != null) {
			this.$el.find(".folio-thumb").attr("src", transaction.previewImageURL);
		} else if (transaction.previewImageURL == null) { // Sometimes previewImageURL is null so attempt another reload.
			var scope = this;
			setTimeout(function() {
				var transaction = scope.folio.getPreviewImage(135, 180, true);
				transaction.completedSignal.addOnce(scope.getPreviewImageHandler, scope);
			}, 200);
		}
	},
	
	folioThumbLoadedHandler: function() {
		this.$el.find(".folio-thumb").css("visibility", "visible");
	},
	
	updatedSignalHandler: function(properties) {
		this.updateView();
		
		// The buy button is disabled before downloading so if it is made viewable
		// during the download then enable it again. 
		if (properties.indexOf("isViewable") > -1 && this.folio.isViewable) {
			this.enableBuyButton(true);
			
			if (this.downloadButtonWasClicked && ADOBE.Config.IS_AUTO_OPEN_DOWNLOADED_FOLIO)
				this.folio.view();
		}

		if ((properties.indexOf("state") > -1 || properties.indexOf("currentTransactions") > -1) && this.folio.currentTransactions.length > 0)
			this.trackTransaction();
	},
	
	// Updates the view with the proper labels, buttons and download status.
	updateView: function() {
		var label = "";
		this.setStateLabel("");
		this.$buyButton.removeClass("cloud-icon");
		
		switch (this.folio.state) {
			case ADOBE.FolioStates.INVALID:
				label = "Error";
				break;
			case ADOBE.FolioStates.UNAVAILABLE:
				label = "Error";
				break;
			case ADOBE.FolioStates.PURCHASABLE:
				label = this.folio.price;
				
				// This is triggered during a preview download so make sure the button is only visible if a preview download is not happening.
				if (!this.isPreviewDownloading)
					this.$buyButton.show();
				break;
			case ADOBE.FolioStates.ENTITLED:
				this.showDownloadStatus(false);
				this.enableBuyButton(true);
				
				if (this.folio.entitlementType == adobeDPS.receiptService.entitlementTypes.FREE)
					label = "FREE";
				else
					this.$buyButton.addClass("cloud-icon");
				
				this.$buyButton.show();
				break;
			case ADOBE.FolioStates.DOWNLOADING:
				if (!this.folio.isViewable)
					this.enableBuyButton(false);
				
				this.showDownloadStatus(true);
				
				if (!this.currentDownloadTransaction || (this.currentDownloadTransaction && this.currentDownloadTransaction.progress == 0)) {
					this.setDownloadPercent(0);
					this.setStateLabel("Waiting...");
				}
				
				label = "View";
				break;
			case ADOBE.FolioStates.INSTALLED:
				this.showDownloadStatus(false);
				label = "View";
				
				this.$buyButton.hide();
				
				break;
			case ADOBE.FolioStates.PURCHASING:
				this.$buyButton.hide();
				this.setStateLabel("Purchasing...");
				$("<div id='purchasing-spinner' class='spinner'></div>").appendTo(this.$el.find(".text"));
				
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
						  zIndex: 2e9 // The z-index (defaults to 2000000000)
						};
				var target = document.getElementById("purchasing-spinner");
				this.spinner = new Spinner(opts).spin(target);
				
				break;
			case ADOBE.FolioStates.EXTRACTING:
			case ADOBE.FolioStates.EXTRACTABLE:
				label = "View";
				break;
		}
		
		this.$buyButton.html(label);
	},
	
	setStateLabel: function(value) {
		if (value != "") {
			this.$el.find(".magazine-title, .folio-number").hide();
			this.$el.find(".state").show();
		} else {
			this.$el.find(".magazine-title, .folio-number").show();
			this.$el.find(".state").hide();
		}
		
		this.$el.find(".state").html(value);
	},

	trackTransaction: function() {
		if (this.isTrackingTransaction)
			return;
			
		var transaction;
		for (var i = 0; i < this.folio.currentTransactions.length; i++) {
	        transaction = this.folio.currentTransactions[i];
	        if (transaction.isFolioStateChangingTransaction()) {
	            // found one, so break and attach to this one
	            break;
	        } else {
	            // null out transaction since we didn't find a traceable one
	            transaction = null;
	        }
	    }
	
		if (!transaction)
			return;
		
		var transactionType = transaction.jsonClassName;
		if (transactionType != "DownloadTransaction" &&
			transactionType != "UpdateTransaction" &&
			transactionType != "PurchaseTransaction" &&
			transactionType != "ArchiveTransaction" &&
			transactionType != "ViewTransaction" &&
			transactionType != "PreviewTransaction") {
				return;
		}

		// Check if the transaction is active yet
		if (transaction.state == adobeDPS.transactionManager.transactionStates.INITALIZED) {
			// This transaction is not yet started, but most likely soon will
			// so setup a callback for when the transaction starts
			transaction.stateChangedSignal.addOnce(this.trackTransaction, this);
			return;
		}
		
		this.isTrackingTransaction = true;
		
		this.currentDownloadTransaction = null;
		if (transactionType == "DownloadTransaction" || transactionType == "UpdateTransaction" || transactionType == "PreviewTransaction") {
			transaction.stateChangedSignal.add(this.download_stateChangedSignalHandler, this);
			transaction.progressSignal.add(this.download_progressSignalHandler, this);
			transaction.completedSignal.add(this.download_completedSignalHandler, this);
			this.currentDownloadTransaction = transaction;
			
			if (transactionType == "PreviewTransaction") {
				this.isPreviewDownloading = true;
				this.showDownloadStatus(true);
				
				if (transaction.progress == 0) {
					this.setDownloadPercent(0);
					this.setStateLabel("Waiting...");
				}
				
				this.downloadButtonWasClicked = true;
			}
		} else {
			// Add a callback for the transaction.
			transaction.completedSignal.addOnce(function() {
				this.isTrackingTransaction = false;
			}, this)
		}
	},
	
	// Handler for when a user clicks the buy button.
	buyButton_clickHandler: function() {
		if (ADOBE.isAPIAvailable) {
			var state = this.folio.state;
			
			if (state == ADOBE.FolioStates.PURCHASABLE) {
				this.purchase();
			} else if (this.folio.isUpdatable) {
				this.displayUpdateDialog();
			} else if (state > ADOBE.FolioStates.PURCHASABLE && this.folio.hasSections) {
				this.$el.trigger("displaySectionsClicked", [this.model]);
			} else if (this.folio.isViewable) {
				this.folio.view();
			} else if (state == ADOBE.FolioStates.ENTITLED) {
				if (this.isBuyButtonEnabled)
					this.folio.download();
			}
			
			this.downloadButtonWasClicked = true;
		} else {
			if (this.model.get("hasSections"))
				this.$el.trigger("displaySectionsClicked", [this.model]);
		}
	},
	
	// Changes the opacity of the buyButton to give an enabled or disabled state.
	enableBuyButton: function(value) {
		this.$buyButton.css("opacity", value ? 1 : .6);
		
		this.isBuyButtonEnabled = value;
	},
	
	// Purchases the folio.
	purchase: function() {
		var transaction = this.folio.purchase();
		transaction.completedSignal.addOnce(function(transaction) {
			this.spinner.stop();
			this.$el.find("#purchasing-spinner").remove();
			
			if (transaction.state == adobeDPS.transactionManager.transactionStates.FINISHED) {
				this.isTrackingTransaction = false;
			} else if (transaction.state == adobeDPS.transactionManager.transactionStates.FAILED) {
				alert("Sorry, unable to purchase");
			}
			
			this.updateView();
		}, this);
	},
	
	// Displays the dialog for confirmation of whether or not to update the folio.
	displayUpdateDialog: function() {
		var desc = "An updated version of " + this.folio.title + " is available. Do you want to download this update now?";
		var html  = "<div id='update-dialog-modal-background' class='modal-background-grey'>"; // Make the dialog modal.
			html +=     "<div id='update-dialog' class='dialog'>";
			html += 	    "<p id='description'>" + desc + "</p>";
			html += 	    "<div class='text-link' id='no'>No</div><div class='text-link' id='yes'>Yes</div>";
			html +=     "</div>";
			html += "</div>";

		this.updateDialog = $(html);
		
		this.updateDialog.appendTo("body");
		
		$("#update-dialog").addClass("pop");
		$("#update-dialog-modal-background").css("display", "inline");
		
		var scope = this;
		$("#update-dialog").on("click", "#no", function() { scope.no_updateDialogHandler() });
		$("#update-dialog").on("click", "#yes", function() { scope.yes_updateFolio() });
	},
	
	// Handler for the "Yes" button of the update dialog.
	yes_updateFolio: function() {
		this.downloadButtonWasClicked = true;
		this.updateDialog.remove();
		this.folio.update();
	},
	
	// Handler for the "No" button of the update dialog.
	no_updateDialogHandler: function() {
		this.updateDialog.remove();
		
		if (this.folio.hasSections)
			this.$el.trigger("displaySectionsClicked", [this.model]);
		else
			this.folio.view();
	},
	
	// Downloads are automatically paused if another one is initiated so watch for changes with this callback.
	download_stateChangedSignalHandler: function(transaction) {
		if (transaction.state == adobeDPS.transactionManager.transactionStates.FAILED) {
			if (transaction.error) {
				if (transaction.error.code == adobeDPS.transactionManager.transactionErrorTypes.TransactionFolioNotEnoughDiskSpaceError)
					alert("You do not have enough disk space to download this issue.");
				else if (transaction.error.code == adobeDPS.transactionManager.transactionErrorTypes.TransactionFolioIncompatibleError)
					alert("The issue you are trying to download is incompatible with this viewer. Please update your app.");
				else
					alert("Unable to download folio: " + transaction.error.code + ".");
			} else {
				alert("Unable to download folio.");
			}
			
			this.download_completedSignalHandler(transaction);
			this.updateView();
			this.enableBuyButton(true);
			this.setStateLabel("");
		} else if (transaction.state == adobeDPS.transactionManager.transactionStates.PAUSED) {
			this.setStateLabel("Download Paused");
			var $downloadToggleButton = this.$el.find("#toggle-download-button");
			$downloadToggleButton.removeClass("cancel-download-button");
			$downloadToggleButton.addClass("resume-download-button");
		} else if (transaction.state == adobeDPS.transactionManager.transactionStates.ACTIVE) {
			this.setStateLabel("");

			var $downloadToggleButton = this.$el.find("#toggle-download-button");
			$downloadToggleButton.removeClass("resume-download-button");
			$downloadToggleButton.addClass("cancel-download-button");
		} else if (transaction.state == adobeDPS.transactionManager.transactionStates.INITIALIZED) {
			this.setStateLabel("Waiting...");
		} else {
			this.setStateLabel("");
		}
	},
	
	// Updates the progress bar for downloads and updates.
	download_progressSignalHandler: function(transaction) {
		this.setDownloadPercent(transaction.progress);
	},
	
	// Handler for when a download or update completes.
	download_completedSignalHandler: function(transaction) {
		transaction.stateChangedSignal.remove(this.download_stateChangedSignalHandler, this);
		transaction.progressSignal.remove(this.download_progressSignalHandler, this);
		transaction.completedSignal.remove(this.download_completedSignalHandler, this);

		// For preview transactions the INSTALLED state is not triggered so hide downloadStatus here.
		this.showDownloadStatus(false);
			
		this.isTrackingTransaction = false;
	},
	
	// Displays/Hides the download/update progress bar.
	showDownloadStatus: function(value) {
		if (value) {
			if (!this.$downloadStatus) {
				var html  = "<div class='download-status'>";
					html += 	"<div class='progress-track'><div class='progress-bar' /></div>";
				    html += "</div>";
				
				this.$downloadStatus = $(html);
				this.$el.append(this.$downloadStatus);
				
				html = "<div id='toggle-download-button' class='cancel-download-button'></div>";
				this.$cancelDownloadButton = $(html);
				this.$el.append(this.$cancelDownloadButton);
				
				var scope = this;
				this.$cancelDownloadButton.on("click", function() {
					scope.toggleDownload();
				});
				
				if (this.folio && this.folio.hasSections) {
					this.$downloadStatus.on("click", function(){
						scope.$el.trigger("displaySectionsClicked", [scope.model]);
					});
				}
				
				this.$buyButton.hide();
			}
		} else {
			if (this.$downloadStatus) {
				this.$downloadStatus.off();
				this.$downloadStatus.remove();
				this.$downloadStatus = null;

				this.$cancelDownloadButton.off("click");
				this.$cancelDownloadButton.remove();
				this.$cancelDownloadButton = null;
			}
		}
	},
	
	// Handler for when a user clicks cancel download button.
	toggleDownload: function() {
		if (!this.currentDownloadTransaction)
			return;
		
		if (this.currentDownloadTransaction.state == adobeDPS.transactionManager.transactionStates.ACTIVE) {
			this.isPreviewDownloading = false;
			this.currentDownloadTransaction.cancel();
			
			// This should be handled in updateView() but the state is not
			// properly updated for previews so need to explicitly do it here.
			this.showDownloadStatus(false);
		} else {
			this.currentDownloadTransaction.resume();
		}
	},
	
	// Sets the download progress bar.
	setDownloadPercent: function(value) {
		value *= .01;
		
		// Figure out if landscape or portrait.
		var maxWidth = window.innerWidth > window.innerHeight ? 300 : 216; // Max width of track.
		this.$el.find(".progress-bar").css("width", Math.min(maxWidth * value, maxWidth));
	}
});
