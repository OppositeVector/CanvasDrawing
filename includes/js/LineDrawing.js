// Requires BasicDrawing.js

function Line(p1, p2) {

	var point1 = p1;
	var point2 = p2;
	var pixels = [];

	this.Redraw = function() {
		pixels.length = 0;
		pixels = CalculateLine(point1, point2, pixels); // From BasicDrawing.js
	}

	this.p1 = function(p) {

		if(p != null) {
			point1 = p;
			this.Redraw();
		}

		return point1;
		
	}

	this.p2 = function(p) {

		if(p != null) {
			point2 = p;
			this.Redraw();
		}

		return point2;
		
	}

	this.pixels = function() {
		return pixels;
	}

}