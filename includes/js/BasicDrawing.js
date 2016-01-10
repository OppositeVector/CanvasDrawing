
// This function draws a single pixel on HTML 5 canvas imageData
// It expects x and y to be integers
function DrawPixel(x, y, color, image) {

	if((x < 0) || (x >= image.width) || (y < 0) || (y >= image.height)) {
		return;
	}
	loc = (y * image.width * 4) + (x * 4);
	image.data[loc] = color.r;
	image.data[loc + 1] = color.g;
	image.data[loc + 2] = color.b;
	image.data[loc + 3] = color.a;

}

// Receives an array of pixels, a color and an HTML 5 canvas imageData
function DrawPixels(pArr, color, image) {

	for(var i = 0; i < pArr.length; i += 2) {
		loc = (pArr[i+1] * image.width * 4) + (pArr[i] * 4);
		image.data[loc] = color.r;
		image.data[loc + 1] = color.g;
		image.data[loc + 2] = color.b;
		image.data[loc + 3] = color.a;
		// DrawPixel(pArr[i], pArr[i + 1], color, image);
	}

}

function ClearImage(color, image) {

	var li = image.data.length;
	for(var i = 0; i < li; i += 4) {
		image.data[i] = color.r;
		image.data[i + 1] = color.g;
		image.data[i + 2] = color.b;
		image.data[i + 3] = color.a;
	}

}

// Same as DrawPixels but this function expects image.data to be UInt32Array
function DrawPixel32(x, y, color, image) {

	loc = (y * image.width) + x;
	image[loc] = 	(color.a << 24) | 
					(color.b << 16) | 
					(color.g << 8) | 
					(color.b);

}

// Same as DrawPixels but this function expects image.data to be UInt32Array
function DrawPixels32(pArr, color, image) {

	for(var i = 0; i < pArr.length; i += 2) {
		DrawPixel32(pArr[i], pArr[i + 1], color, image);
	}

}

function ClearImage32(color, image) {

	for(var i = 0; i < image.data.length; ++i) {
		image[i] = 	(color.a << 24) | 
					(color.b << 16) | 
					(color.g << 8) | 
					(color.b);
	}


}

function ToColor(hex) {

	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: 255
    } : null;

}

function ToHex(color) {

	function ComponentToHex(c) {
	    var hex = c.toString(16);
	    return hex.length == 1 ? "0" + hex : hex;
	}

	return "#" + ComponentToHex(color.r) + ComponentToHex(color.g) + ComponentToHex(color.b)
	
}

// Takes two points and draws all the pixels between them on the image
function DrawLine(p1, p2, color, image) {

	var xD = p2.x - p1.x;
	var yD = p2.y - p1.y;
	if((xD == 0) && (yD == 0)) {
		DrawPixel(p1.x, p1.y, color, image);
		return;
	}
	var absX = Math.abs(xD);
	var absY = Math.abs(yD);
	var g = (absX > absY) ? absX : absY;

	var xStep = xD / g;
	var yStep = yD / g;

	var curX = p1.x;
	var curY = p1.y;

	for(var i = 0; i < g; i += 1) {
		DrawPixel(Math.floor(curX), Math.floor(curY), color, image);
		curX += xStep;
		curY += yStep;
	}

}

// Takes a center and a radius, Draws all the pixels that constitute the circle in the
// canvas data block (image)
function DrawCircle(cp, r, color, image) {

	if(r == 0) {
		DrawPixel(cp.x, cp.y, color, image);
		return;
	}

	var acp = { x: Math.floor(cp.x), y: Math.floor(cp.y) };

	var x = Math.floor(r);
	var y = 0;

	var decisionOver2 = 1 - x;

	while(y <= x) {

		DrawPixel( x + acp.x,  y + acp.y, color, image);
		DrawPixel( y + acp.x,  x + acp.y, color, image);
		DrawPixel(-x + acp.x,  y + acp.y, color, image);
	    DrawPixel(-y + acp.x,  x + acp.y, color, image);
	    DrawPixel(-x + acp.x, -y + acp.y, color, image);
	    DrawPixel(-y + acp.x, -x + acp.y, color, image);
	    DrawPixel( x + acp.x, -y + acp.y, color, image);
	    DrawPixel( y + acp.x, -x + acp.y, color, image);

	    ++y;
	    if (decisionOver2<=0){
	      decisionOver2 += 2 * y + 1;   // Change in decision criterion for y -> y+1
	    }else{
	      --x;
	      decisionOver2 += 2 * (y - x) + 1;   // Change for y -> y+1, x -> x-1
	    }

	}

}

// Recieves Center Point, Radius, Amount of Edges, And the angle of the first vertex from the y axis
function DrawRegularPolygon(cp, r, e, a, color, image) {

	if(e < 3) {
		throw Exception("Trying to caculate a regular polygon with less then 3 edges");
	}

	var acp = { x: Math.floor(cp.x), y: Math.floor(cp.y) };

	if(r == 0) {
		DrawPixel(acp.x, acp.y, color, image);
		return;
	}

	var degreesPerLine = 360 / e;// The amount of degrees on a circle that each section will cover
	var dplRads = Math.PI * (degreesPerLine / 180); // degreesPerLine in radians
	// var sectionLength = Math.sqrt((2 - (2 * Math.cos(dplRads)))) * r;

	var current = { 
		x: cp.x - (r * Math.cos(a)), 
		y: cp.y - (r * Math.sin(a)), 
		alpha: a
	};

	// retVal.push(acp.x, acp.y);
	// console.log(acp.x + " " + acp.y);

	for(var i = 0; i < e; ++i) {

		var p1 = { x: current.x, y: current.y };
		// var p2 = { x: cp.x + Math.cos(current.alpha), y: cp.y + Math.sin(current.alpha) };
		current.alpha += dplRads;
		current.x = cp.x - (r * Math.cos(current.alpha));
		current.y = cp.y - (r * Math.sin(current.alpha));
		// current.x += sectionLength * Math.cos(current.alpha);
		// current.y += sectionLength * Math.sin(current.alpha);
		DrawLine(p1, current, color, image);
		// current.alpha += dplRads;

	}

}

// Takes a points array, line count, a color and a canvas data block, creates a qudratic curve
// using pArr[0] as a start, pArr[2] as an end, and pArr[1] as a control point,
// pArr is shorter then 3, a simple line will be created
function DrawQuadraticCurve(pArr, lc, color, image) {

	if(pArr.length == 0) {
		return;
	} else if(pArr.length == 1) {
		DrawPixel(pArr[0].x, pArr[0].y, color, image);
		return;
	} else if(pArr.length == 2) {
		DrawLine(pArr[0], pArr[1], color, image);
		return;
	}

	var t = 0;
	var tStep = 1 / lc;
	var prev = { x: Math.floor(pArr[0].x), y: Math.floor(pArr[0].y) };

	for(var i = 0; i <= lc; ++i) {

		var tt = t * t;
		var u = 1-t;
		var uu = u * u;
		var tu = 2 * u * t;

		var x = (uu * pArr[0].x) + (tu * pArr[1].x) + (tt * pArr[2].x);
		var y = (uu * pArr[0].y) + (tu * pArr[1].y) + (tt * pArr[2].y);
		var p = { x: Math.floor(x), y: Math.floor(y) };
		DrawLine(prev, p, color, image);
		t += tStep;
		prev = p;

	}

}

// Recieves an a array of points, a line count, a color and a canvas data block
// Creates a bezier curve using pArr[0] as a start, pArr[3] as an end, and pArr[1] and pArr[2] as control points,
// if pArr is shorter then 4, a qudratic curve will be created
function DrawBezierCurve(pArr, lc, color, image) {

	if(pArr.length < 4) {
		return DrawQuadraticCurve(pArr, lc, color, image);
	}

	var t = 0;
	var tStep = 1 / lc;
	var prev = { x: Math.floor(pArr[0].x), y: Math.floor(pArr[0].y) };

	for(var i = 0; i <= lc; ++i) {

		var u = 1 - t;
		var tt = t*t;
		var uu = u*u;
		var uuu = uu * u;
		var ttt = tt * t;

		var x = pArr[0].x * uuu;
		x += 3 * uu * t * pArr[1].x;
		x += 3 * u * tt * pArr[2].x;
		x += ttt * pArr[3].x;

		var y = pArr[0].y * uuu;
		y += 3 * uu * t * pArr[1].y;
		y += 3 * u * tt * pArr[2].y;
		y += ttt * pArr[3].y;
		
		var p = { x: Math.floor(x), y: Math.floor(y) };
		DrawLine(prev, p, color, image);

		t += tStep;
		prev = p;

	}

}

// Recieves Center Point, Radius, Amount of Edges, And the angle of the first vertex from the y axis
function CalculateRegularPolygon(cp, r, e, a) {

	if(e < 3) {
		throw Exception("Trying to caculate a regular polygon with less then 3 edges");
	}

	var retVal = [];

	var acp = { x: Math.floor(cp.x), y: Math.floor(cp.y) };

	if(r == 0) {
		retVal.push(acp);
		return retVal;
	}

	var degreesPerLine = 360 / e;// The amount of degrees on a circle that each section will cover
	var dplRads = Math.PI * (degreesPerLine / 180); // degreesPerLine in radians
	// var sectionLength = Math.sqrt((2 - (2 * Math.cos(dplRads)))) * r;

	var current = { 
		x: cp.x - (r * Math.cos(a)), 
		y: cp.y - (r * Math.sin(a)), 
		alpha: a
	};

	// retVal.push(acp.x, acp.y);
	// console.log(acp.x + " " + acp.y);

	for(var i = 0; i < e; ++i) {

		var p1 = { x: current.x, y: current.y };
		retVal.push(p1);
		// var p2 = { x: cp.x + Math.cos(current.alpha), y: cp.y + Math.sin(current.alpha) };
		current.alpha += dplRads;
		current.x = cp.x - (r * Math.cos(current.alpha));
		current.y = cp.y - (r * Math.sin(current.alpha));
		// current.x += sectionLength * Math.cos(current.alpha);
		// current.y += sectionLength * Math.sin(current.alpha);
		// DrawLine(p1, current, color, image);
		// current.alpha += dplRads;

	}

	return retVal;

}

// -----------------------------------------------------------------------
// Alternative calculation functions

// Takes two points and returns an array of all the pixels in the way
function CalculateLine(p1, p2, arr) {

	var retVal;
	if(arr != null) {
		retVal = arr;
	} else {
		retVal = [];
	}

	var xD = p2.x - p1.x;
	var yD = p2.y - p1.y;
	if((xD == 0) && (yD == 0)) {
		retVal.push(p1.x, p1.y);
		return retVal;
	}
	var absX = Math.abs(xD);
	var absY = Math.abs(yD);
	var g = (absX > absY) ? absX : absY;

	var xStep = xD / g;
	var yStep = yD / g;

	var curX = p1.x;
	var curY = p1.y;

	for(var i = 0; i < g; i += 1) {
		retVal.push(Math.floor(curX), Math.floor(curY));
		curX += xStep;
		curY += yStep;
	}

	return retVal;

}

// Takes a center and a radius, returns all the pixels that constitute the circle
function CalculateCircle(cp, r, arr) {

	var retVal;
	if(arr != null) {
		retVal = arr;
	} else {
		retVal = [];
	}
	if(r == 0) {
		retVal.push(cp.x, cp.y);
		return retVal;
	}

	var acp = { x: Math.floor(cp.x), y: Math.floor(cp.y) };

	var x = Math.floor(r);
	var y = 0;

	var decisionOver2 = 1 - x;

	while(y <= x) {

		retVal.push( x + acp.x,  y + acp.y);
		retVal.push( y + acp.x,  x + acp.y);
		retVal.push(-x + acp.x,  y + acp.y);
	    retVal.push(-y + acp.x,  x + acp.y);
	    retVal.push(-x + acp.x, -y + acp.y);
	    retVal.push(-y + acp.x, -x + acp.y);
	    retVal.push( x + acp.x, -y + acp.y);
	    retVal.push( y + acp.x, -x + acp.y);

	    ++y;
	    if (decisionOver2<=0){
	      decisionOver2 += 2 * y + 1;   // Change in decision criterion for y -> y+1
	    }else{
	      --x;
	      decisionOver2 += 2 * (y - x) + 1;   // Change for y -> y+1, x -> x-1
	    }

	}

	return retVal;

}

function LinearInterpolation(p1, p2, t) {
	return { x: p1.x + ((p2.x - p1.x) / t), y: p1.y - ((p2.y - p1.y) / t) };
}

// The value of the lerp will go into p1
function InternalLerp(p1, p2, t) {
	p1.x = p1.x + ((p2.x - p1.x) / t);
	p1.y = p1.y + ((p2.y - p1.y) / t);
}

// Takes a points array, line count and a pixels array, creates a qudratic curve
// using pArr[0] as a start, pArr[2] as an end, and pArr[1] as a control point,
// pArr is shorter then 3, a simple line will be created
function CalculateQuadraticCurve(pArr, lc, arr) {

	var retVal;
	if(arr == null) {
		retVal = [];
	} else {
		retVal = arr;
	}

	if(pArr.length == 0) {
		return retVal;
	} else if(pArr.length == 1) {
		retVal.push(pArr[0].x, pArr[0].y);
		return retVal;
	} else if(pArr.length == 2) {
		return CalculateLine(pArr[0], pArr[1], retVal);
	}

	var t = 0;
	var tStep = 1 / lc;
	var prev = { x: Math.floor(pArr[0].x), y: Math.floor(pArr[0].y) };

	for(var i = 0; i <= lc; ++i) {

		var x = (Math.pow(1-t, 2) * pArr[0].x) + (2 * (1-t) * t * pArr[1].x) + (Math.pow(t, 2) * pArr[2].x);
		var y = (Math.pow(1-t, 2) * pArr[0].y) + (2 * (1-t) * t * pArr[1].y) + (Math.pow(t, 2) * pArr[2].y);
		var p = { x: Math.floor(x), y: Math.floor(y) };
		retVal = CalculateLine(prev, p, retVal);
		t += tStep;
		prev = p;

	}

	return retVal;

}

// Recieves an a array of points, a line count and a pixel buffer into which the pixels should be written
// Creates a bezier curve using pArr[0] as a start, pArr[3] as an end, and pArr[1] and pArr[2] as control points,
// if pArr is shorter then 4, a qudratic curve will be created
function CalculateBezierCurve(pArr, lc, arr) {

	var retVal;
	if(arr == null) {
		retVal = [];
	} else {
		retVal = arr;
	}

	if(pArr.length < 4) {
		return CalculateQuadraticCurve(pArr, lc, retVal);
	}

	var t = 0;
	var tStep = 1 / lc;
	var prev = { x: Math.floor(pArr[0].x), y: Math.floor(pArr[0].y) };

	for(var i = 0; i <= lc; ++i) {

		var u = 1 - t;
		var tt = t*t;
		var uu = u*u;
		var uuu = uu * u;
		var ttt = tt * t;

		var x = pArr[0].x * uuu;
		x += 3 * uu * t * pArr[1].x;
		x += 3 * u * tt * pArr[2].x;
		x += ttt * pArr[3].x;

		var y = pArr[0].y * uuu;
		y += 3 * uu * t * pArr[1].y;
		y += 3 * u * tt * pArr[2].y;
		y += ttt * pArr[3].y;
		
		var p = { x: Math.floor(x), y: Math.floor(y) };
		retVal = CalculateLine(prev, p, retVal);

		t += tStep;
		prev = p;

	}

	return retVal;

}