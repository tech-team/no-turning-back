define([
],
function() {
	function createCanvas(canvasId, width, height) {
		var canvas = document.createElement('canvas');
		canvas.id = canvasId;
		canvas.width = width;
		canvas.height = height;
		canvas.style.display = "none";
		document.body.appendChild(canvas);
		return canvas;
	}

	function removeCanvas(canvas) {
		canvas.parentNode.removeChild(canvas);
	}

	var SpriteTiler = function(tileImage, widthFactor, heightFactor) {
		var width = tileImage.width * widthFactor;
		var height = tileImage.height * heightFactor;
		var canvas = createCanvas("processingCanvas", width, height);
		var ctx = canvas.getContext("2d");

		var startX = 0;
	    var startY = 0;
	    
	    var x = startX;
	    var y = startY;
	    for (var i = 0; i < heightFactor; ++i) {
	        for (var j = 0; j < widthFactor; ++j) {
	            ctx.drawImage(tileImage, x, y);
	            x += tileImage.width;
	        }
	        x = startX;
	        y += tileImage.height;
	    }

	    var dataURL = canvas.toDataURL();

	    removeCanvas(canvas);
	    return dataURL;
	}

	return SpriteTiler;
});