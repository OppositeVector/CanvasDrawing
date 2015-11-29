// Requires BasicDrawing.js, LineDrawing.js, CircleDrawing.js, PolygonDrawing.js


function CanvasDrawer(c) {

	var canvas = c;
	var ctx = canvas[0].getContext("2d");
	var drawingObjects = [];
	var width = 0;
	var height = 0;

	var backBuffer = ctx.createImageData(canvas.width(), canvas.height());
	// var backBuffer32Bit = { 
	// 	width: backBuffer.width, 
	// 	height: backBuffer.height, 
	// 	buf: new ArrayBuffer(backBuffer.data.length),
	// 	buf8: new Uint8ClampedArray(this.buf),
	// 	data: new Uint32Array(this.buf) 
	// };
	var frontBuffer = ctx.createImageData(canvas.width(), canvas.height());
	// var frontBuffer32Bit = { 
	// 	width: frontBuffer.width, 
	// 	height: frontBuffer.height, 
	// 	buf: new ArrayBuffer(frontBuffer.data.length),
	// 	buf8: new Uint8ClampedArray(this.buf),
	// 	data: new Uint32Array(this.buf) 
	// };
	ClearImage(ToColor("#ffffff"), backBuffer); // From BasicDrawing.js

	var currentObject = null;
	var currentShape = null;
	var currentColor = "#000000";
	var polyCount = { val: 3 };

	this.types = [
		{
			name: "Line",
			proto: function(mp, c) {
				this.actual = new Line(mp, mp); // From LineDrawing.js
				this.update = function(mp) {
					this.actual.p2(mp);
				}
				this.color = ToColor(c); // From BasicDrawing.js
				drawingObjects.push(this);
			}
		}, {
			name: "Circle",
			proto: function(mp, c) {
				this.actual = new Circle(mp, 0); // From CircleDrawing.js
				this.update = function(mp) {
					var center = this.actual.center();
					aSq = Math.pow(mp.x - center.x, 2);
					bSq = Math.pow(mp.y - center.y, 2);
					var nRadius = Math.sqrt(aSq + bSq);
					this.actual.radius(nRadius);
				}
				this.color = ToColor(c); // From BasicDrawing.js
				drawingObjects.push(this);
			}
		}, {
			name: "Free Hand",
			proto: function(mp, c) {
				var pixels = [];
				this.actual = { pixels: function() { return pixels; } };
				var lastPoint = mp;
				this.update = function(mp) {
					pixels = CalculateLine(lastPoint, mp, pixels);
					lastPoint = mp;
				}
				this.color = ToColor(c); // From BasicDrawing.js
				drawingObjects.push(this);
			}
		}, {
			name: "Regular Polygon",
			proto: function(mp, c) {
				// console.log("orig: " + mp.x + " " + mp.y);
				this.actual = new RegularPolygon(mp, 0, polyCount.val);
				this.update = function(mp) {
					var center = this.actual.center();
					a = center.x - mp.x;
					b = center.y - mp.y;
					this.actual.radius(Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2)));
					this.actual.angle(Math.atan2(b, a));
					// console.log((this.actual.angle() / Math.PI) * 180);
					this.actual.Redraw();
					// console.log(this.actual.radius() + " " + this.actual.angle());
				}
				this.color = ToColor(c);
				drawingObjects.push(this);
			},
			properties: [
				new (function() {
					this.displayName = "Edge Count";
					this.type = "range";
					this.min = 3;
					this.max = 30;
					this.model = polyCount;
					this.id = "canvasDrawerEdgeCount";
					this.rangeText = true;
				})
			]
		}
	]

	var frontBufferEmpty = false;

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

			if(drawingObjects.length > 0) {

				var t0 = window.performance.now();
				// for(var i = 0 ; i < backBuffer32Bit.data.length; ++i) {
				// 	frontBuffer32Bit.data[i] = backBuffer32Bit.data[i];
				// }
				// frontBuffer.data.set(frontBuffer32Bit.buf8);
				frontBuffer.data.set(backBuffer.data);
				// for(var i = 0; i < frontBuffer.data.length; ++i) {
				// 	frontBuffer.data[i] = backBuffer.data[i];
				// }

				var t1 = window.performance.now() - t0;

				for(var i = 0; i < drawingObjects.length; ++i) {
					DrawPixels(drawingObjects[i].actual.pixels(), drawingObjects[i].color, frontBuffer); // From BasicDrawing.js
				}

				var t2 = window.performance.now() - t0 - t1;

				ctx.putImageData(frontBuffer, 0, 0);

				var t3 = window.performance.now() - t0 - t1 - t2;

				// console.log(t1 + " " + t2 + " " + t3);

			} else {
				ctx.putImageData(backBuffer, 0, 0);
			}

		});

	}

	window.requestAnimationFrame(Draw);

	this.MouseDown = function(mousePoint) {
		if(currentShape != null) {
			currentObject = new currentShape.proto(mousePoint, currentColor);
		}
	}

	this.MouseUp = function(mousePoint) {
		if(currentObject != null) {
			DrawPixels(currentObject.actual.pixels(), currentObject.color, backBuffer); // From BasicDrawing.js
			var index = drawingObjects.indexOf(currentObject);
			// console.log("Removing " + index);
			if(index > -1) {
				drawingObjects.splice(index, 1);
			}
			currentObject = null;
		}
	}

	this.MouseMove = function(mousePoint) {
		if(currentObject != null) {
			currentObject.update(mousePoint);
		}
	}

	this.ChangeShape = function(index) {
		currentShape = this.types[index];
	}

	this.ChangeColor = function(c) {
		currentColor = c;
	}

	this.Clear = function() {
		ClearImage(ToColor("#ffffff"), backBuffer);
	}

}