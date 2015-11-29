
var cavnas;
var ctx;

var rect = { x: 0, y: 0, width: 50, height: 50 }
var direction = { x: 5, y: 5 }

var prevFrame;

var p1 = { x: 100, y: 100 }
var p2 = { x: 600, y: 300 }

var color = "#8847ff";

function ResizeCanvas() {
	canvas.width = $(window).width() - 20;
	canvas.height = $(window).height() - 20;
}

function OnLoad() {

	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");

	// $(window).resize(ResizeCanvas);
	// ResizeCanvas();

	ctx.fillStyle = "#000000";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	DrawPixel({ x: 5, y: 5 });

	DrawLine(p1, p2);

	DrawCircle({ x: 500, y: 200 }, 50);
	DrawCalculatedPolygon({ x: 500, y: 200 }, 100, 4, 400);


	$("canvas").mousedown(function() {
		console.log("DOWN");
	});

	$("canvas").mouseup(function() {
		console.log("UP");
	});

}

function DrawPixel(x, y) {

	if(y == null) {
		y = x.y;
		x = x.x;
	}
	ctx.fillStyle = color;
	ctx.fillRect(Math.round(x), Math.round(y), 1, 1);

}

function DrawLine(p1, p2) {

	var xD = p2.x - p1.x;
	var yD = p2.y - p1.y;
	var g = (Math.abs(xD) > Math.abs(yD)) ? Math.abs(xD) : Math.abs(yD);

	var actualX = xD / g;
	var actualY = yD / g;

	var directionX = actualX / Math.abs(actualX);
	if(isNaN(directionX)) {
		directionX = 0;
	}
	var directionY = actualY / Math.abs(actualY);
	if(isNaN(directionY)) {
		directionY = 0;
	}

	fillStyle = color;

	var curX = p1.x;
	var curY = p1.y;

	var overflow = 2000;
	var i = 0;

	while((((p2.x - curX) * directionX) >= 0) && (((p2.y - curY) * directionY) >= 0) && (i < overflow)) {

		DrawPixel(curX, curY);
		curX += actualX;
		curY += actualY;
		++i;

	}

}

function DrawCalculatedPolygon(p, size, edges, angle) {

	// Old DrawCircle()

	if(angle == null) {
		angle = 0;
	}

	var degreesPerLine = 360 / edges;
	console.log("degreesPerLine:" + degreesPerLine);
	var dplRads = Math.PI * (degreesPerLine / 180);
	console.log("dlpRads:" + dplRads);
	var sectionLength = Math.sqrt((2 - (2 * Math.cos(dplRads)))) * size;
	console.log("sectionLength:" + sectionLength);

	var current = { 
		x: p.x + (size * Math.sin(angle)), 
		y: p.y - (size * Math.cos(angle)), 
		alpha: (dplRads / 2) + angle
	};

	DrawPixel(p);

	for(var i = 0; i < edges; ++i) {

		var p1 = { x: current.x, y: current.y };
		current.x += sectionLength * Math.cos(current.alpha);
		current.y += sectionLength * Math.sin(current.alpha);
		console.log("Iteration " + i);
		console.log(p1);
		console.log(current);
		DrawLine(p1, current);
		current.alpha += dplRads;

	}

}

function DrawCircle(p, r) {

	var x = r;
	var y = 0;

	var decisionOver2 = 1 - x;

	while(y <= x) {

		DrawPixel( x + p.x,  y + p.y);
	    DrawPixel( y + p.x,  x + p.y);
	    DrawPixel(-x + p.x,  y + p.y);
	    DrawPixel(-y + p.x,  x + p.y);
	    DrawPixel(-x + p.x, -y + p.y);
	    DrawPixel(-y + p.x, -x + p.y);
	    DrawPixel( x + p.x, -y + p.y);
	    DrawPixel( y + p.x, -x + p.y);

	    ++y;
	    if (decisionOver2<=0){
	      decisionOver2 += 2 * y + 1;   // Change in decision criterion for y -> y+1
	    }else{
	      x--;
	      decisionOver2 += 2 * (y - x) + 1;   // Change for y -> y+1, x -> x-1
	    }

	}

}

function Draw(timeStamp) {

	setTimeout(function() {

		deltaTime = (timeStamp - prevFrame) / 1000;
		prevFrame = timeStamp;

		if(isNaN(deltaTime)) {
			deltaTime = 0;
		}

		Update();

		window.requestAnimationFrame(Draw);

		ctx.fillStyle = "rgba(0,0,0,0.05)"
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = "#72bfe2";
		ctx.fillRect(rect.x, rect.y, rect.width, rect.height);

	});

}

function Update() {

	rect.x += direction.x;
	rect.y += direction.y;

	if(rect.x == 0) {
		direction.x *= -1;
	}

	if((rect.x + rect.width) == canvas.width) {
		direction.x *= -1;
	}

	if(rect.y == 0) {
		direction.y *= -1;
	}

	if((rect.y + rect.width) == canvas.height) {
		direction.y *= -1;
	}

}