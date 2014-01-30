/**
 * Displays the archivable folios in a grid.
 */
var ADOBE = ADOBE || {};

ADOBE.SectionsView = Backbone.View.extend({
	tagName:  "div",
	
	className: "sections-view",
	
	events: {
		"click #close-button"			: "closeButton_clickHandler",
		"click #download-all-button"	: "downloadAllButton_clickHandler"
	},
	
	// A reference to the folio object from the API.
	folio: null,
	
	initialize: function() {
		var html  = "<div id='header'>";
			html += 	"<div id='sections-view-left-column'>";
			html +=     	"<div class='text-link' id='close-button'>Close</div>";
			html +=		"</div>";
			html +=		"<div id='title'></div>";
			html += 	"<div id='sections-view-right-column'>";
			html +=     	"<div class='text-link' id='download-all-button'>Download All</div>";
			html +=		"</div>";
			html +=	"</div>";
			html +=	"<div id='sections-grid'></div>";
			
		this.template = _.template(html);
	},
	
	render: function() {
		this.$el.html(this.template());
		
		var scope = this;
		$(window).on("resize", function() {
			scope.resizeHandler();
		})
		
		this.resizeHandler();
		
		if (ADOBE.isAPIAvailable) {
			//Get a reference to the original folio object.
			this.folio = adobeDPS.libraryService.folioMap.internal[this.model.attributes.id];
			var transaction = this.folio.getSections();
			transaction.completedSignal.addOnce(this.getSectionsHandler, this);
			
			this.$el.find("#download-all-button").hide();
		} else {
			var scope = this;
			var $grid = this.$el.find("#sections-grid");
			// Create placeholder sections.
			var sections = [{title: "Front Page", libraryPreviewUrl: this.model.get("libraryPreviewUrl")},
			                {title: "Business", libraryPreviewUrl: this.model.get("libraryPreviewUrl")},
			                {title: "Sports", libraryPreviewUrl: this.model.get("libraryPreviewUrl")},
			                {title: "Living", libraryPreviewUrl: this.model.get("libraryPreviewUrl")},
			                {title: "Home & Garden", libraryPreviewUrl: this.model.get("libraryPreviewUrl")}];

			var $grid = this.$el.find("#sections-grid");
			_.each(sections, function(element, index, list) {
				var item = new ADOBE.SectionFolioItemView({model: element});
				$grid.append(item.render().el);
			});
		}
		
		this.$el.find("#title").html(this.model.get("title"));
		
		return this;
	},
	
	getSectionsHandler: function(transaction) {
		transaction.completedSignal.remove(this.getSectionsHandler);
		
		var $grid = this.$el.find("#sections-grid");
		var isShowDownloadAllButton = false;
		var scope = this;
		for (var id in this.folio.sections.internal) {
			var section = this.folio.sections.internal[id];
			var item = new ADOBE.SectionFolioItemView({model: section});
			item.$el.on("folioInstalled", function() {
				scope.folioInstalledHandler();
			});
			$grid.append(item.render().el);
			
			if (section.state < ADOBE.FolioStates.DOWNLOADING)
				isShowDownloadAllButton = true;
		}
		
		if (isShowDownloadAllButton)
			this.$el.find("#download-all-button").show();
	},
	
	// Handler for folioInstalled triggered from SectionFolioItemView.
	// Check to see if all of the sections are installed and if so hide the download button.
	folioInstalledHandler: function() {
		var isShowDownloadAllButton = false;
		for (var id in this.folio.sections.internal) {
			if (this.folio.sections.internal[id].state < ADOBE.FolioStates.DOWNLOADING)
				isShowDownloadAllButton = true;
		}
		
		if (!isShowDownloadAllButton)
			this.$el.find("#download-all-button").hide();
	},
	
	resizeHandler: function() {
		this.$el.find("#sections-grid").height(window.innerHeight - 81); // subtract padding.
	},
	
	closeButton_clickHandler: function() {
		this.$el.trigger("sectionsViewClosed");
		this.remove();
	},
	
	downloadAllButton_clickHandler: function() {
		for (var id in this.folio.sections.internal) {
			var section = this.folio.sections.internal[id];
			if (section.isDownloadable)
				section.download();
		}
		
		this.$el.find("#download-all-button").hide();
	}
});