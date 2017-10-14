//This page is for variable and function definitions

/*
 Returns the input clipped my min and max values
 */
function bound(value, min, max) {
    return Math.max(Math.min(value, max), min);
}

var gravity = 0;


var panelPtMass = {
    width: parseInt(document.getElementById("panelPtMass").style.width),
    height: parseInt(document.getElementById("panelPtMass").style.height),
    svg: d3.select("#panelPtMass"),
    //      init: function() {
    //      d3.select("#panelPtMass").append("circle")
    //      .attr("id","chaser")
    //      .attr("class","circle")
    //      .arrt("r,6");
    //      d3.select("#panelPtMass").append("circle")
    //      .attr("id","target")
    //      .attr("class","handle")
    //      .arrt("r,14");
    //      }
};
//panelPtMass.init();

var target = {
    x: 300,
    y: 125,
    getX: function() {
        return this.x;
    },
    getY: function() {
        return this.y;
    },
    setX: function(x) {
        this.x = bound(x, 0, panelPtMass.width);
    },
    setY: function(y) {
        this.y = bound(y, 0, panelPtMass.height);
    },
    setCoords: function(coords) {
        this.setX(coords[0]);
        this.setY(coords[1]);
    },
    redraw: function() {
        d3.select("#target")
            .attr("cx", this.x)
            .attr("cy", this.y)
    },
    updateTarget: function() {
        if (typeof targetMotion === "function") {
            targetMotion(this);
        }
    },
    motionType: "off",
    motionTime: 0
};




var chaser = {
    x: 400,
    y: 300,
    xTarget: 300,
    yTarget: 125,
    dx: -450,
    dy: -150,
    ddx: 0,
    ddy: 0,
    kp: 5,
    kd: 1,
    redraw: function() {
        d3.select("#chaser")
            .attr("cx", this.x)
            .attr("cy", this.y)
    },
    timeStep: function(dt) {

        /* When the page is not on the active tab in firefox, it suspends
         animation. When the page is viewed again, it will cause an
         extremely large time-step to occur. This is a simple fix. */
        if (dt > 50) {
            dt = 50;
        }

        dt = dt / 1000;

        var newx = RungeKutta4Step([this.x, this.dx], dt, this.xdynamics.bind(this));
        var newy = RungeKutta4Step([this.y, this.dy], dt, this.ydynamics.bind(this));

        this.x = newx[0];
        this.y = newy[0];
        this.dx = newx[1];
        this.dy = newy[1];

    },
    updateTarget: function() {
        this.xTarget = target.getX();
        this.yTarget = target.getY();
        var wn = 2 * Math.PI * sliderFreq.getValue();
        var xi = sliderDamp.getValue();
        this.kp = wn * wn;
        this.kd = 2 * wn * xi;
    },
    dynamics: function(state) {
        var xDyn = this.xdynamics([state[0], state[2]]);
        var yDyn = this.ydynamics([state[1], state[3]]);
        return [xDyn[0], yDyn[0], xDyn[1], yDyn[1]];
    },
    xdynamics: function(xstate) {
        var x = xstate[0];
        var dx = xstate[1];
        var ddx = this.kp * (this.xTarget - x) - this.kd * dx;
        //console.log(x);
        //var ddx = (this.xTarget - x);
        return [dx, ddx];
    },
    ydynamics: function(ystate) {
        var y = ystate[0];
        var dy = ystate[1];
        var ddy = this.kp * (this.yTarget - y) - this.kd * dy + gravity;
        return [dy, ddy];
    }
};

var formatLabelString = d3.format(".2f");

/*
 Define a slider class
 */
function Slider(domain, range, sliderName, circleName, labelName, initialValue) {
    this.x = 0;
    this.y = document.getElementById(sliderName).getAttribute("y2");
    this.value = initialValue ? initialValue : 1;
    this.needsRedraw = true;

    this.xRange = domain;
    this.valueRange = range;

    this.scaleXToValue = d3.scale.linear()
        .domain(this.xRange)
        .range(this.valueRange);
    this.scaleValueToX = d3.scale.linear()
        .domain(this.valueRange)
        .range(this.xRange);


    this.getValue = function() {
        return this.value
    };
    this.setValue = function(value) {
        this.setX(this.scaleValueToX(value));
    }
    this.setX = function(x) {
        this.x = bound(x, this.xRange[0], this.xRange[1]);
        this.value = this.scaleXToValue(this.x);
        this.needsRedraw = true;
    }
    this.redraw = function() {
        if (!this.needsRedraw) {
            return;
        }
        this.needsRedraw = false;
        d3.select(circleName)
            .attr("cx", this.x)
            .attr("cy", this.y);
        d3.select(labelName)
            .text(formatLabelString(this.value))
            .attr("x", this.x);
        this.onRedraw();
    }

    this.onRedraw = function() {}

    this.initialize = function() {
        this.setValue(this.value);
        var sliderReference = this;

        d3.select(circleName).call(
            d3.behavior.drag()
            .on("drag", function() {
                sliderReference.setX(d3.event.x);
            }));

        d3.select("#" + sliderName).on("click", function() {
            var clickPos = d3.mouse(this);
            sliderReference.setX(clickPos[0]);
        })
    }

    this.initialize();
}

var sliderDamp = new Slider([160, 300], [.001, 2], "dampingRail", "#dampingCircle", "#dampingLabel");

var sliderFreq = new Slider([160, 300], [1, 5], "frequencyRail", "#frequencyCircle", "#frequencyLabel", 3);
//sliderFreq.scaleXToValue



d3.select("#target").call(
    d3.behavior.drag()
    .on("drag", function() {
        target.setCoords([d3.event.x, d3.event.y]);
        chaser.updateTarget();
    }));

d3.select("#panelPtMass").on("click", function() {
    var clickPos = d3.mouse(this);
    target.setCoords(clickPos);
    target.redraw();
    // onMotionSettingChange(false);     // HACK: Should be done by directly changing the event!
    // document.getElementById("MotionCheckboxId").checked = false;   // FAIL. This should work, but doesn't
})

var lineSmooth = d3.svg.line()
    .interpolate("monotone")
    .x(function(d) {
        return x(d[0]);
    })
    .y(function(d) {
        return y(d[1]);
    });


var stepResponse = {
    tLow: 0,
    tUpp: 4.0,
    data: new Array(100),

    xi: 0.1,
    wn: 2.0,
    x0: 1.0,
    v0: 0.0,

    xScale: d3.scale.linear()
        .domain([0, 4.0])
        .range([350, 800]),

    yScale: d3.scale.linear()
        .domain([-1.0, 1.0])
        .range([140, 10]),

    myDataCurve: function(t) {

        if (this.xi < 1.0) { // Underdamped

            var sigma = this.wn * this.xi;
            var wd = this.wn * Math.sqrt(1 - this.xi * this.xi);
            var alpha = this.x0 / 2;
            var beta = -(this.v0 + sigma * this.x0) / (2 * wd);
            var x = 2 * Math.exp(-sigma * t) * (alpha * Math.cos(wd * t) - beta * Math.sin(wd * t));
            return this.yScale(x);
        }

        if (this.xi == 1.0) { // Critically damped
            var c1 = this.x0;
            var c2 = this.v0 + this.wn * this.x0;
            var x = c1 * Math.exp(-this.wn * t) + c2 * t * Math.exp(-this.wn * t);
            return this.yScale(x);
        }

        if (this.xi > 1.0) { // Overdamped
            var s1 = -(this.xi - Math.sqrt(this.xi * this.xi - 1)) * this.wn;
            var s2 = -(this.xi + Math.sqrt(this.xi * this.xi - 1)) * this.wn;
            var c1 = (this.v0 + this.x0 * s2) / (s2 - s1);
            var c2 = -(this.v0 + this.x0 * s1) / (s2 - s1);
            var x = c1 * Math.exp(s1 * t) + c2 * Math.exp(s2 * t);
            return this.yScale(x);
        }

    },

    buildData: function() {
        var nData = this.data.length;
        var shift = this.tLow;
        var slope = (this.tUpp - this.tLow) / (nData - 1);
        for (var i = 0; i < nData; i++) {
            var t = shift + i * slope;
            this.data[i] = [this.xScale(t), this.myDataCurve(t)];
        }
    },

    redraw: function() {
        this.wn = sliderFreq.getValue();
        this.xi = sliderDamp.getValue();
        this.buildData();
        d3.select("#panelTwo").select(".curve")
            .attr("d", smoothCurve(this.data));
    }
}

var smoothCurve = d3.svg.line()
    .x(function(d) {
        return d[0];
    })
    .y(function(d) {
        return d[1];
    })
    .interpolate("monotone");

//Initialize the step response curve
d3.select("#panelTwo").append("path")
    .attr("class", "curve");

stepResponse.buildData();


//ANIMATION LOOP:
var tLast = 0,
    dt = 0;
d3.timer(function(t) {
    dt = t - tLast;
    tLast = t;

    var nSubStep = 5;
    for (i = 0; i < nSubStep; i++) {
        chaser.timeStep(dt / nSubStep);
    }

    target.updateTarget();
    chaser.updateTarget();
    chaser.redraw();
    target.redraw();
    sliderDamp.redraw();
    sliderFreq.redraw();
    stepResponse.redraw();
});

function updateTargetMotion(value) {
    target.motionType = value;
}