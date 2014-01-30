/**
 * Displays the archivable folios in a grid.
 */
var ADOBE = ADOBE || {};

ADOBE.ArchiveView = Backbone.View.extend({
	tagName:  "div",
	
	className: "archive-view",
	
	// An Array of folios that can be archived.
	archivableFolios: null,
	
	// An Array of folio product ids that the user has selected to archive.
	foliosToArchive: null,
	
	folioItemViews: null,
	
	LBL_SELECT_ALL: "Select All",
	
	LBL_DESELECT_ALL: "Deselect All",
	
	events: {
		"click #close-button"		: "close",
		"click #select-all-button"	: "selectAllButton_clickHandler",
		"click #remove-button"		: "removeButton_clickHandler"
	},
	
	initialize: function() {
		this.archivableFolios = [];
		this.foliosToArchive = [];
		this.folioItemViews = [];
		
		var html  = "<div id='header'>";
			html += 	"<div id='archive-view-left-column'>";
			html +=     	"<div class='text-link' id='close-button'>Close</div>";
			html +=		"</div>";
			html +=		"<div id='title'>Select Issues</div>";
			html += 	"<div id='archive-view-right-column'>";
			html +=     	"<div class='text-link' id='select-all-button'>" + this.LBL_SELECT_ALL + "</div>";
			html +=     	"<div class='text-link-red' id='remove-button'>Remove</div>";
			html +=		"</div>";
			html +=	"</div>";
			html +=	"<div id='archive-grid'></div>";
			
		this.template = _.template(html);
		
		if (ADOBE.isAPIAvailable) {
			var folio;
			var len = this.model.length;
			for (var i = 0; i < len; i++) {
				var folio = adobeDPS.libraryService.folioMap.internal[this.model.at(i).attributes.id];
				if (folio.isArchivable) {
					this.archivableFolios.push(folio);
				}
			}
		} else {
			var scope = this;
			_.each(this.model.models, function(element, index, list) {
				scope.archivableFolios.push(element.attributes);
			});
		}
	},
	
	render: function() {
		this.$el.html(this.template());
		
		this.$el.find("#remove-button").addClass("disabled");
		
		var scope = this;
		$(window).on("resize", function() {
			scope.resizeHandler();
		})
		
		this.resizeHandler();
		
		var len = this.archivableFolios.length;
		var scope = this;
		var $grid = this.$el.find("#archive-grid");
		for (var i = 0; i < len; i++) {
			var item = new ADOBE.ArchiveFolioItemView({model: this.archivableFolios[i]});
			item.$el.on("folioArchiveChanged", function(e, isSelected, productId) {
				scope.folioArchiveChangedHandler(isSelected, productId);
			})
			
			$grid.append(item.render().el);
			
			this.folioItemViews.push(item);
		}
		
		if (this.archivableFolios.length == 0) {
			this.$el.find("#archive-grid").html("<div id='archive-view-msg'>You do not have any issues to remove.</div>");
			this.$el.find("#select-all-button").addClass("disabled");
		}
		
		return this;
	},
	
	resizeHandler: function() {
		this.$el.find("#archive-grid").height(window.innerHeight - 81); // subtract padding.
	},
	
	close: function() {
		this.$el.trigger("archiveViewClosed");
		this.remove();
	},
	
	selectAllButton_clickHandler: function() {
		if (this.$el.find("#select-all-button").html() == this.LBL_SELECT_ALL) {
			_.each(this.folioItemViews, function(element, index, list) {
				element.setSelected(true);
			});
			
			// Populate foliosToArchive with all of the folios that aren't already in the array.
			var len = this.archivableFolios.length;
			for (var i = 0; i < len; i++) {
				var folio = this.archivableFolios[i];
				var productId = folio.productId;
				if (this.foliosToArchive.indexOf(productId) == -1) {
					this.foliosToArchive.push(productId);
				}
			}
		} else {
			_.each(this.folioItemViews, function(element, index, list) {
				element.setSelected(false);
			});
			
			this.foliosToArchive = [];
		}
		
		this.updateView();
	},
	
	removeButton_clickHandler: function() {
		if (this.foliosToArchive.length > 0) {
			if (ADOBE.isAPIAvailable) {
				var folio;
				var len = this.model.length;
				
				_.each(this.foliosToArchive, function(element, index, list) {
					var folio = adobeDPS.libraryService.folioMap.getByProductId(element);
					if (folio.currentStateChangingTransaction() && folio.currentStateChangingTransaction().isCancelable) {
						var transaction = folio.currentStateChangingTransaction().cancel();
						transaction.completedSignal.addOnce(function() {
							folio.archive();
						}, this)
					} else if (folio.isArchivable) {
						folio.archive();
					}
				});
			}
			
			this.close();
		}
	},
	
	// Handler for when a user clicks a folio.
	folioArchiveChangedHandler: function(isSelected, productId) {
		var index = this.foliosToArchive.indexOf(productId);
		if (isSelected) {
			if (index == -1)
				this.foliosToArchive.push(productId);
		} else {
			if (index != -1)
				this.foliosToArchive.splice(index, 1);
		}
		
		this.updateView();
	},
	
	updateView: function() {
		var len = this.foliosToArchive.length;
		if (len == 0) {
			this.$el.find("#title").html("Select Issues");
			this.$el.find("#remove-button").addClass("disabled");
			
			this.$el.find("#select-all-button").html(this.LBL_SELECT_ALL);
		} else {
			if (len == 1)
				this.$el.find("#title").html("1 Issue Selected");
			else
				this.$el.find("#title").html(len + " Issues Selected");
			
			this.$el.find("#remove-button").removeClass("disabled");
			
			this.$el.find("#select-all-button").html(this.LBL_DESELECT_ALL);
		}
	}
});