/**
 * Displays the login dialog that includes two links, "Forgot Password" and "Sign in".
 */
var ADOBE = ADOBE || {};

ADOBE.LoginDialog = Backbone.View.extend({
	tagName:  "div",
	
	className: "modal-background-grey",
	
	events: {
		"click": "clickHandler"
	},
	
	initialize: function() {
		var html  = "<form id='login'>";
		    html +=    "<div class='title'>Sign In<div id='close'>Cancel</div></div>";
		    html +=    "<div class='description'>Please sign in to your account.</div>";
		    html +=    "<input id='username' type='email' name='username' placeholder='Username'/></div>";
		    html +=    "<input id='password' type='password' name='password' placeholder='Password'/></div>";

		    html +=    "<div id='submit'>Sign In</div>";
		    html +=    "<div class='error'></div>";
		    
		if (ADOBE.Config.FORGOT_PASSWORD_URL != "")
		    html +=    "<div class='link' id='forgot-password'>Forgot password?</div>";
		    
		if (ADOBE.Config.CREATE_ACCOUNT_URL != "")
		    html +=    "<div class='link' id='create-account'>Create an Account</div>";
			
			html += "</form>";
			
		this.template = _.template(html);
	},
	
	render: function() {
		this.$el.html(this.template());
		
		var scope = this;
		this.$el.find("#close").on("click", function() { scope.close() });
		this.$el.find("#submit").on("click", function() { scope.submit_clickHandler() });
		
		this.$el.find("#forgot-password").on("click", function() { adobeDPS.dialogService.open(ADOBE.Config.FORGOT_PASSWORD_URL) });
		this.$el.find("#create-account").on("click", function() { adobeDPS.dialogService.open(ADOBE.Config.CREATE_ACCOUNT_URL) });
		
		return this;
	},
	
	clickHandler: function(e) {
			//preview-dialog-content-container
			var clientX = e.clientX;
			var clientY = e.clientY;
			var $login = this.$el.find("#login");
			var offset = $login.offset();
			if (clientX < offset.left || clientX > offset.left + $login.width() || clientY < offset.top || clientY > offset.top + $login.height())
				this.close();
	},
	
	submit_clickHandler: function() {
		var $username = this.$el.find("#username");
		var $password = this.$el.find("#password");
		
		$("#login .error").html("");
		
		// Make sure username and password are not blank.
		if ($username.val() == "" || $("#password").val() == "") {
			if ($username.val() == "")
				$("#login .error").html("Please enter your username.");
			else if ($password.val() == "")
				$("#login .error").html("Please enter a valid password.");
		} else {
			// Login using the authenticationService.
			var transaction = adobeDPS.authenticationService.login($username.val(), $password.val());
			transaction.completedSignal.addOnce(function(transaction) {
				var transactionStates = adobeDPS.transactionManager.transactionStates;
				if (transaction.state == transactionStates.FAILED) {
					$("#login .error").html("Authentication Failed.")
				} else if (transaction.state == transactionStates.FINISHED){
					// If a user is signing into direct entitlement it is recommended
					// to cancel any transactions on the folio using the code below
					// so the entire folio is downloaded when a user views it. This
					// will be the case if a preview download is occurring while
					// signing into direct entitlement.
					for (var uuid in adobeDPS.libraryService.folioMap.internal) {
						var folio = adobeDPS.libraryService.folioMap.internal[uuid];
						if (folio.isPurchasable) {
							var transaction = folio.currentStateChangingTransaction();
							if (transaction != null && transaction.isCancelable) {
								transaction.cancel();
							}
						}
					}
					
					this.$el.trigger("loginSuccess");
					this.close();
				}
			}, this);
		}
	},
	
	close: function() {
		this.$el.remove();
	},
	
	// Handler for when a user chooses to restore purchases.
	restore_clickHandler: function() {
		adobeDPS.receiptService.restorePurchases();
		this.close();
	}
});
