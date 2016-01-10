var app = angular.module("pictureApp",[]);

var verbose = false;

var model = {
	types: [],
	transformations: [],
	colors: [ 
		{ color: "#000000" },
		{ color: "#440000" },
		{ color: "#880000" },
		{ color: "#bb0000" },
		{ color: "#ff0000" },
		{ color: "#004400" },
		{ color: "#444400" },
		{ color: "#884400" },
		{ color: "#bb4400" },
		{ color: "#ff4400" },
		{ color: "#008800" },
		{ color: "#448800" },
		{ color: "#888800" },
		{ color: "#bb8800" },
		{ color: "#ff8800" },
		{ color: "#00bb00" },
		{ color: "#44bb00" },
		{ color: "#88bb00" },
		{ color: "#bbbb00" },
		{ color: "#ffbb00" },
		{ color: "#00ff00" },
		{ color: "#44ff00" },
		{ color: "#88ff00" },
		{ color: "#bbff00" },
		{ color: "#ffff00" },
		{ color: "#000044" },
		{ color: "#440044" },
		{ color: "#880044" },
		{ color: "#bb0044" },
		{ color: "#ff0044" },
		{ color: "#004444" },
		{ color: "#444444" },
		{ color: "#884444" },
		{ color: "#bb4444" },
		{ color: "#ff4444" },
		{ color: "#008844" },
		{ color: "#448844" },
		{ color: "#888844" },
		{ color: "#bb8844" },
		{ color: "#ff8844" },
		{ color: "#00bb44" },
		{ color: "#44bb44" },
		{ color: "#88bb44" },
		{ color: "#bbbb44" },
		{ color: "#ffbb44" },
		{ color: "#00ff44" },
		{ color: "#44ff44" },
		{ color: "#88ff44" },
		{ color: "#bbff44" },
		{ color: "#ffff44" },
		{ color: "#000088" },
		{ color: "#440088" },
		{ color: "#880088" },
		{ color: "#bb0088" },
		{ color: "#ff0088" },
		{ color: "#004488" },
		{ color: "#444488" },
		{ color: "#884488" },
		{ color: "#bb4488" },
		{ color: "#ff4488" },
		{ color: "#008888" },
		{ color: "#448888" },
		{ color: "#888888" },
		{ color: "#bb8888" },
		{ color: "#ff8888" },
		{ color: "#00bb88" },
		{ color: "#44bb88" },
		{ color: "#88bb88" },
		{ color: "#bbbb88" },
		{ color: "#ffbb88" },
		{ color: "#00ff88" },
		{ color: "#44ff88" },
		{ color: "#88ff88" },
		{ color: "#bbff88" },
		{ color: "#ffff88" },
		{ color: "#0000bb" },
		{ color: "#4400bb" },
		{ color: "#8800bb" },
		{ color: "#bb00bb" },
		{ color: "#ff00bb" },
		{ color: "#0044bb" },
		{ color: "#4444bb" },
		{ color: "#8844bb" },
		{ color: "#bb44bb" },
		{ color: "#ff44bb" },
		{ color: "#0088bb" },
		{ color: "#4488bb" },
		{ color: "#8888bb" },
		{ color: "#bb88bb" },
		{ color: "#ff88bb" },
		{ color: "#00bbbb" },
		{ color: "#44bbbb" },
		{ color: "#88bbbb" },
		{ color: "#bbbbbb" },
		{ color: "#ffbbbb" },
		{ color: "#00ffbb" },
		{ color: "#44ffbb" },
		{ color: "#88ffbb" },
		{ color: "#bbffbb" },
		{ color: "#ffffbb" },
		{ color: "#0000ff" },
		{ color: "#4400ff" },
		{ color: "#8800ff" },
		{ color: "#bb00ff" },
		{ color: "#ff00ff" },
		{ color: "#0044ff" },
		{ color: "#4444ff" },
		{ color: "#8844ff" },
		{ color: "#bb44ff" },
		{ color: "#ff44ff" },
		{ color: "#0088ff" },
		{ color: "#4488ff" },
		{ color: "#8888ff" },
		{ color: "#bb88ff" },
		{ color: "#ff88ff" },
		{ color: "#00bbff" },
		{ color: "#44bbff" },
		{ color: "#88bbff" },
		{ color: "#bbbbff" },
		{ color: "#ffbbff" },
		{ color: "#00ffff" },
		{ color: "#44ffff" },
		{ color: "#88ffff" },
		{ color: "#bbffff" },
		{ color: "#ffffff" },
	]
}

var canvas = $("#canvas");
var drawer = new CanvasDrawer(canvas);
model.types = drawer.types;
model.shapes = drawer.shapes;
model.transformations = drawer.transformations;

app.run(function() {

});

var down = false;
var currentGObject = null;
var currentOperation = -1; // = model.types[0];
// currentOperation.state = "border-style: inset";
var currentColorObj; // = model.colors[0];
var colorBoxSelectedStyle = "box-shadow: 0px 0px 4px 7px #ffffff; top: 0px; left: 0px;";
// currentColorObj.state = colorBoxSelectedStyle;
var currentColor; // = currentColorObj.color;
var currentTransformation = null;

var fileBox;

if (window.File && window.FileReader && window.FileList && window.Blob) {
  	// Great success! All the File APIs are supported.
  	console.log("File system API available");
  	fileBox = $("#fileBox");
  	fileBox.val("");
  	fileBox.change(function(evt) {
	  	var files = evt.target.files; // FileList object
	  	console.log(evt.target.files);
	  	for(var i = 0; i < evt.target.files.length; ++i) {
	  		var f = evt.target.files[i];
	  		var reader = new FileReader();
	  		reader.onload = function(data) {
	  			console.log(data.target.result);
	  			// model.serializedData = data.target.result
	  			drawer.Clear();
	  			drawer.RecievePicture(data.target.result);
	  		}
	  		reader.readAsText(f);
	  	}
  	});
} else {
  console.log('The File APIs are not fully supported in this browser.');
}

app.controller("mainController", function($scope) {

	$scope.model = model;

	$scope.OperationSelect = function(index) {
		if(index == currentOperation) {
			model.types[currentOperation].state = "";
			drawer.ChangeShape(-1);
			currentOperation = -1;
			model.props = null;
		} else {
			if(currentOperation != -1) {
				model.types[currentOperation].state = "";
			}
			currentOperation = index;
			model.types[currentOperation].state = "border-style: inset";
			drawer.ChangeShape(index);
			model.props = model.types[currentOperation].properties;
			if(model.props != null) {
				for(var i = 0; i < model.props. length; ++i) {
					model.props[i].model.reset();
				}
			}
		}
	}

	$scope.ColorSelect = function(index) {
		if(currentColorObj != null) {
			currentColorObj.state = "";
		}
		currentColorObj = model.colors[index];
		currentColorObj.state = colorBoxSelectedStyle;
		currentColor = currentColorObj.color;
		drawer.ChangeColor(currentColor);
	}

	$scope.ColorSelect(0);

	$scope.ClearCanvas = function() {
		drawer.Clear();
	}

	$scope.TransformationSelect = function(index) {
		if(currentTransformation != null) {
			currentTransformation.style = "";
		}
		currentTransformation = model.transformations[index];
		currentTransformation.style = "border-style: inset";
		drawer.ChangeTransformation(index);
	}

	$("#loadButton").click(function(e) {
		e.preventDefault();
        $('#fileBox').click();
		// drawer.RecievePicture(model.serializedData);
	});

	$("#saveButton").click(function(e) {
		e.preventDefault();
		var data = drawer.SerializePicture();
		var blob = new Blob([JSON.stringify(data, null, 4)], {type: "application/json"});
		saveAs(blob, "picture.json");
	})

	canvas.mousedown(function(event) {
		if(verbose == true) { 
			console.log("Down: " + event.pageX + ", " + event.pageY);
			down = true;
		}
		var cPos = canvas.position();
		var tmp = { x: event.pageX - cPos.left, y: event.pageY - cPos.top };
		drawer.MouseDown(tmp);
	});
	canvas.mousemove(function(event) {
		var cPos = canvas.position();
		var tmp = { x: event.pageX - cPos.left, y: event.pageY - cPos.top };
		drawer.MouseMove(tmp);
		if(verbose == true) {
			if(down == true) {
				console.log("Move: " + event.pageX + ", " + event.pageY);
			}
		}
	});
	$(window).mouseup(function(event) {
		var cPos = canvas.position();
		var tmp = { x: event.pageX - cPos.left, y: event.pageY - cPos.top };
		drawer.MouseUp(tmp);
		if(verbose == true) {
			console.log("Up: " + event.pageX + ", " + event.pageY);
			down = false;
		}
	});

});