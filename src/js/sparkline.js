/** 
  Creates a sparkline in element. Arguments:
	element : d3 element (i.e. produced by d3.select(element))
	data : data to show (filtered, just the item considered, along years)
*/

var globals = require("./globals.js");

module.exports = {
	Sparkline: Sparkline 
}

/*****************/

//test -> with or without legend on axis
var LEGEND = false;

function Sparkline(element, data, totalParent, parentName) {

	var _element = element;
	var _fullData = data;

	var _data = d3.nest()
		.key(function(d) {return d.year;})
		.rollup(function(values) {
			return d3.sum(values, function(dd) {return +dd.amount;});
		})
		.entries(data);

	var margin = {top: 10, right: 10, bottom: 20, left: (LEGEND ? 80 : 10)},
    	width = 130 - margin.left - margin.right,   // FIXME: hardcode 130 si bootstrap "container", 180 si "container-fluid"
    	height = 60 - margin.top - margin.bottom;

	var x = d3.scale.ordinal()
    	.rangeRoundBands([0, width], .1);

	var y = d3.scale.linear()
	    .range([height, 0]);

	var xAxis = d3.svg.axis()
	    .scale(x)
	    .orient("bottom");

	var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left");

	//function my() {

      //console.log(_data);
      var div = _element.append("div.sparkline.col-xs-6.col-sm-4");
      var leftdiv = div.append("div.left");
      var rightdiv = div.append("div.right");

	  var chart = rightdiv.append("svg")
		    .attr("width", width + margin.left + margin.right)
		    .attr("height", height + margin.top + margin.bottom)
		  .append("g")
		    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	  //x.domain(_data.map(function(d) { return d.key; })); 
	  x.domain([2011,2012,2013,2014]);              // FIXME : should it be fixed ?
	  y.domain([0, d3.max(_data, function(d) { return d.values; })]);  // FIXME : should it be fixed ?

	  //ticks : max and min only 
	  yAxis.tickValues([y.domain()[0], y.domain()[1]]);
	  yAxis.tickFormat(function(d) {return "CHF " + ds.formatNumber(d)});

	  xAxis.tickValues([x.domain()[0], x.domain()[x.domain().length-1]]);

	  chart.append("g")
	      .attr("class", "x axis")
	      .attr("transform", "translate(0," + height + ")")
	      .call(xAxis);

	  if(LEGEND) {
		  chart.append("g")
		      .attr("class", "y axis")
		      //.attr("transform", "translate("+width+",0)")
		      .call(yAxis);
	  }

	  var bars = chart.selectAll(".bar")
	      .data(_data)
	    .enter().append("rect")
	      .attr("class", "bar")
	      .attr("x", function(d) { return x(d.key); })
	      .attr("y", function(d) { return y(d.values); })
	      .attr("height", function(d) { return Math.max(0, height - y(d.values)); })
	      .attr("width", x.rangeBand())
	      .style("fill", function(d) { return (d.key == globals.currentYear ? globals.currentColor : null) });

	  // tooltip
	  var tt = ds.ttip(bars);
	  tt.html(function(d) { 
	  		return "<h4>"+d.key+"</h4>"+
	  			"<p>CHF  "+ds.formatNumber(d.values)+"</p>"
	  	});

	  // text
	  leftdiv.append("h5").text(_fullData[0].fullCategory);
	  var dataThisYear = _data.filter(function(d){ return d.key == globals.currentYear; });
	  var amount = dataThisYear.length == 0 ? 0 : dataThisYear[0].values;
	  var prop = Math.round(100 * (amount/totalParent));
	  if(prop == 0) prop = "<1";
	  leftdiv.append("p").text(globals.lang.mandates + " " + globals.currentYear 
	  		+ " : CHF " + ds.formatNumber(amount));
	  leftdiv.append("p").text(globals.lang.part + " " + globals.currentYear
	  		+ " : " + prop + "% " + globals.lang.of + " " + parentName);
	//}

	  // responsiveness
	  //ds.responsive(rightdiv.select("svg")).start(); // does not work
	
	//return my;
}