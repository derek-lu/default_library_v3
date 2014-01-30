/**
 * Displays a folio in the archive grid.
 */
var ADOBE = ADOBE || {};

ADOBE.ArchiveFolioItemView = Backbone.View.extend({
	tagName:  "div",
	
	className: "folio-item-view",
	
	// A reference to the original folio since the collection uses a cloned copy.
	folio: null,
	
	selected: false,
	
	$selectedBorder: null,
	
	initialize: function() {
		// folio-thumb-container visible in landscape.
		var html  = "<div class='folio-thumb-container'><img class='folio-thumb' /></div>";
		    html += "<div class='text'>";
		    html +=     "<div class='magazine-title'></div>";
		    html +=     "<div class='folio-size'></div>";
		    html += "</div>";
			
		this.template = _.template(html);
	},
	
	render: function() {
		this.$el.html(this.template());
		
		
		var scope = this;
		
		var $folioThumb = this.$el.find(".folio-thumb");

		if (ADOBE.isAPIAvailable) {
			//Get a reference to the original folio object.
			this.folio = adobeDPS.libraryService.folioMap.internal[this.model.id];

			this.$el.find(".magazine-title").html(this.folio.title);
			
			// Set a delay to load the preview image in case this renderer has
			// already been removed from the DOM. This will be the case when
			// multiple folios are added within the same frame from the API causing
			// some folios to be added and then removed immediately.
			setTimeout(function(){ scope.loadPreviewImage() }, 100);
		} else { // Testing on the desktop.
			$folioThumb.attr("src", this.model.libraryPreviewUrl);
			this.$el.find("#buy-button").html("$.98");
			this.$el.find(".magazine-title").html(this.model.title);
		}
		
		$folioThumb.load(function() { scope.folioThumbLoadedHandler() });
		
		this.$el.find(".folio-thumb-container").on("click", function() {
			scope.folioThumb_clickHandler();
		})
		
		return this;
	},
	
	folioThumb_clickHandler: function() {
		this.setSelected(!this.selected); // Toggle the selected state.
		
		this.$el.trigger("folioArchiveChanged", [this.selected, this.model.productId]);
	},
	
	clear: function() {
		this.$el.off();
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
	
	setSelected: function(value) {
		if (value) {
			if (!this.$selectedBorder) {
				var html  = "<div class='archive-view-selected'>";
				html +=		"<div class='archive-view-selected-check-icon-container'>";
				html +=			"<div class='archive-view-selected-check-icon'></div>";
				html +=		"</div>";
				html += "</div>";
				
				this.$selectedBorder = $(html);
				this.$selectedBorder.appendTo(this.$el);
				
				var scope = this;
				this.$selectedBorder.on("click", function() {
					scope.folioThumb_clickHandler();
				});
			}
		} else {
			if (this.$selectedBorder) {
				this.$selectedBorder.remove();
				this.$selectedBorder.off();
				this.$selectedBorder = null;
			}
		}
		
		this.selected = value;
	}
});
