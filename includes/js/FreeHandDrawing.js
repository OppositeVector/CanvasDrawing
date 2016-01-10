
function FreeHandLine(mp, c) {

	this.points = [ mp ];
	var lastPoint = mp;
	var color = ToColor(c);
	this.invalid = false;

	this.AddPoint = function(mp) {
		this.points.push(mp);
		lastPoint = mp;
		this.invalid = true;
	}

	this.Draw = function(image) {
		for(var i = 1; i < this.points.length; ++i) {
			DrawLine(this.points[i-1], this.points[i], color, image);
		}
		this.invalid = false;
	}

	this.ApplyTransformation = function(t) {
		for(var i = 0; i < this.points.length; ++i) {
			t(this.points[i]);
		}
		this.invalid = true;
	}

	this.Serialize = function() {
		return {
			type: "freeHandLine",
			points: this.points,
			color: ToHex(color)
		}
	}

	this.Deserialize = function(obj) {
		this.points = obj.points.slice();
		color = ToColor(obj.color);
		invalid = true;
	}

}

function FreeHandCurve(mp, c) {

	this.points = [ mp ];
	var lineCount = 7;
	var color = ToColor(c);
	this.invalid = true;

	this.AddPoint = function(mp) {
		this.points.push(mp);
		this.invalid = true;
	}

	this.Draw = function(image) {
		var i = 0;
		for(; (i + 4) < this.points.length; i += 3) {
			DrawBezierCurve([ this.points[i], this.points[i+1], this.points[i+2], this.points[i+3] ], lineCount, color, image);
		}
		var f = [];
		for(; i < this.points.length; ++i) {
			f.push(this.points[i]);
		}
		DrawBezierCurve(f, lineCount, color, image);
		this.invalid = false;
	}

	this.ApplyTransformation = function(t) {
		for(var i = 0; i < this.points.length; ++i) {
			t(this.points[i]);
		}
		this.invalid = true;
	}

	this.Serialize = function() {
		return {
			type: "freeHandCurve",
			points: this.points,
			lineCount: lineCount,
			color: ToHex(color)
		}
	}

	this.Deserialize = function(obj) {
		this.points = obj.points.slice();
		lineCount = obj.lineCount;
		color = ToColor(obj.color);
		invalid = true;
	}

}