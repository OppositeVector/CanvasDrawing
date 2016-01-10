// Requires BasicDrawing.js

function Line(p1, p2, c) {

	var point1 = p1;
	var point2 = p2;
	var color = ToColor(c);
	this.invalid = true;

	this.p1 = function(p) {

		if(p != null) {
			point1 = p;
			this.invalid = true;
		}

		return point1;
		
	}

	this.p2 = function(p) {

		if(p != null) {
			point2 = p;
			this.invalid = true;
		}

		return point2;
		
	}

	this.color = function(c) {

		if(c != null) {
			color = ToColor(c);
			this.invalid = true;
		}
		
		return color;

	}

	this.Draw = function(image) {
		DrawLine(point1, point2, color, image);
		this.invalid = false;
	}

	this.ApplyTransformation = function(t) {
		point1 = t(point1);
		point2 = t(point2);
		this.invalid = true;
	}

	this.Serialize = function() {
		return {
			type: "line",
			point1: point1,
			point2: point2,
			color: ToHex(color)
		}
	}

	this.Deserialize = function(obj) {
		point1 = obj.point1;
		point2 = obj.point2,
		color = ToColor(obj.color);
		invalid = true;
	}

}