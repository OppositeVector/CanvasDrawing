
function BezierCurve(p, lc, c) {

	this.points = [ p ]
	var lineCount = lc;
	var color = ToColor(c);
	this.invalid = true;

	this.AddPoint = function(p) {
		this.points.push(p);
		this.invalid = true;
	}

	this.Draw = function(image) {
		DrawBezierCurve(this.points, lineCount, color, image);
		invalid = false;
	}

	this.PointCount = function() {
		return this.points.length;
	}

	this.LineCount = function(lc) {

		if(lc != null) {
			lineCount = lc;
			this.invalid = true;
		}

		return lineCount;
		
	}

	this.ApplyTransformation = function(t) {
		for(var i = 0; i < this.points.length; ++i) {
			t(this.points[i]);
		}
		this.invalid = true;
	}

	this.Serialize = function() {
		return {
			type: "bezier",
			points: this.points,
			color: ToHex(color)
		}
	}

	this.Deserialize = function(obj) {
		this.points = obj.points.slice();
		lineCount = 50;
		color = ToColor(obj.color);
		invalid = true;
	}

}