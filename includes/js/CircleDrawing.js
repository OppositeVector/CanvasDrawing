// Requires BasicDrawing.js

function Circle(cp, r) {

	var center = cp;
	var radius = r;
	var pixels = [];

	this.Redraw = function() {
		pixels.length = 0;
		pixels = CalculateCircle(center, radius, pixels); // From BasicDrawing.js
	}

	this.center = function(p) {

		if(p != null) {
			center = p;
			this.Redraw();
		}

		return center;
		
	}

	this.radius = function(r) {

		if(r != null) {
			radius = r;
			this.Redraw();
		}

		return radius;
		
	}

	this.pixels = function() {
		return pixels;
	}

}