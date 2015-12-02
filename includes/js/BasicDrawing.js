
// This function draws a single pixel on HTML 5 canvas imageData
// It expects x and y to be integers
function DrawPixel(x, y, color, image) {

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

	for(var i = 0; i < image.data.length; i += 4) {
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

// Recieves Center Point, Radius, Amount of Edges, And the angle of the first vertex from the y axis
function CalculateRegularPolygon(cp, r, e, a, arr) {

	if(e < 3) {
		throw Exception("Trying to caculate a regular polygon with less then 3 edges");
	}

	var retVal;
	if(arr != null) {
		retVal = arr;
	} else {
		retVal = [];
	}

	var acp = { x: Math.floor(cp.x), y: Math.floor(cp.y) };

	if(r == 0) {
		retVal.push(acp.x, acp.y);
		return retVal;
	}

	var degreesPerLine = 360 / e;// The amount of degrees on a circle that each section will cover
	var dplRads = Math.PI * (degreesPerLine / 180); // degreesPerLine in radians
	var sectionLength = Math.sqrt((2 - (2 * Math.cos(dplRads)))) * r;

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
		CalculateLine(p1, current, retVal);
		// current.alpha += dplRads;

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

function CalculateQuadraticCurve(pArr, pc, arr) {

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
	var tStep = 1 / pc;
	var seg1Len = Math.sqrt(Math.pow(pArr[0].x - pArr[1].x, 2) + Math.pow(pArr[0].y - pArr[1].y, 2));
	var seg2Len = Math.sqrt(Math.pow(pArr[1].x - pArr[2].x, 2) + Math.pow(pArr[1].y - pArr[2].y, 2));
	var totalLen = seg1Len + seg2Len;
	var seg1Ratio = seg1Len / totalLen;
	var seg2Ratio = seg2Len / totalLen;
	var seg1T = (tStep / totalLen) * seg1Len;
	var seg2T = (tStep / totalLen) * seg2Len;
	var g = (seg1Ratio > seg2Ratio) ? seg1Ratio : seg2Ratio;

	var total = 0;

	console.log(seg1Ratio + " / " + seg2Ratio);

	for(var i = 0; t <= 1; ++i) {

		var x = (Math.pow(1-t, 2) * pArr[0].x) + (2 * (1-t) * t * pArr[1].x) + (Math.pow(t, 2) * pArr[2].x);
		var y = (Math.pow(1-t, 2) * pArr[0].y) + (2 * (1-t) * t * pArr[1].y) + (Math.pow(t, 2) * pArr[2].y);

		retVal.push(Math.floor(x), Math.floor(y));

		// t += tStep;
		t += tStep * ((t < seg1Ratio) ? (seg2Ratio / seg1Ratio) : (seg1Ratio / seg2Ratio));

	}

	console.log(t);

	return retVal;

}

// Recieves an a array of points, a pixel count and a previuse pixel bufer into which the pixels should be written
function CalculateBezierCurve(pArr, pc, arr) {

	var retVal;
	if(arr == null) {
		retVal = [];
	} else {
		retVal = arr;
	}

	if(pArr.length < 4) {
		return CalculateQuadraticCurve(pArr, pc, retVal);
	}

	var t = 0;
	var tStep = 1 / pc;

	for(var i = 0; i <= pc; ++i) {

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
		
		retVal.push(Math.floor(x), Math.floor(y));

		t += tStep;
	}

	return retVal;

}