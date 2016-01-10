// Requires BasicDrawing.js

function RegularPolygon(cp, r, e, c) {

	var center = cp;
	var radius = r;
	var edges = e;
	var angle = 0;
	this.points = [];
	var color = ToColor(c);
	this.invalid = true;

	this.ReCalc = function() {
		this.points = CalculateRegularPolygon(center, radius, edges, angle);
	}

	this.Draw = function(image) {
		if(this.points.length > 3) {
			for(var i = 1; i < this.points.length; ++i) {
				DrawLine(this.points[i-1], this.points[i], color, image);
			}
			DrawLine(this.points[this.points.length - 1], this.points[0], color, image);
		}
		this.invalid = false;
	}

	this.center = function(p) {

		if(p != null) {
			center = p;
			this.ReCalc();
			this.invalid = true;
		}

		return center;

	}

	this.radius = function(r) {

		if(r != null) {
			radius = r;
			this.ReCalc();
			this.invalid = true;
		}

		return radius;

	}

	this.edges = function(e) {

		if(e != null) {
			edges = e;
			this.ReCalc();
			this.invalid = true;
		}

		return edges;

	}

	this.angle = function(a) {

		if(a != null) {
			angle = a;
			this.ReCalc();
			this.invalid = true;
		}

		return angle;

	}

	this.ApplyTransformation = function(t) {
		for(var i = 0; i < points.length; ++i) {
			t(this.points[i]);
		}
		this.invalid = true;
	}

	this.Serialize = function() {
		return {
			type: "polygon",
			points: points,
			color: ToHex(color)
		}
	}

}

function Polygon(p, c) {

	this.points = [ p ];
	var color = ToColor(c);
	this.invalid = true;
	var close = false;

	this.GetPoint = function(index) {
		if(index < this.points.length) {
			return this.points[index];
		}
	}

	this.AddPoint = function(p) {

		this.points.push(p);
		this.invalid = true;

	}

	this.PointCount = function() {
		return this.points.length;
	}

	this.Close = function(p) {
		close = true;
	}

	this.Draw = function(image) {
		for(var i = 1; i < this.points.length; ++i) {
			DrawLine(this.points[i-1], this.points[i], color, image);
		}
		if(close == true) {
			DrawLine(this.points[this.points.length - 1], this.points[0], color, image);
		}
	}

	this.ApplyTransformation = function(t) {
		for(var i = 0; i < this.points.length; ++i) {
			t(this.points[i]);
		}
		this.invalid = true;
	}

	this.Serialize = function() {
		return {
			type: "polygon",
			points: this.points,
			color: ToHex(color)
		}
	}

	this.Deserialize = function(obj) {
		this.points = obj.points.slice();
		color = ToColor(obj.color);
		this.Close();
		invalid = true;
	}

}