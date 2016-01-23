/**********

Sunburst.js


***********/

var globals = require("./globals.js");

module.exports = {
	build: buildSunburst,
	update: updateSunburst,
	changeYear: changeYear
}

/*************************************/

var root, nodes, newData;

// recursively change fields chf and percent in children to match current year
function recChangeYear(node, year) {
	node.chf =  node["chf_"+year];
	node.percent = node["percent_"+year];
	if(node.children) {
  		node.children = node.children.map(function(n) {
  		return recChangeYear(n, year);
		});
	}
	return node;
}

// Selects the relevant parts of data and set them to chf and percent + reassign new data to visual elements, and return new data
function changeYear(year) {

  var newData = recChangeYear(root, year);

  // Partition & Build viz
  nodes = partition.nodes(newData);

  // colorize (needed ?)
  color.domain(newData.children.map(function(d) {return d.name} ));
  nodes.forEach(function(n,i){ setColors(n,i) });

	nodes.map(function(d) {
		d.chf = d["chf_"+year],
		d.percent = d["percent_"+year]
	});

	sunburstG.data(nodes);

	return newData;
}

// Setup for switching data: stash the old values for transition.
function stash(d) {
  d.x0 = d.x;
  d.dx0 = d.dx;
}


/*****************/

// svg elements with data associated in sunburst
var sunburstG, paths, texts; 

var margin = {top: 30, right: 20, bottom: 20, left: 20},
    width = 550 - margin.left - margin.right,
    height = 550 - margin.top - margin.bottom;

var svg; // will contain sunburst

var radius = (Math.min(width, height) / 2) - 5;

var x = d3.scale.linear()
    .range([0, 2 * Math.PI]);

var y = 
	//d3.scale.sqrt() // original
	d3.scale.linear()
      .range([0, radius]);

var partition = d3.layout.partition()
    .value(function(d) { return d.chf; });

var arc = d3.svg.arc()
    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
    .innerRadius(function(d) { return Math.max(0, y(d.y)); })
    .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });

/*
var color = d3.scale.linear()
	//.range(["#bf482c", "#fff"])
	.range(["#888", "#eee"])
	.interpolate(d3.interpolateLab);
*/
// Brewer pastel2
var color = d3.scale.ordinal()
	.range(["#cbd5e8","#fdcdac","#b3e2cd","#f4cae4","#e6f5c9","#fff2ae","#f1e2cc","#cccccc"]);
/*
var color = d3.scale.ordinal()
	.range(["#444", "#555", "#666", "#777", "#888", "#999", "#aaa", "#bbb", "#ccc", "#ddd", "#eee"]);
*/

// create SVG with transforms
svg = d3.select("#sunburst-container").append("svg")
    .attr("width", width+margin.left+margin.right)
    .attr("height", height+margin.top+margin.bottom)
    .append("g")
      .attr("transform","translate("+margin.left+","+margin.top+")")
    .append("g")
      .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");

// init responsiveness of svg on load and resize events
ds.responsive(d3.select("#sunburst-container svg")).start();


// Main function : build sunburst
function buildSunburst(data) {
  
  // set root
  root = data;

  // Partition & Build viz
  nodes = partition.nodes(data);

  // colorize
  color.domain(data.children.map(function(d) {return d.name} ));
  nodes.forEach(function(n,i){ setColors(n,i) });

  //svg.selectAll("*").remove(); //////////////// to update !!!

  sunburstG = svg.selectAll("g")
    .data(nodes)
  .enter().append("g");

  paths = sunburstG.append("path");
  texts = sunburstG.append("text");
  
  paths
    .attr("d", arc)
    .style("fill", function(d) { return d.color; })
    .on("click", function(d) { return globals.showDetail(d); })
    .on("mouseover", mouseOver)
    .on("mouseout", mouseOut)
    .each(stash);
      
  texts
    .text(function(d) { return d.name; })
    .attr("text-anchor", textAnchor)
    .attr("transform", textTransform)
    .style("opacity", textOpacity)
    .attr("dy", ".35em"); // vertical-align

}

/**************** interaction *****************/

function mouseOver(d) {
	paths.style("opacity", function(dd) { return inSubTree(dd,d) ? "1" : ".33" });
	// Fixed tooltip on sunburst
	d3.select("#fixed-tooltip-dept").text(d.nameFull);
	d3.select("#fixed-tooltip-chf").text("CHF " + ds.formatNumber(d.value));
	d3.select("#fixed-tooltip-percent").text( 
    (typeof d.parent !== 'undefined' ?  //root node -> no text
      (d.percent < 1 ? "< 1" : d.percent)  + " % " + globals.lang.of + " " + d.parent.name 
      : "")); 
}

function mouseOut(d) {
	paths.style("opacity", "1");
	d3.selectAll("#fixed-tooltip *").text(null);
}


// update when showDetails is called
function updateSunburst(d, changeData) {
	
	//default param
	if(typeof changeData === 'undefined') changeData = false;

	// update sunburst
	var trans = sunburstG.transition()
	  .duration(750)
	  .tween("scale", function() {
	    var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
	        yd = d3.interpolate(y.domain(), [d.y, 1]),
	        yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
	    return function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); };
	  });
	trans.selectAll("path")
	      .attrTween("d", function(d) { return tweenDataZoom(d, arc, changeData) });

  trans.selectAll("text")
        .attrTween("transform", function(d) { return tweenDataZoom(d, textTransform, changeData) })
        .attrTween("text-anchor", function(d) { return tweenDataZoom(d, textAnchor, changeData) })
        .styleTween("opacity", function(d) { return tweenDataZoom(d, textOpacity, changeData) });

	// update breadcrumb trail
  	breadCrumb(d);
}

// Returns tween function applying func, in case of data change (i.e. year change) or not (i.e. just zooming in/out)
function tweenDataZoom(d, func, dataChange) {
  if(dataChange) {
    var i = d3.interpolate({x: d.x0, dx: d.dx0}, d);
    return function(t) {
      var b = i(t);
      d.x0 = b.x;
      d.dx0 = b.dx;
      return func(b);
    };
  }
  else return function() { return func(d); }
}


/**************** Breadcrumbs ************************/

// Given data d, build breadcrumb iteratively
function breadCrumb(d) {
	var p = d, bc = d3.select("#breadcrumb");
	bc.selectAll("*").remove();
  bc = bc.append("ol").attr("class","breadcrumb");
  while ( typeof p !== 'undefined' ) {
    var n = bc.insert("li", ":first-child");
    n = n.append("span")
      .datum(p) // attach current data to breadcrumb button
      .attr("class","btn btn-default")
      .style("background-color", p.color)
      .on("click", function(dd) { globals.showDetail(dd) })
      .on("mouseover", mouseOver) // show tooltip on hover of breadcrumb
      .on("mouseout", mouseOut);   // hide tooltip on hover of breadcrumb
    // home icon for root
    if(p.name == globals.lang.root) {
      n.append("i").attr("class", "fa fa-home");
    }
    // text of breadcrumb trail
    n.append("span").text(p.name);
    // iteratively get up in hierarchy
    p = p.parent;
  }
}

/******************************************
      HELPER functions for sunburst 
*******************************************/

/*** for labels ***/

// text should be visible only if |startAngle - endAngle| > MINANGLE degrees, and not in center
function textOpacity(d) {
  	var diff = arc.startAngle()(d) - arc.endAngle()(d);
  	var mina = Math.PI * globals.MINANGLE / 180; 
  	var show = Math.abs(diff) > mina && arc.innerRadius()(d) != 0; // inner radius == 0 iff center
  	return show ? 1 : 0;
}

// returns angle of a given data label in sunburst (normalized between 0 and 360) (i.e. middle of arc)
function getAngle(d) {
	var angle = ( (arc.startAngle()(d) + arc.endAngle()(d)) / 2 ) - Math.PI / 2;
	angle = angle / Math.PI * 180; // to degrees 
	var newAngle = angle;
  while (newAngle <= 0) newAngle += 360;
  while (newAngle > 360) newAngle -= 360;
  return newAngle;
}

// text should be flipped if between 90 and 270
function shouldFlipText(angle) {
	return ((angle > 90) && (angle < 270));
}

// returns text transform for labels in sunburst
function textTransform(d) {
	var margin = 6;
	var angle = getAngle(d);
	var flip = shouldFlipText(angle);
	nAngle = flip ? angle - 180 : angle;  // if flip -> - 180 degrees
	var transY = flip ? -margin - y(d.y) : margin + y(d.y); // fix position if flipped
  return "rotate(" + nAngle + ")translate(" + transY + ",0)";
}

function textAnchor(d) {
	return shouldFlipText(getAngle(d)) ? "end" : "start";
}

/*** for colors ***/

function setColors(node,idx) {
  if(typeof node.parent === 'undefined') {
    // Root node color
    node.color = "#ffffff"; 
  } else if(typeof node.parent.parent === 'undefined') { 
    // First level after root -> fixed color
    node.color = color(node.name);
  } else {
    // Children nodes
    var pc = node.parent.color;
    // slightly brighter than parent
    var c = d3.lab(pc);
    node.color = c.brighter(0.7).toString();
    if(node.children != null) {
      node.children.forEach(function(n,i){setColors(n,idx)});
    }
  }
  node.hcolor = d3.lab(node.color).brighter().toString();
  return node;
}

// return true if in subtree self or parent (n = current node, p = parent to test)
function inSubTree(n,p) {
  if(n == p) {
    return true
  } else if(typeof n.parent === 'undefined') {
    return false;
  } else if(n.parent == p) {
    return true
  } else {
    return inSubTree(n.parent, p);
  }
}
