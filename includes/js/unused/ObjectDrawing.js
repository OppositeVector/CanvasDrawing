
function CanvasDrawer(canvas) {

	function ObjectFactory(canvas) {

		function LinePixels(p1, p2) {

			var retVal = [];
			var xD = p2.x - p1.x;
			var yD = p2.y - p1.y;
			if((xD == 0) && (yD == 0)) {
				return [ p1 ];
			}
			var absX = Math.abs(xD);
			var absY = Math.abs(yD);
			var g = (absX > absY) ? absX : absY;

			var xStep = xD / g;
			var yStep = yD / g;

			var curX = p1.x;
			var curY = p1.y;

			// console.log(g);
			for(var i = 0; i < g; i += 1) {
				retVal.push({ x: Math.floor(curX), y: Math.floor(curY) });
				curX += xStep;
				curY += yStep;
			}

			return retVal;

		}

		this.Free = function(p1, c) {

			return new (function(p1, c) {

				var pixels = [ p1 ];
				var color = ToColor(c);
				var lastPoint = p1;

				this.Draw = function() {
					for(var i = 0; i < pixels.length; ++i) {
						DrawPixel(pixels[i].x, pixels[i].y, color);
					}
				}

				this.UpdateDrag = function(mousePoint) {
					var ret = LinePixels(lastPoint, mousePoint);
					for(var i = 0; i < ret.length; ++i) {
						pixels.push(ret[i]);
					}
					lastPoint = mousePoint;
				}

				objects.push(this);
				return this;

			})(p1, c);

		}		

		this.Line = function(p1, p2, c) {

			return new (function(p1, p2, c) {

				var point1 = p1;
				var point2;
				var pixels = [];
				var color;
				if(c == null) {
					point2 = p1;
					color = ToColor(p2);
				} else {
					point2 = p2;
					color = ToColor(c);
				}
				// console.log(JSON.stringify(color) + " " + JSON.stringify(point1) + " " + JSON.stringify(point2));
				var internal = this;

				this.DrawOld = function() {

					var xD = point2.x - point1.x;
					var yD = point2.y - point1.y;
					var absX = Math.abs(xD);
					var absY = Math.abs(yD);
					var g = (absX > absY) ? absX : absY;

					var xStep = xD / g;
					var yStep = yD / g;

					var curX = point1.x;
					var curY = point1.y;

					for(var i = 0; i < g; ++i) {
						DrawPixel(curX, curY, color);
						curX += xStep;
						curY += yStep;
					}

				}

				this.Draw = function() {
					for(var i = 0; i < pixels.length; ++i) {
						DrawPixel(pixels[i].x, pixels[i].y, color);
					}
				}

				this.UpdateDrag = function(mousePoint) {
					point2 = mousePoint;
					pixels = LinePixels(point1, point2);
				}

				this.Remove = function() {
					var me = objects.indexOf(internal);
					if(me != -1) {
						objects.splice(me, 1);
					}
				}

				this.P1 = function(x, y) {

					if(y == null) {
						if(x == null) {
							return p1;
						}
						y = x.y;
						x = x.x;
					}

					p1.x = x;
					p1.y = y;
					return p1;

				}

				this.P2 = function(x, y) {

					if(y == null) {
						if(x == null) {
							return p2;
						}
						y = x.y;
						x = x.x;
					}

					p2.x = x;
					p2.y = y;
					return p2;

				}

				this.Pos = function(x, y) {

					var delta = { x: ((p2.x - p1.x) / 2), y: ((p2.y - p1.y) / 2) };
					if(y == null) {
						if(x == null) {
							return { x: p1.x + delta.x, y: p1.y + delta.y };
						}
						y = x.y;
						x = x.x;
					}

					p1.x = x - delta.x;
					p1.y = y - delta.y;
					p2.x = x + delta.x;
					p2.y = y + dleta.y;

					return { x: x, y: y };

				}

				objects.push(this);
				return this;

			})(p1, p2, c);
			

		}

		this.Circle = function(cp, c, r) {

			return new (function(cp, r, c) {

				var radius = r;
				if(radius == null) {
					radius = 0;
				}

				var centerPoint = cp;
				var color = ToColor("#ff0000");

				if(c != null) {
					color = ToColor(c);
				}

				this.Draw = function() {

					var x = radius;
					var y = 0;

					var decisionOver2 = 1 - x;

					while(y <= x) {

						DrawPixel( x + centerPoint.x,  y + centerPoint.y, color);
					    DrawPixel( y + centerPoint.x,  x + centerPoint.y, color);
					    DrawPixel(-x + centerPoint.x,  y + centerPoint.y, color);
					    DrawPixel(-y + centerPoint.x,  x + centerPoint.y, color);
					    DrawPixel(-x + centerPoint.x, -y + centerPoint.y, color);
					    DrawPixel(-y + centerPoint.x, -x + centerPoint.y, color);
					    DrawPixel( x + centerPoint.x, -y + centerPoint.y, color);
					    DrawPixel( y + centerPoint.x, -x + centerPoint.y, color);

					    ++y;
					    if (decisionOver2<=0){
					      decisionOver2 += 2 * y + 1;   // Change in decision criterion for y -> y+1
					    }else{
					      x--;
					      decisionOver2 += 2 * (y - x) + 1;   // Change for y -> y+1, x -> x-1
					    }

					}

				}

				this.Center = function(x, y) {

					if(y == null) {
						if(x == null) {
							return centerPoint;
						}
						y = x.y;
						x = x.x;
					}
					centerPoint.x = x;
					centerPoint.y = y;
					return centerPoint;

				}

				this.Radius = function(r) {

					if(r == null) {
						return radius;
					}

					radius = r;
					return radius;

				}

				this.UpdateDrag = function(mousePoint) {
					aSq = Math.pow((centerPoint.x - mousePoint.x), 2);
					bSq = Math.pow((centerPoint.y - mousePoint.y), 2);
					radius = Math.sqrt(aSq + bSq);
				}

				objects.push(this);
				return this;

			})(cp, r, c);
			
		}

		this.RegularPolygon = function(cp, c) {

			return new (function(cp, c) {

				var color = ToColor(c);
				var angle = 0;
				var center = cp;
				var radius = 0;
				var edges = 4;
				var degreesPerLine = 360 / edges;
				var dplRads = Math.PI * (degreesPerLine / 180); // DegreesPerLine in radians
				var sectionLength = Math.sqrt((2 - (2 * Math.cos(dplRads)))) * radius;

				var pixels = [];

				this.Draw = function() {

					for(var i = 0 ; i < pixels.length; ++i) {
						DrawPixel(pixels[i].x, pixels[i].y, color);
					}

				}

				this.Redraw = function() {

					pixels = [ center ];
					var current = { 
						x: center.x + (radius * Math.sin(angle)),
						y: center.y - (radius * Math.cos(angle)),
						alpha: (dplRads / 2) + angle
					};

					for(var i = 0; i < edges; ++i) {

						var p1 = { x: current.x, y: current.y };
						current.x += sectionLength * Math.cos(current.alpha);
						current.y += sectionLength * Math.sin(current.alpha);
						var ret = LinePixels(p1, current);
						for(var i = 0; i < ret.length; ++i) {
							pixels.push(ret[i]);
						}
						current.alpha += dplRads;

					}

				}

				this.UpdateDrag = function(mousePoint) {

					a = center.x - mousePoint.x;
					b = center.y - mousePoint.y;
					radius = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
					angle = Math.atan2(b, a);
					sectionLength = Math.sqrt((2 - (2 * Math.cos(dplRads)))) * radius;
					this.Redraw();

				}

				objects.push(this);
				return this;

			})(cp, c);

		}

		this.types = [{
			name: "Line",
			proto: this.Line
		}, {
			name: "Circle",
			proto: this.Circle
		}, {
			name: "Free Hand",
			proto: this.Free
		}, {
			name: "Regular Plygon",
			proto: this.RegularPolygon
		}];

		
	}

	this.prevFrame = 0;
	this.deltaTime = 0;

	var frames = 0;

	var objects = [];
	var ctx = canvas.getContext("2d");
	var width = 0;
	var height = 0;
	var pixelData;
	var aCanvasWidth;

	function OnResize() {
		width = canvas.width;
		height = canvas.height;
		pixelData = ctx.getImageData(0, 0, width, height);
		aCanvasWidth = width * 4;
	}

	// OnResize();

	// console.log(ctx);
	function DrawPixelOld(x, y, color) {

		if(y == null) {
			y = x.y;
			x = x.x;
		}
		ctx.fillStyle = color;
		ctx.fillRect(Math.round(x), Math.round(y), 1, 1);

	}

	function DrawPixel(x, y, color) {

		// console.log(color);
		x = Math.floor(x);
		y = Math.floor(y);
		loc = (y * aCanvasWidth) + (x * 4);
		pixelData.data[loc] = color.r;
		pixelData.data[loc + 1] = color.g;
		pixelData.data[loc + 2] = color.b;
		pixelData.data[loc + 3] = color.a;

	}

	function GetPixel(x, y) {

		x = Math.floor(x);
		y = Math.floor(y);
		loc = (y * aCanvasWidth) + (x * 4);
		return { 
			r: pixelData.data[loc], 
			g: pixelData.data[loc + 1], 
			b: pixelData.data[loc + 2], 
			a: pixelData.data[loc + 3] 
		};

	}

	function CheckPixel(x, y, color) {

		x = Math.floor(x);
		y = Math.floor(y);
		loc = (y * aCanvasWidth) + (x * 4);
		if(pixelData.data[loc] != color.r) {
			return false;
		}
		if(pixelData[loc + 1] != color.g) {
			return false;
		}
		if(pixelData[loc + 2] != color.b) {
			return false;
		}

		return true;

	}

	var ToColor = this.ToColor = function(hex) {

		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	    return result ? {
	        r: parseInt(result[1], 16),
	        g: parseInt(result[2], 16),
	        b: parseInt(result[3], 16),
	        a: 255
	    } : null;

	}

	function Redraw() {



	}

	function Draw(timeStamp) {

		setTimeout(function() {

			++frames;
			// console.log(frames);
			this.deltaTime = (timeStamp - this.prevFrame) / 1000;
			this.prevFrame = timeStamp;

			if(isNaN(this.deltaTime)) {
				this.deltaTime = 0;
			}

			window.requestAnimationFrame(Draw);

			if((width != canvas.width) || (height != canvas.height)) {
				OnResize();
				console.log(width + " " + height);
			} else {
				// Clear the image
				for(var i = 3; i < pixelData.data.length; i += 4) {
					pixelData.data[i] = 0;
				}
			}
			
			// pixelData = ctx.createImageData(width, height);
			// ctx.clearRect(0, 0, width, height);

			for(var i = 0; i < objects.length; ++i) {
				objects[i].Draw(deltaTime);
				// console.log("drew: " + objects[i]);
			}

			ctx.putImageData(pixelData, 0, 0);

		});

	}

	this.Clear = function() {
		objects = [];
	}

	window.requestAnimationFrame(Draw);

	this.factory = new ObjectFactory(canvas);

}


