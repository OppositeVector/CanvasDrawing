
function BezierCurve(p, lc) {

	var points = [ p ]
	var pixels = [];
	var distance = 0;
	var lineCount = lc;

	this.Redraw = function() {
		pixels.length = 0;
		pixels = CalculateBezierCurve(points, lc, pixels);
	}

	this.AddPoint = function(p) {

		var last = points[points.length - 1];
		distance += Math.sqrt(Math.pow(p.x - last.x, 2) + Math.pow(p.y - last.y, 2));
		points.push(p);
		this.Redraw();

	}

	this.pixels = function() {
		return pixels;
	}

	this.PointCount = function() {
		return points.length;
	}

	this.LineCount = function(lc) {

		if(lc != null) {
			lineCount = lc;
			this.Redraw();
		}

		return lineCount;
		
	}

}