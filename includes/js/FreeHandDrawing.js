
function FreeHandLine(mp) {

	var pixels = [];
	var lastPoint = mp;

	this.AddPoint = function(mp) {
		pixels = CalculateLine(mp, lastPoint, pixels);
		lastPoint = mp;
	}

	this.pixels = function() {
		return pixels;
	}

}

function FreeHandCurve(mp) {

	var pixels = [];
	var incompletePixels = [];
	var points = [ mp ];
	var removeCount = 0;

	this.AddPoint = function(mp) {
		points.push(mp);
		if(points.length < 4) {
			pixels.splice(pixels.length - removeCount, removeCount);
			// console.log("Removed:" + removeCount);
			var len = pixels.length;
			pixels = CalculateBezierCurve(points, 20, pixels);
			removeCount = pixels.length - len;

		} else {
			pixels.splice(pixels.length - removeCount, removeCount);
			pixels = CalculateBezierCurve(points, 20, pixels);
			points.length = 0;
			points.push(mp);
			removeCount = 0;
		}
	}

	this.pixels = function() {
		return pixels;
	}

}