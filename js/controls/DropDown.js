(function($) {
$.fn.dropDown = function(method) {
	if (this[0][method]) {
		return this[0][ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
	} else if ( typeof method === 'object' || ! method ) {
		return this.each(function() {
			var ITEM_HEIGHT = 40;
			var BACKGROUND_PADDING = 5;
			var WIDTH = 250;
			var TRIANGLE_HEIGHT = 10;
			var TRIANGLE_WIDTH = 16;
			
			var isOpen = false;
			var $menu;
			
			var selectedIndex;
			var $this = $(this);
			var verticalGap = method.verticalGap; // The gap between the triangle and the button that opens/closes the menu.
			
			var isRedraw;
			
			var triggered;
			
			var disabledHash = {};
	
			init(method);
			
			function init(options) {
				// Add a handler for when a user clicks the icon to open the dropdown.
				$this.on("click", clickHandler);
			}
			
			function clickHandler() {
				if (isOpen) {
					close();
				} else {
					var numItems = $this.children().length;
					
					isOpen = true;
					triggered = false;
					
					$(window).on("resize", updateLayout);
					
					if ($menu && !isRedraw) {
						$menu.css("display", "inline");
						$menu.appendTo("body");
						$modal.appendTo("body");
					} else {
						if (isRedraw) {
							$menu.remove();
							$("body").off("mousedown touchstart", ".drop-down-menu .item");		
						}
						
						var itemHtml = "";
						var children = $this.children();
						var isFlipSwitch = false;
						var flipSwitchState;
						// Loop through each item and create the html for the items.
						for (var i = 0; i < numItems; i++) {
							var child = $(children[i]);
								
							if (child.attr("class") == "flip-switch") { // The menu item contains a flip switch control.
								itemHtml += "<div class='item' control='" + child.attr("class") + "'>";
								itemHtml +=     "<div class='control-label'>" + child.html() + "</div>";
								itemHtml +=     "<div class='flip-switch' id='" + child.attr('id') +"'></div>";
								itemHtml += "</div>";
								
								isFlipSwitch = true;
								
								flipSwitchState = child.attr('state');
							} else {
								var cssClass = disabledHash[i] ? "item-disabled item" : "item";
								itemHtml += "<div class='" + cssClass + "' id='" + child.attr('id') + "' >" + child.html() + "</div>";
							}
							
							if (i + 1 < numItems) // add a divider for the items except for the last one.
								itemHtml += "<hr>";
						}
						
						// Add handler for when the user selects an item.
						$("body").on("mousedown touchstart", ".drop-down-menu .item", function(e) {
							var $item = $(e.currentTarget);
							
							// Find the index of the child to see if it is disabled.
							var index = $item.index() - $item.index()  / 2; // Take into account the <hr> elements.
							if ($item.attr("control") == "flip-switch" || disabledHash[index]) // Don't do anything if the row is a flipswitch or disabled.
								return;
								
							$item.addClass("selected");
							
							// User selected an item. Show the highlight for 70ms then fadeout the menu.
							$item.one("mouseup touchend", function() {
								$menu.delay(70).fadeOut(200, function() {
									$item.removeClass("selected");// Remove the selected state.
									$item.off("mouseout touchleave mouseover touchmove");
									selectedIndex = Math.floor($item.index() / 2); // Take into account the <hr> elements.
									
									if (!triggered) {
										triggered = true;
										$this.trigger("change", $item.attr("id"));
										close();
									}
								});
							});
							
							$item.on("mouseout touchleave", function() {
								$item.removeClass("selected");
							});
							
							$item.on("mouseover touchmove", function() {
								$item.addClass("selected");
							})
						});
				
						var height = ITEM_HEIGHT * numItems + BACKGROUND_PADDING * 2 - 8; // Subtract 8 from the height to offset padding.
		
						var html  = "<div class='drop-down-menu'>";
						    html +=    "<canvas id='dropDownCanvas' width='" + WIDTH + "' height='" + TRIANGLE_HEIGHT + "'>";
						    html +=    "</canvas>";
						    html +=    "<div class='drop-down-menu-background' style='width:" + (WIDTH - 10) + "px;height:" + height + "px'>"; // subtract 10 from the width to offset padding.
						    html +=        itemHtml;
						    html +=    "</div>";
						    html += "</div>";
						
						$menu = $(html).appendTo("body");
						
						// Create a modal background to stop clicks.
						$modal = $("<div class='modal-background-grey'></div>").appendTo("body");
						$modal.css("display", "inline");
						
						$modal.on("click", modalBackground_clickHandler);
						
						// Add the flip switch. Currently this only supports one flip switch in the menu.
						$(".drop-down-menu-background .flip-switch").flipSwitch({state: flipSwitchState});
					}
					
					updateLayout();
					
					isRedraw = false;
					
					// Change the y coord in case the user scrolled. Assume the x coord does not change.
					var y = $this.offset().top + $this.height() + ($this.parents().css("position") == "fixed" ? -$(window).scrollTop() : 0) + $(window).scrollTop();
					$menu.css("top", y + verticalGap);
				}
			}
			
			// Sets the coordinates of the menu and triangle.
			function updateLayout() {
				var canvas = document.getElementById("dropDownCanvas");
				var ctx = canvas.getContext("2d");
				
				// Calculate the y coord of the bottom of the button.
				var offset = $this.offset();
				var x;
				var triangleX;
				// Attempt to position from the left.
				// Offset the x of the rectangle by 8 to the left of the arrow.
				// Add 10 to the width to take into account the padding for the inner background.
				if (offset.left - 8 + WIDTH + 10 > $(window).width()) { // dropdown will go over the right edge so shift to the left.
					x = $(window).width() - WIDTH;
					triangleX = offset.left + ($this.width() / 2) - x - 17;
				} else { // position the dropdown with the button.
					x = offset.left;
					triangleX = ($this.width() / 2);
				}

				$menu.css("left", x + 4);
				
				ctx.clearRect(0, 0, TRIANGLE_WIDTH, TRIANGLE_HEIGHT);
				// Draw the triangle.
				ctx.beginPath();
				ctx.fillStyle = "#f7f7f7";
				ctx.moveTo(triangleX, 0);
				ctx.lineTo(triangleX + TRIANGLE_WIDTH / 2, TRIANGLE_HEIGHT);
				ctx.lineTo(triangleX - TRIANGLE_WIDTH / 2, TRIANGLE_HEIGHT);
				ctx.fill();
			}
			
			function modalBackground_clickHandler(e) {
				close();
			}
			
			function close() {
				isOpen = false;
				
				$menu.detach();
				$modal.detach();
				
				$(window).off("resize", updateLayout);
			}
			
			/**
			 * Public functions.
			 */
			this.getSelectedIndex = function() {
				return selectedIndex;
			}
			
			this.getSelectedLabel = function() {
				return $($this.children()[selectedIndex]).html();
			}
			
			// Forces a redraw of the menu the next time it is opened.
			// This should be used when the HTML of an item has changed such as toggling between login/logout.
			this.invalidate = function() {
				isRedraw = true;
			}
			
			this.setDisabled = function(index) {
				if ($menu)
					$($menu.find(".item").get(index)).addClass("item-disabled");
				
				disabledHash[index] = true;
			}
			
			this.setEnabled = function(index) {
				if ($menu)
					$($menu.find(".item").get(index)).removeClass("item-disabled");
				
				delete disabledHash[index];
			}
		});
	} else {
		$.error( 'Method ' +  method + ' does not exist on jQuery.dropDown' );
	} 
}
})(jQuery);
