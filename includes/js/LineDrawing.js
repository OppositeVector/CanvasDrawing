// Requires BasicDrawing.js

function Line(p1, p2, c) {

	var point1 = { x: 0, y: 0 };
	var point2 = { x: 0, y: 0 };
	if(p1 != null) {
		point1 = { x: p1.x, y: p1.y };
	}
	if(p2 != null) {
		point2 = { x: p2.x, y: p2.y };
	}
	var color = ToColor(c);
	this.invalid = true;
	this.points = [ point1, point2 ];

	this.p1 = function(p) {

		if(p != null) {
			point1.x = p.x;
			point1.y = p.y;
			this.invalid = true;
		}

		return point1;
		
	}

	this.p2 = function(p) {

		if(p != null) {
			point2.x = p.x;
			point2.y = p.y;
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
		t(point1);
		t(point2);
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
		point2 = obj.point2;
		color = ToColor(obj.color);
		invalid = true;
		this.points = [ point1, point2 ];
	}

}