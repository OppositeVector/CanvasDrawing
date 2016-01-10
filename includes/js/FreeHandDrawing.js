
function FreeHandLine(mp, c) {

	var points = [ mp ];
	var lastPoint = mp;
	var color = ToColor(c);
	this.invalid = false;

	this.AddPoint = function(mp) {
		points.push(mp);
		lastPoint = mp;
		this.invalid = true;
	}

	this.Draw = function(image) {
		for(var i = 1; i < points.length; ++i) {
			DrawLine(points[i-1], points[i], color, image);
		}
		this.invalid = false;
	}

	this.ApplyTransformation = function(t) {
		for(var i = 0; i < points.length; ++i) {
			points[i] = t(points[i]);
		}
		this.invalid = true;
	}

	this.Serialize = function() {
		return {
			type: "freeHandLine",
			points: points,
			color: ToHex(color)
		}
	}

	this.Deserialize = function(obj) {
		points = obj.points;
		color = ToColor(obj.color);
		invalid = true;
	}

}

function FreeHandCurve(mp, c) {

	var points = [ mp ];
	var lineCount = 7;
	var color = ToColor(c);
	this.invalid = true;

	this.AddPoint = function(mp) {
		points.push(mp);
		this.invalid = true;
	}

	this.Draw = function(image) {
		var i = 0;
		for(; (i + 4) < points.length; i += 3) {
			DrawBezierCurve([ points[i], points[i+1], points[i+2], points[i+3] ], lineCount, color, image);
		}
		var f = [];
		for(; i < points.length; ++i) {
			f.push(points[i]);
		}
		DrawBezierCurve(f, lineCount, color, image);
		this.invalid = false;
	}

	this.ApplyTransformation = function(t) {
		for(var i = 0; i < points.length; ++i) {
			points[i] = t(points[i]);
		}
		this.invalid = true;
	}

	this.Serialize = function() {
		return {
			type: "freeHandCurve",
			points: points,
			lineCount: lineCount,
			color: ToHex(color)
		}
	}

	this.Deserialize = function(obj) {
		points = obj.points;
		lineCount = obj.lineCount;
		color = ToColor(obj.color);
		invalid = true;
	}

}