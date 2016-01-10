// Requires BasicDrawing.js, LineDrawing.js, CircleDrawing.js, PolygonDrawing.js

function CanvasDrawer(c) {

	// START: Canvas and objects initialization

	var canvas = c;
	var ctx = canvas[0].getContext("2d");
	var drawingObjects = [];
	var width = 0;
	var height = 0;
	var invalid = false;

	var white = ToColor("#ffffff");
	var backBuffer = ctx.createImageData(canvas.width(), canvas.height());
	var frontBuffer = ctx.createImageData(canvas.width(), canvas.height());
	var clearBuffer = ctx.createImageData(canvas.width(), canvas.height());
	ClearImage(white, clearBuffer);
	ClearImage(white, backBuffer); // From BasicDrawing.js
	ctx.putImageData(backBuffer, 0, 0);

	var currentObject = null;
	var currentShape = null;
	var currentColor = "#000000";
	var polyCount = new (function() { 
		this.val = 3;
		this.reset = function() { 
			this.val = 7; 
		} 
	})();
	var curveType = new (function() {
		this.val = 0;
		this.reset = function() {
			this.val = 0;
		}
	})();

	var data = [
		
	]

	var multiClickOperation = false;
	var newFrame = false;

	// END: Canvas and objects initialization

	// START: Type specifications, these objects connect the drawing back functions to the
	// to the angular app that will display and send events

	var simpleTypes = [
		{
			name: "Line",
			proto: function(mp, c) {
				this.actual = new Line(mp, mp, c); // From LineDrawing.js
				this.update = function(mp) {
					this.actual.p2(mp);
				}
				drawingObjects.push(this.actual);
			},
			multiClick: false
		}, {
			name: "Circle",
			proto: function(mp, c) {
				this.actual = new Circle(mp, 0, c); // From CircleDrawing.js
				this.update = function(mp) {
					var center = this.actual.center();
					aSq = Math.pow(mp.x - center.x, 2);
					bSq = Math.pow(mp.y - center.y, 2);
					var nRadius = Math.sqrt(aSq + bSq);
					this.actual.radius(nRadius);
				}
				drawingObjects.push(this.actual);
			},
			multiClick: false
		}, {
			name: "Free Hand",
			proto: function(mp, c) {
				if(curveType.val == 0) {
					this.actual = new FreeHandLine(mp, c);
				} else if(curveType.val == 1) {
					this.actual = new FreeHandCurve(mp, c);
				}
				this.update = function(mp) {
					if(newFrame == true) {
						this.actual.AddPoint(mp);
						newFrame = false;
					}
				}
				drawingObjects.push(this.actual);
			},
			multiClick: false,
			properties: [
				{
					displayName: "Line",
					type: "radio",
					value: "0",
					model: curveType,
					id: "canvasDrawerLineType",
				},
				{
					displayName: "Bezier",
					type: "radio",
					value: "1",
					model: curveType,
					id: "canvasDrawerCurveType",
				},	
			]
		}, {
			name: "Regular Polygon",
			proto: function(mp, c) {
				this.actual = new RegularPolygon(mp, 0, polyCount.val, c);
				var center = mp;
				this.update = function(mp) {
					a = center.x - mp.x;
					b = center.y - mp.y;
					this.actual.radius(Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2)));
					this.actual.angle(Math.atan2(b, a));
				}
				drawingObjects.push(this.actual);
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
				this.actual = new Polygon(mp, c);
				var line = new simpleTypes[0].proto(mp, c);
				var circle;
				var close = false;
				this.update = function(mp) {
					line.update(mp);
					var diff = Math.sqrt(Math.pow(first.x - mp.x, 2) + Math.pow(first.y - mp.y, 2));
					if(diff < 7) {
						if(circle == null) {
							circle = new simpleTypes[1].proto(first, c);
							circle.actual.radius(5);
						}
						close = true;
					} else {
						if(circle != null) {
							RemoveFromDrawing(circle.actual);
							circle = null;
						}
						close = false;
					}
				}
				this.click = function(mp) {
					if(close == true) {
						if(circle != null) {
							RemoveFromDrawing(circle.actual);
						}
						RemoveFromDrawing(line.actual);
						multiClickOperation = false;
						currentObject = null;
						if(this.actual.PointCount() > 2) {
							this.actual.Close();
						}
					} else {
						this.actual.AddPoint(mp);
						line.actual.p1(mp);
					}
				}
				drawingObjects.push(this.actual);
			},
			multiClick: true
		}, {
			name: "Bezier Curve",
			proto: function(mp, c) {
				this.actual = new BezierCurve(mp, polyCount.val, c);
				this.update = function(mp) {

				}
				this.click = function(mp) {
					this.actual.AddPoint(mp);
					if(this.actual.PointCount() == 4) {
						currentObject = null;
						multiClickOperation = false;
					}
				}
				drawingObjects.push(this.actual);
			},
			multiClick: true,
			properties: [ 
				{
					displayName: "Line Count",
					type: "range",
					min: 5,
					max: 200,
					model: polyCount,
					id: "canvasDrawerEdgeCount",
					rangeText: true
				}
			]
		}
	]

	var transformations = [
		{
			name: "Move",
			proto: function(mp) {
				this.prev = mp;
				this.update = function(mp) {
					if((this.prev.x != mp.x) || (this.prev.y != mp.y)) {
						var tx = mp.x - this.prev.x;
						var ty = mp.y - this.prev.y;
						// var matrix = math.matrix([
						// 	[1, 0, 0],
						// 	[0, 1, 0],
						// 	[tx, ty, 1]
						// ]);
						// console.log(matrix);
						for(var i = 0; i < drawingObjects.length; ++i) {
							drawingObjects[i].ApplyTransformation(function(p) {
								p.x += tx;
								p.y += ty;
							});
						}
						this.prev = mp;
					}
				}
			}
		}, 
		{
			name: "Rotate",
			proto: function(mp) {
				this.orig = mp;
				var moveOrigin = { x: mp.x * -1, y: mp.y * -1 };
				var line = new simpleTypes[0].proto(mp, "#ff0000");
				var a, b, angle, phi, cosPhi, sinPhi, x, y;
				this.update = function(mp) {
					line.update(mp);
					if(this.prev == null) {
						a = this.orig.x - mp.x;
						b = this.orig.y - mp.y;
						if((Math.abs(a) > 50) || (Math.abs(b) > 50)) {
							this.prev = Math.atan2(b, a);
							line.actual.color("#00ff00");
						}
					} else if((this.prev.x != mp.x) || (this.prev.y != mp.y)) {
						a = this.orig.x - mp.x;
						b = this.orig.y - mp.y;
						angle = Math.atan2(b, a);
						phi = this.prev - angle;
						cosPhi = Math.cos(phi);
						sinPhi = Math.sin(phi);
						// var spinMatrix = math.matrix([
						// 	[Math.cos(phi), Math.sin(phi), 0],
						// 	[Math.sin(phi) * -1, Math.cos(phi), 0],
						// 	[0, 0, 1]
						// ]);
						// for(var i = 0; i < drawingObjects.length; ++i) {
						// 	drawingObjects[i].ApplyTransformation(Trans);
						// }
						for(var i = 0; i < drawingObjects.length; ++i) {
							drawingObjects[i].ApplyTransformation(function(p) {
								p.x += moveOrigin.x;
								p.y += moveOrigin.y;
								x = p.x;
								y = p.y;
								p.x = (cosPhi * x) + (sinPhi * y);
								p.y = (-1 * sinPhi * x) + (cosPhi * y);
								p.x -= moveOrigin.x;
								p.y -= moveOrigin.y;
							});
						}
						this.prev = angle;
					}
				}
				this.MouseUp = function(mp) {
					RemoveFromDrawing(line);
				}
			}
		},
		{
			name: "Scale",
			proto: function(mp) {
				this.prev = mp;
				var moveOrigin = { x: mp.x * -1, y: mp.y * -1 };
				var line = new simpleTypes[0].proto(mp, "#00ff00");
				this.update = function(mp) {
					line.update(mp);
					var sx = (canvas.width() - (mp.x - this.prev.x)) / canvas.width();
					var sy = (canvas.height() - (mp.y - this.prev.y)) / canvas.height();
					// var spinMatrix = math.matrix([
					// 	sx, 0, 0],
					// 	0, sy, 0],
					// 	[0, 0, 1]
					// ]);
					for(var i = 0; i < drawingObjects.length; ++i) {
						drawingObjects[i].ApplyTransformation(function(p) {
							p.x += moveOrigin.x;
							p.y += moveOrigin.y;
							p.x = p.x * sx;
							p.y = p.y * sy;
							p.x -= moveOrigin.x;
							p.y -= moveOrigin.y;
						});
					}
					this.prev = mp;
				}
				this.MouseUp = function(mp) {
					RemoveFromDrawing(line);
				}
			}

		},
		{
			name: "Cubic Scale",
			proto: function(mp) {
				this.prev = mp;
				var moveOrigin = { x: mp.x * -1, y: mp.y * -1 };
				var line = new simpleTypes[0].proto(mp, "#00ff00");
				var s;
				this.update = function(mp) {
					line.update(mp);
					s = (canvas.height() - (mp.y - this.prev.y)) / canvas.height();
					// var spinMatrix = math.matrix([
					// 	s, 0, 0],
					// 	0, s, 0],
					// 	[0, 0, 1]
					// ]);
					for(var i = 0; i < drawingObjects.length; ++i) {
						drawingObjects[i].ApplyTransformation(function(p) {
							p.x += moveOrigin.x;
							p.y += moveOrigin.y;
							p.x = p.x * s;
							p.y = p.y * s;
							p.x -= moveOrigin.x;
							p.y -= moveOrigin.y;
						});
					}
					this.prev = mp;
				}
				this.MouseUp = function(mp) {
					RemoveFromDrawing(line);
				}
			}
		},
		{
			name: "X Flip",
			proto: function(mp) {
				this.update = function(mp) { } 
				var moveOrigin = { x: (canvas.width() / 2) * -1 };
				for(var i = 0; i < drawingObjects.length; ++i) {
					drawingObjects[i].ApplyTransformation(function(p) {
						p.x += moveOrigin.x;
						p.x = p.x * -1;
						p.x -= moveOrigin.x;
					});
				}
			}
		},
		{
			name: "Y Flip",
			proto: function(mp) {
				this.update = function(mp) { } 
				var moveOrigin = { y: (canvas.height() / 2) * -1 };
				for(var i = 0; i < drawingObjects.length; ++i) {
					drawingObjects[i].ApplyTransformation(function(p) {
						p.y += moveOrigin.y;
						p.y = p.y * -1;
						p.y -= moveOrigin.y;
					});
				}
			}
		},
		{
			name: "X Sheer",
			proto: function(mp) {
				this.orig = mp;
				this.prev = 0;
				var line = new simpleTypes[0].proto(mp, "#00ff00");
				this.update = function(mp) {
					// var s = ((mp.x - this.prev.x) / canvas.width()) * ((this.orig.y - mp.y) / (canvas.height() / 4));
					// var s = (mp.x - this.prev.x) / (this.orig.y - mp.y);
					var m = (mp.x - this.orig.x) / (mp.y - this.orig.y);
					var s = this.prev - m;
					if(!isNaN(s) && (Math.abs(m) < 5)) {
						var orig = this.orig;
						for(var i = 0; i < drawingObjects.length; ++i) {
							drawingObjects[i].ApplyTransformation(function(p) {
								p.x = p.x + (s * (orig.y - p.y));
							});
						}
						this.prev = m;
					}
					line.update(mp);
				}
				this.MouseUp = function(mp) {
					RemoveFromDrawing(line);
				}
			}
		},
		{
			name: "Y Sheer",
			proto: function(mp) {
				this.orig = mp;
				this.prev = 0;
				var line = new simpleTypes[0].proto(mp, "#00ff00");
				this.update = function(mp) {
					// var s = ((mp.x - this.prev.x) / canvas.width()) * ((this.orig.y - mp.y) / (canvas.height() / 4));
					// var s = (mp.x - this.prev.x) / (this.orig.y - mp.y);
					var m = (mp.y - this.orig.y) / (mp.x - this.orig.x);
					var s = this.prev - m;
					if(!isNaN(s) && (Math.abs(m) < 5)) {
						var orig = this.orig;
						for(var i = 0; i < drawingObjects.length; ++i) {
							drawingObjects[i].ApplyTransformation(function(p) {
								p.y = p.y + (s * (orig.x - p.x));
							});
						}
						this.prev = m;
					}
					line.update(mp);
				}
				this.MouseUp = function(mp) {
					RemoveFromDrawing(line);
				}
			}
		}
	]

	this.shapes = simpleTypes.slice();
	for(var i = 0; i < complexTypes.length; ++i) {
		this.shapes.push(complexTypes[i]);
	}

	this.types = this.shapes.slice();

	for(var i = 0; i < transformations.length; ++i) {
		this.types.push(transformations[i]);
	}

	this.transformations = transformations;

	// END: Type specifications

	// START: Drawing and helper functions, Draw is a constant drawing function, it will
	// fire even if nothing has changed, we use it so that we dont redraw the screen every
	// mouse move, as that event fires faster then the canvas can update itself

	var frontBufferEmpty = false;

	function RemoveFromDrawing(obj) {
		if(obj.actual != null) {
			obj = obj.actual;
		}
		var index = drawingObjects.indexOf(obj);
		if(index > -1) {
			drawingObjects.splice(index, 1);
			invalid = true;
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

			if(drawingObjects.find(function(ele) { return ele.invalid; }) != null) {
				invalid = true;
			}

			if(invalid == true) {
				backBuffer.data.set(clearBuffer.data);
				for(var i = 0; i < drawingObjects.length; ++i) {
					drawingObjects[i].Draw(backBuffer);
				}
				ctx.putImageData(backBuffer, 0, 0);
				invalid = false;
			}

			newFrame = true;

		});

	}

	window.requestAnimationFrame(Draw);

	// END: Drawing function

	// START: Event functions, the angular app sends mouse events and operations through these functions

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
				// DrawPixels(currentObject.actual.pixels(), currentObject.color, backBuffer); // From BasicDrawing.js
				// RemoveFromDrawing(currentObject);
				if(currentObject.MouseUp != null) {
					currentObject.MouseUp(mousePoint);
				}
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
		if(index != -1) {
			currentShape = this.types[index];
		}
	}

	this.ChangeColor = function(c) {
		currentColor = c;
	}

	this.Clear = function() {
		invalid = true;
		drawingObjects = [];
	}

	this.SerializePicture = function() {

		var retVal = [];
		for(var i = 0; i < drawingObjects.length; ++i) {
			retVal.push(drawingObjects[i].Serialize());
		}

		return retVal;

	}

	this.RecievePicture = function(json) {

		var objects = JSON.parse(json);
		var tmp;
		for(var i = 0; i < objects.length; ++i) {

			switch(objects[i].type) {

			case "line":
				tmp = new Line();
				tmp.Deserialize(objects[i]);
				drawingObjects.push(tmp);
				break;

			case "circle":
				tmp = new Circle();
				tmp.Deserialize(objects[i]);
				drawingObjects.push(tmp);
				break;

			case "polygon":
				tmp = new Polygon();
				tmp.Deserialize(objects[i]);
				drawingObjects.push(tmp);
				break;

			case "bezier":
				tmp = new BezierCurve();
				tmp.Deserialize(objects[i]);
				drawingObjects.push(tmp);
				break;

			case "freeHandLine":
				tmp = new FreeHandLine();
				tmp.Deserialize(objects[i]);
				drawingObjects.push(tmp);
				break;

			case "freeHandCurve":
				tmp = new FreeHandCurve();
				tmp.Deserialize(objects[i]);
				drawingObjects.push(tmp);
				break;

			}

		}

	}

	// END: Event functions

}