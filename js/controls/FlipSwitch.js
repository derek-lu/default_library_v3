(function($) {
	$.fn.flipSwitch = function(options) {
		return this.each(function() {
			var $this = $(this);

			var width = $this.width() - 2; // take into account the border.

			var html  = "<div id='flip-switch-grey-background'></div>";
				html += "<div id='flip-switch-green-border'></div>";
				html += "<div id='flip-switch-green-background'></div>";
				html += "<div id='flip-switch-thumb'></div>";

			$this.html(html);

			var $thumb = $this.find("#flip-switch-thumb");
			var thumbWidth = $thumb.width();

			var $greenBackground = $this.find("#flip-switch-green-background");

			var $greenBorder = $this.find("#flip-switch-green-border");

			var mouseDownX;			// The start coordinate of the mouse.
			var wasContentDragged;	// Flag for whether or not the user dragged.
			var startX;				// The start coordinate of the background.
			var targetX;			// The x when dragging.

			var leftBound = 0;
			var rightBound = width - thumbWidth - 2;

			var isOn = true;
			if (options && options.state == "off") {
				isOn = false;
				setThumbX(leftBound, false, isOn);
			} else {
				setThumbX(width - thumbWidth - 2, false, isOn);
			}
			
			this.addEventListener("touchstart", touchstartHandler);
			this.addEventListener("mousedown", touchstartHandler);
			
			function touchstartHandler(e) {
				e.preventDefault();
				
				startX = Number($thumb.css("-webkit-transform").split(",")[4]);
				mouseDownX = window.Touch ? e.touches[0].clientX : e.clientX;
				wasContentDragged = false;

				$thumb.css("-webkit-transition", "none");
				$greenBackground.css("-webkit-transition", "none");
				$greenBorder.css("-webkit-transition", "none");
				
				document.addEventListener("touchmove", touchmoveHandler);
				document.addEventListener("touchend", touchendHandler);
				document.addEventListener("mousemove", touchmoveHandler);
				document.addEventListener("mouseup", touchendHandler);
			}

			function touchmoveHandler(e) {
				var clientX = window.Touch ? e.touches[0].clientX : e.clientX;
				if (wasContentDragged || Math.abs(clientX - mouseDownX) > 5) {
					wasContentDragged = true;
					
					var deltaX = clientX - mouseDownX;
					targetX = startX + deltaX;

					if (targetX < leftBound) // Don't go past the left edge.
						targetX = leftBound;
					else if (targetX > rightBound) // Don't go past the right edge.
						targetX = rightBound;

					var opacity = targetX / rightBound - leftBound;
					$thumb.css("-webkit-transform", "translateX(" + targetX + "px)");
					$greenBackground.width(targetX + thumbWidth / 2);
					$greenBackground.css("opacity", opacity);
					$greenBorder.css("opacity", opacity);
				}
			}
			
			function touchendHandler(e) {
				document.removeEventListener("touchmove", touchmoveHandler);
				document.removeEventListener("touchend", touchendHandler);
				document.removeEventListener("mousemove", touchmoveHandler);
				document.removeEventListener("mouseup", touchendHandler);
				
				var previousIsOn = isOn;
				if (wasContentDragged) {
					if (targetX > (rightBound - leftBound) / 2) {
						isOn = true;
						targetX = rightBound;
					} else {
						isOn = false;
						targetX = leftBound;
					}
				} else {
					isOn = !isOn;
					// User tapped the control so toggle the state.
					targetX = isOn ? width - thumbWidth - 2 : 0;
				}

				setThumbX(targetX, true, isOn)
				
				if (previousIsOn != isOn)
					$this.trigger("change", isOn);
			}

			function setThumbX(value, isAnimate, isOn) {
				if (isAnimate) {
					$thumb.css("-webkit-transition", "-webkit-transform .3s");
					$thumb.css("-webkit-transition-timing-function", "cubic-bezier(0, 0, 0, 1)");
					$greenBackground.css("-webkit-transition", "width .3s, opacity .3s");
					$greenBackground.css("-webkit-transition-timing-function", "cubic-bezier(0, 0, 0, 1)");
					$greenBorder.css("-webkit-transition", "opacity .3s");
					$greenBorder.css("-webkit-transition-timing-function", "cubic-bezier(0, 0, 0, 1)");
				}

				$thumb.css("-webkit-transform", "translateX(" + value + "px)");
				$greenBackground.width(value + thumbWidth / 2);
				$greenBackground.css("opacity", isOn ? 1 : 0);
				$greenBorder.css("opacity", isOn ? 1 : 0);
			}
			
			return this;
		})
	}
})(jQuery);
