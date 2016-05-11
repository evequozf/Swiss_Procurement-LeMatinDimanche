/***************** bar chart **************************/
var globals = require('./globals.js');
var load = require('./load.js');

module.exports = {
	updateBar: updateBar
};

var catlang = globals.lang.categorie;

/**************** update bar ******************/

function updateBar(data) {
	var d = load.prepareDataBar(data);
	buildBar(d.slice(0, globals.SUPPLIER_AMOUNT)); //take only SUPPLIER_AMOUNT first suppliers, FIXME : put elsewhere ?
}

/**************** viz building bar ******************/

function buildBar(data) {
  
  var HEIGHT = 16; // height of bar

  var barmargin = {top: 20, right: 40, bottom: 20, left: 150},
  barwidth = 500 - barmargin.left - barmargin.right,
  barheight = data.length * HEIGHT + barmargin.top;

  var ybar = d3.scale.ordinal()
      .rangeRoundBands([0, barheight], 0.1);

  var xbar = d3.scale.linear()
      .range([0, barwidth]);

  var xAxis = d3.svg.axis()
      .scale(xbar)
      .orient("top")
      .ticks(4)
      .tickFormat(function(d) { return ds.formatNumber(d); });

  var yAxis = d3.svg.axis()
      .scale(ybar)
      .orient("left")
      .tickFormat(function(d) { return d.substring(0, globals.SUPPLIER_LABEL_MAX) + (d.length > globals.SUPPLIER_LABEL_MAX ? "..." : ""); });

  //cleanup
  d3.select("#barchart-container svg").remove();
  
  var svgbar = d3.select("#barchart-container").append("svg")
      .attr("width", barwidth + barmargin.left + barmargin.right)
      .attr("height", barheight + barmargin.top + barmargin.bottom)
    .append("g")
      .attr("transform", "translate(" + barmargin.left + "," + barmargin.top + ")");

  //svgbar.selectAll("*").remove();

  xbar.domain([0, d3.max(data, function(d) { return d.amount; })]);
  ybar.domain(data.map(function(d) { return d.supplier; }));

  svgbar.append("g")
      .attr("class", "x axis")
      .call(xAxis)
      .append("text")
      	.attr("x", xbar.range()[1]+23)
      	.attr("dy", "-.85em")
      	//.style("text-anchor", "end")
      	.text("CHF");

  svgbar.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  var bars = svgbar.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("y", function(d) { return ybar(d.supplier); })
      .attr("height", ybar.rangeBand())
      .attr("x", function(d) { return xbar(0); })
      .attr("width", function(d) { return xbar(d.amount); })
      .style("fill", globals.currentColor);

  // tooltip
  // var tt = ds.ttip(bars);
  // tt.html(function(d) {
  //   var spendings = globals.fullData
  //     .filter(function(e) { return +e.year == globals.currentYear; })
  //     .filter(function(e) { return e.supplier == d.supplier; });
  //   var categoryNames = spendings.map(function(e) { return e.fullCategory; }).filter( function(value, index, self) { return self.indexOf(value) === index; });
  //   var supplierDetail = spendings.map(function(e) { return e.supplierDetail; });
  //   var suppDet = "";
  //   if(supplierDetail[0] !== "") { suppDet += "<p>" +supplierDetail[0] + "</p>"; }
  // 		return "<h4>"+d.supplier+"</h4>"+
  //       suppDet +
  //       "<p>"+catlang+": " + categoryNames[0] + "</p>"+
  //       "<p>CHF  "+ds.formatNumber(d.amount)+"</p>";
  //   }
  // );

  var tt = ds.ttip(bars);
  tt.html(function(d) {
        var spendings = globals.fullData
          .filter(function(e) { return +e.year == globals.currentYear; })
          .filter(function(e) { return e.supplier == d.supplier; });
        var sortedCategories = d3.nest()
          .key(function(d) { return d.fullCategory; })
          .rollup(function(spending) { return d3.sum(spending, function(d) {return +d.amount;}) } )
          .entries(spendings)
          .sort(function(a,b) { return (d3.descending(a.values, b.values)); });
        //console.log(sortedCategories);
        var supplierDetail = spendings.map(function(e) { return e.supplierDetail; });
        var suppDet = "";
        if(supplierDetail[0] !== "") { suppDet += "<p>" +supplierDetail[0] + "</p>"; }
    return "<h4>"+d.supplier+"</h4>"+
          suppDet +
          "<p>"+catlang+":<br>" + sortedCategories[0].key + "</p>"+
          "<p>CHF  "+ds.formatNumber(d.amount)+"</p>";
      }
    );

  // fade in whole svg
  svgbar.fadeIn();

}