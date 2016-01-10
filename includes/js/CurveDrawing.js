
function BezierCurve(p, lc, c) {

	var points = [ p ]
	var lineCount = lc;
	var color = ToColor(c);
	this.invalid = true;

	this.AddPoint = function(p) {
		points.push(p);
		this.invalid = true;
	}

	this.Draw = function(image) {
		DrawBezierCurve(points, lineCount, color, image);
		invalid = false;
	}

	this.PointCount = function() {
		return points.length;
	}

	this.LineCount = function(lc) {

		if(lc != null) {
			lineCount = lc;
			this.invalid = true;
		}

		return lineCount;
		
	}

	this.ApplyTransformation = function(t) {
		for(var i = 0; i < points.length; ++i) {
			points[i] = t(points[i]);
		}
		this.invalid = true;
	}

	this.Serialize = function() {
		return {
			type: "bezier",
			points: points,
			color: ToHex(color)
		}
	}

	this.Deserialize = function(obj) {
		points = obj.points;
		lineCount = 50;
		color = ToColor(obj.color);
		invalid = true;
	}

}