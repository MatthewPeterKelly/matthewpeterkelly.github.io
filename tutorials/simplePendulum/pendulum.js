// Script largely based on example by: 
// http://burakkanber.com/blog/physics-in-javascript-car-suspension-part-1-spring-mass-damper/

var frameRate  = 1/40;
var frameDelay = frameRate * 1000;
var nSubSteps = 10;  // Keep integration stable...
var dt = frameRate / nSubSteps;

var m = 0.5;  // mass constant 
var c = 0.1;  // damping constant 
var l = 1.0;  // length scale
var g = 9.0;  // gravity

var canvas;
var ctx;
var width;
var height;
var mathSvg;

var pendulum = {angle: 1.0, rate: 0.0, time: 0};

var loop = function() {

	pendulum.time += frameRate;

    if ( ! mouse.isDown )  // Don't move during user interaction
    {  // Euler integration of a simple damped pendulum
        for (i=0; i<nSubSteps; i++){ 
            pendulum.angle += dt*pendulum.rate;
            pendulum.rate -= dt*((g/l)*Math.sin(pendulum.angle)+(c/(m*l*l))*pendulum.rate);
        }
    }

    /// Set up for drawing
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    centerX = width/2;  centerY = height/2;
    length = 0.45*Math.min(width,height);
    rectWidth = 0.4*width;
    rectHeight = 0.15*rectWidth;
    bobX = centerX + l*length*Math.sin(pendulum.angle);
    bobY = centerY + l*length*Math.cos(pendulum.angle);
    mScale = Math.pow(m,0.333);

    /// Fixed base:
    ctx.fillStyle = '#75715e';
	ctx.fillRect(centerX-0.5*rectWidth, centerY-0.5*rectHeight, rectWidth, rectHeight);

    /// Pivot point
    radius = mScale*0.04*length;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2*Math.PI, false);
    ctx.fillStyle = '#50A42C';
    ctx.fill();
    ctx.closePath();

    /// Pendulum Rod
    ctx.strokeStyle = '#50A42C';
    ctx.lineWidth = mScale*0.03*length;
    ctx.beginPath();
    ctx.moveTo(bobX, bobY);
    ctx.lineTo(centerX, centerY);
    ctx.stroke();
    ctx.closePath;

    /// Pendulum Bob
    radius = mScale*0.1*length;
    ctx.beginPath();
    ctx.arc(bobX, bobY, radius, 0, 2*Math.PI, false);
    ctx.fillStyle = '#50A42C';
    ctx.fill();
    ctx.closePath();

	ctx.restore();	

}

var setCanvasDimensions = function(){
  	canvas.width  = canvas.offsetWidth;
  	canvas.height = canvas.offsetHeight;
  	width = canvas.width; 
	height = canvas.height;	
}

var setup = function() {

	window.onresize = setCanvasDimensions;

    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    canvas.style.width ='100%';
  	canvas.style.height='100%';
	setCanvasDimensions();

    canvas.onmousemove = getMousePosition;

    canvas.onmousedown = function(e) {
        if (e.which == 1) {
	        centerX = width/2;  centerY = height/2;
            getMousePosition(e);
            dx = mouse.x - centerX;
            dy = mouse.y - centerY;
            pendulum.angle = Math.atan2(dx,dy);
            pendulum.rate = 0;
        }
    };

    canvas.onmouseup = function(e) { 
        if (e.which == 1) {
            mouse.isDown = false;
        }
    };

	document.getElementById('g_slider').onchange = function() {
        this.innerHTML = this.value;
        g = parseFloat(this.value);
        document.getElementById('g_slider_label').innerHTML = g;
	};

	document.getElementById('l_slider').onchange = function() {
        this.innerHTML = this.value;
        l = parseFloat(this.value);
        document.getElementById('l_slider_label').innerHTML = l;
	};

    document.getElementById('c_slider').onchange = function() {
        this.innerHTML = this.value;
        c = parseFloat(this.value);
        document.getElementById('c_slider_label').innerHTML = c;
    };

    document.getElementById('m_slider').onchange = function() {
        this.innerHTML = this.value;
        m = parseFloat(this.value);
        document.getElementById('m_slider_label').innerHTML = m;
    };

	setInterval(loop, frameDelay);

    document.getElementById('g_slider').onchange();
    document.getElementById('l_slider').onchange();
    document.getElementById('c_slider').onchange();
    document.getElementById('m_slider').onchange();

};

var mouse = {x: 0, y: 0, isDown: false};

var getMousePosition = function(e) {
    mouse.x = e.pageX - canvas.offsetLeft;
    mouse.y = e.pageY - canvas.offsetTop;
    if (mouse.isDown)
    {
        centerX = width/2;  centerY = height/2;
        getMousePosition(e);
        dx = mouse.x - centerX;
        dy = mouse.y - centerY;
        pendulum.angle = Math.atan2(dx,dy);
        pendulum.rate = 0;
    }
};

setup();
