// Set the dimensions of the canvas / graph
var margin = {top: 30, right: 200, bottom: 40, left: 50},
    width = 1000 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// Set the ranges
var x = d3.scale.linear().range([0, width]);
var y = d3.scale.linear().range([height, 0]);

// Define the axes
var xAxis = d3.svg.axis().scale(x)
    .orient("bottom").ticks(5).tickFormat(d3.format("d"));

var yAxis = d3.svg.axis().scale(y)
    .orient("left");

// Define the line
var priceline = d3.svg.line()
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(d.perfs); })
    .interpolate("basis");
    
// Adds the svg canvas
var svg = d3.select("#visualization")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");

// Get the data
d3.csv("am-orch-rep-1842-1970-top-five-perf-count.csv", function(error, data) {
    data.forEach(function(d) {
  d.year = +d.year;
  d.perfs = +d.perfs;
    });

    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d.year; }));
    // y.domain([0 , 50]); 
    y.domain([d3.min(data, function(d) {
        return d.perfs;
    }), d3.max(data, function(d) {
        return d.perfs;
    })]);

    // Nest the entries by symbol
    var dataNest = d3.nest()
        .key(function(d) {return d.composerlast;})
        .entries(data);

    var color = d3.scale.category10();  // set the colour scale

    legendSpace = height/dataNest.length; // spacing for legend

    // Loop through each symbol / key
    dataNest.forEach(function(d,i) {

        svg.append("path")
            .attr("class", "line")
            .style("stroke", function() { // add color dynamically
                return d.color = color(d.key);})
            .attr("id", 'line'+d.key.replace(/\s+/g, '')) // assign ID to line
            .attr("d", priceline(d.values));

        svg.append("text")        
            .attr("x", width + (margin.right/2)+ 5)
            .attr("y", (legendSpace/2)+i*legendSpace) // spacing
            .attr("class", "legend") //style the legend
            .attr("id", 'legend'+d.key.replace(/\s+/g, '')) // assign ID to legend item
            .style("fill", function() {
                return d.color = color(d.key);})
            .on("click", function() {
                //Determine if current line is visible
                var active = d.active ? false : true,
                newOpacity = active ? 0 : 1;
                newColor = active ? "#bbbbbb" : d.color ;
                // Hide or show the elements based on the ID
                d3.select("#line"+d.key.replace(/\s+/g, ''))
                    .transition().duration(500)
                    .style("opacity", newOpacity);
                d3.select("#legend"+d.key.replace(/\s+/g, ''))
                    .transition().duration(500)
                    .style("fill", newColor);
                // Update whether or not the elements are active
                d.active = active;
            })
            .text(d.key);

    });

    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    svg.append("text")
        .attr("x", width/2)
        .attr("y", height + margin.bottom)
        .attr("class", "x-label, axis-label")
        .style("text-anchor", "middle")
        .text("Year");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - (height / 2))
        .attr("y", 0 - margin.left)
        .attr("dy", "1em")
        .attr("class", "y-label, axis-label")
        .style("text-anchor", "middle")
        .text("Number of Performances");

});
