/**
 * Displays the restore dialog.
 */
var ADOBE = ADOBE || {};

ADOBE.RestoreDialog = Backbone.View.extend({
	tagName:  "div",
	
	className: "modal-background-grey",
	
	events: {
		"click": "clickHandler"
	},
	
	initialize: function() {
		var html  = "<div id='restore-dialog' class='dialog'>";
			html +=     "<p id='description'>Do you want to restore your previous purchases?</p>";
			html += 	"<div class='text-link' id='noThanks'>No Thanks</div><div class='text-link' id='restore'>Restore</div>";
			html += "</div>";
			
		this.template = _.template(html);
	},
	
	render: function() {
		this.$el.html(this.template());
		
		var scope = this;
		this.$el.on("click", "#noThanks", function() { scope.close() });
		this.$el.on("click", "#restore", function() { scope.restore_clickHandler() });
		
		return this;
	},
	
	clickHandler: function(e) {
			//preview-dialog-content-container
			var clientX = e.clientX;
			var clientY = e.clientY;
			var $dialog = this.$el.find(".dialog");
			var offset = $dialog.offset();
			if (clientX < offset.left || clientX > offset.left + $dialog.width() || clientY < offset.top || clientY > offset.top + $dialog.height())
				this.close();
	},
	
	open: function() {
		this.$el.find("#restore-dialog").addClass("pop");
	},
	
	close: function() {
		this.$el.remove();
	},
	
	// Handler for when a user chooses to restore purchases.
	restore_clickHandler: function() {
		var transaction = adobeDPS.receiptService.restorePurchases();
		this.$el.trigger("restorePurchasesStarted", [transaction]);
		this.close();
	}
});
