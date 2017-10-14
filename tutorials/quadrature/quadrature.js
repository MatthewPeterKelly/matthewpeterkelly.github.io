var xDomain = [0, 2 * Math.PI];

    function myDataCurve(t) {
        return Math.cos(0.5 * t + 1.25) * Math.sin(2 * t)
    }

    // Create a plain data set
    function buildData(nData) {
        var data = new Array(nData);
        var shift = xDomain[0];
        var slope = (xDomain[1] - xDomain[0]) / (nData - 1);
        for (var i = 0; i < nData; i++) {
            var t = shift + i * slope;
            data[i] = [t, myDataCurve(t)];
        }
        return data;
    }

    // Create a data set with an additional point on each end at zero
    function buildDataStair(nData) {
        var data = new Array(nData + 2);
        var shift = xDomain[0];
        var slope = (xDomain[1] - xDomain[0]) / (nData - 1);
        for (var i = 0; i < nData; i++) {
            var tLow = shift + i * slope;
            var tMid = shift + (i + 0.5) * slope;
            data[i + 1] = [tLow, myDataCurve(tMid)];
        }
        data[0] = [xDomain[0], 0];
        data[nData + 1] = [xDomain[1], 0];
        return data;
    }

    var margin = {
        top: 20,
        right: 30,
        bottom: 30,
        left: 40
    }
    var width = 800 - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;

    var x = d3.scale.linear()
        .domain(xDomain)
        .range([0, width]);

    var y = d3.scale.linear()
        .domain([-1, 1])
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var lineSmooth = d3.svg.line()
        .interpolate("monotone")
        .x(function(d) {
            return x(d[0]);
        })
        .y(function(d) {
            return y(d[1]);
        });

    var lineLeftHold = d3.svg.line()
        .interpolate("step-after")
        .x(function(d) {
            return x(d[0]);
        })
        .y(function(d) {
            return y(d[1]);
        });