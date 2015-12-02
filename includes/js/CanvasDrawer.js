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

	var multiClickOperation = false;

	var simpleTypes = [
		{
			name: "Line",
			proto: function(mp, c) {
				this.actual = new Line(mp, mp); // From LineDrawing.js
				this.update = function(mp) {
					this.actual.p2(mp);
				}
				this.color = ToColor(c); // From BasicDrawing.js
				drawingObjects.push(this);
			},
			multiClick: false
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
			},
			multiClick: false
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
			},
			multiClick: false
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
			multiClick: false,
			properties: [
				{
					displayName: "Edge Count",
					type: "range",
					min: 3,
					max: 30,
					model: polyCount,
					id: "canvasDrawerEdgeCount",
					rangeText: true
				}
			]
		}
	]

	var complexTypes = [
		{
			name: "Polygon",
			proto: function(mp, c) {
				var first = mp;
				this.actual = new Polygon(mp);
				var line = new simpleTypes[0].proto(mp, c);
				var circle;
				var close = false;
				this.update = function(mp) {
					line.update(mp);
					var diff = Math.sqrt(Math.pow(first.x - mp.x, 2) + Math.pow(first.y - mp.y, 2));
					if(diff < 7) {
						if(circle == null) {
							// console.log("Here");
							circle = new simpleTypes[1].proto(first, c);
							circle.actual.radius(5);
						}
						close = true;
					} else {
						if(circle != null) {
							RemoveFromDrawing(circle);
							circle = null;
						}
						close = false;
					}
				}
				this.click = function(mp) {
					if(close == true) {
						if(circle != null) {
							RemoveFromDrawing(circle);
						}
						RemoveFromDrawing(line);
						multiClickOperation = false;
						currentObject = null;
						RemoveFromDrawing(this);
						if(this.actual.PointCount() > 2) {
							this.actual.Close();
							DrawPixels(this.actual.pixels(), this.color, backBuffer); // From BasicDrawing.js
						}
					} else {
						this.actual.AddPoint(mp);
						line.actual.p1(mp);
					}
				}
				this.color = ToColor(c);
				drawingObjects.push(this);
			},
			multiClick: true
		}, {
			name: "Bezier Curve",
			proto: function(mp, c) {
				this.actual = new BezierCurve(mp);
				this.update = function(mp) {

				}
				this.click = function(mp) {
					this.actual.AddPoint(mp);
					if(this.actual.PointCount() == 4) {
						RemoveFromDrawing(this);
						currentObject = null;
						multiClickOperation = false;
						DrawPixels(this.actual.pixels(), this.color, backBuffer); // From BasicDrawing.js
					}
				}
				this.color = ToColor(c);
				drawingObjects.push(this);
			},
			multiClick: true
		}
	]

	this.types = simpleTypes.slice();
	for(var i = 0; i < complexTypes.length; ++i) {
		this.types.push(complexTypes[i]);
	}

	var frontBufferEmpty = false;

	function RemoveFromDrawing(obj) {
		var index = drawingObjects.indexOf(obj);
		if(index > -1) {
			drawingObjects.splice(index, 1);
		}
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

				// console.log(drawingObjects.length);
				for(var i = 0; i < drawingObjects.length; ++i) {
					// console.log(drawingObjects[i]);
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
	var down = false;

	this.MouseDown = function(mousePoint) {

		if(multiClickOperation == true) {
			down = true;
		} else {
			if(currentShape != null) {
				currentObject = new currentShape.proto(mousePoint, currentColor);
				multiClickOperation = currentShape.multiClick;
			}
		}
		
	}

	this.MouseUp = function(mousePoint) {

		if(multiClickOperation == true) {
			if(down == true) {
				currentObject.click(mousePoint);
				down = false;
			}
		} else {
			if(currentObject != null) {
				DrawPixels(currentObject.actual.pixels(), currentObject.color, backBuffer); // From BasicDrawing.js
				RemoveFromDrawing(currentObject);
				currentObject = null;
			}
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