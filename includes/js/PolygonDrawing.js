// Requires BasicDrawing.js

function RegularPolygon(cp, r, e, au) {

	var auto = au;
	if(auto == null) {
		auto = false;
	}
	var center = cp;
	var radius = r;
	var edges = e;
	var angle = 0;
	var pixels = [];

	this.Redraw = function() {

		pixels.length = 0;
		pixels = CalculateRegularPolygon(center, radius, edges, angle, pixels);

	}

	this.pixels = function() {
		return pixels;
	}

	this.center = function(p) {

		if(p != null) {
			center = p;
			if(auto == true) {
				this.Redraw();
			}
		}

		return center;

	}

	this.radius = function(r) {

		if(r != null) {
			radius = r;
			if(auto == true) {
				this.Redraw();
			}
		}

		return radius;

	}

	this.edges = function(e) {

		if(e != null) {
			edges = e;
			if(auto == true) {
				this.Redraw();
			}
		}

		return edges;

	}

	this.angle = function(a) {

		if(a != null) {
			angle = a;
			if(auto == true) {
				this.Redraw();
			}
		}

		return angle;

	}

}

function Polygon(p) {

	var points = [ p ];
	var pixels = [];

	this.Redraw = function(close) {

		pixels.length = 0;
		for(var i = 0; i < (points.length - 1); ++i) {
			pixels = CalculateLine(points[i], points[i+1], pixels);
		}

		if(close == true) {
			pixels = CalculateLine(points[0],points[points.length - 1], pixels);
		}

		// console.log(points);
		// console.log(pixels);

	}

	this.GetPoint = function(index) {
		if(index < points.length) {
			return points[index];
		}
	}

	this.AddPoint = function(p) {

		points.push(p);
		this.Redraw(false);

	}

	this.PointCount = function() {
		return points.length;
	}

	this.Close = function(p) {
		this.Redraw(true);
	}

	this.pixels = function() {
		return pixels;
	}

}