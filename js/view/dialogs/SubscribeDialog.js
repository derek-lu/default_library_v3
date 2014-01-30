/**
 * Displays the subscribe dialog
 */
var ADOBE = ADOBE || {};

ADOBE.SubscribeDialog = Backbone.View.extend({
	tagName:  "div",
	
	className: "modal-background-grey",
	
	events: {
		"click": "clickHandler"
	},

	initialize: function() {
		var html  = 	"<div id='subscribe-dialog' class='dialog'>";
			html += 		"<p id='description'>Select a digital subscription option below. Your digital subscription starts with the most recent issue.</p>";
			html += 		this.model; // The model is the html of the buttons.
			html += 		"<div class='subscribe-dialog-button' id='cancel'>Cancel</div>";
			html += 	"</div>";
			
		this.template = _.template(html);
	},
	
	render: function() {
		this.$el.html(this.template());
		
		var scope = this;
		this.$el.find("#cancel").on("click", function() { scope.close() });
		
		// The handler for the individual subscription buttons.
		this.$el.on("click", ".subscribe-button", function(e){ scope.subscribe_clickHandler(e) });
		
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

	close: function() {
		this.$el.trigger("subscribeDialogClosed");
		this.$el.remove();
	},
	
	// Handles clicks from any of the subscription buttons.
	subscribe_clickHandler: function(e) {
		if (ADOBE.isAPIAvailable) {
			// The product id is set to the id of the element so get a reference to it.
			var productId = $(e.currentTarget).attr("id");
			
			var transaction = adobeDPS.receiptService.availableSubscriptions[productId].purchase();
			transaction.completedSignal.addOnce(function(transaction) {
				if (transaction.state == adobeDPS.transactionManager.transactionStates.FINISHED)
					$("body").trigger("subscriptionPurchased"); // Need to trigger from the body since this.$el is no longer in the dom.
			});
		}
			
		this.close();
	}
});
