// Requires BasicDrawing.js

function Circle(cp, r, c) {

	var center = cp;
	var radius = r;
	var color = ToColor(c);
	this.invalid = true;

	this.center = function(p) {

		if(p != null) {
			center = p;
			this.invalid = true;
		}

		return center;
		
	}

	this.radius = function(r) {

		if(r != null) {
			radius = r;
			this.invalid = true;
		}

		return radius;
		
	}

	this.Draw = function(image) {
		DrawCircle(center, radius, color, image);
		this.invalid = false;
	}

	this.ApplyTransformation = function(t) {
		center = t(center);
		this.invalid = true;
	}

	this.Serialize = function() {
		return {
			type: "circle",
			center: center,
			radius: radius,
			color: ToHex(color)
		}
	}

	this.Deserialize = function(obj) {
		center = obj.center;
		radius = obj.radius,
		color = ToColor(obj.color);
		invalid = true;
	}

}