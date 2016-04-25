/******************

Main application file. 

Loads the others. Manages global thread of control and interaction flow.

********************/

var globals = require('./globals.js');
var load = require('./load.js');
var bar = require('./bar.js');
var spark = require('./sparkline.js');
var sunburst = require('./sunburst.js');
var preprocess = require('./preprocess.js');

/**************** data loading & initialization ******************/

var fullData; // full data
var thisYearData; //only this year 

var sbData; // data created by last sunburst.build()


// Load all and call main
var dsv = d3.dsv(';');
queue()
    .defer(d3.csv, "import/master_export_short.csv")
    .defer(dsv, "import/suppliers-utf8.csv")
    .defer(dsv, "import/depts-utf8.csv")
    .defer(dsv, "import/offices-utf8.csv")
    .defer(dsv, "import/categories-utf8.csv")
    .await(main);


//d3.dsv(",")("https://dl.dropboxusercontent.com/s/36k9pc7ll8yhhe3/master_export.csv?dl=1", function(error, data) {
//d3.dsv(",")("import/master_export.csv", function(error, data) { 

function main(error, rawdata, suppliers, depts, offices, categories) {

  // get full data table
  fullData = preprocess(rawdata, suppliers, depts, offices, categories);

  // set global showDetails
  globals.showDetail = showDetail;

  /*********** create buttons for chosing years ***********/
  d3.select("#years").selectAll("span.year")
    .data(globals.years)
      .enter()
      .append("span.year.vis-button")
      .text(function(d) { return d; })
      .on("click", function(d) { 
        d3.selectAll("#years .year").classed("selected", function(dd) { return dd == d; })
        return updateYear(d); 
      });

  // configure fade in
  ds.fadeInDuration = 200;

  // transform data and build visualizations
  sbData = load.prepareDataSunburst(fullData);
  var nodes = sunburst.build(sbData);

  // prepare select field
  d3.select("#search").selectAll("option")
    .data(nodes.map(function(d) { return { name: d.nameFull, key: getKey(d) } } ))
      .enter()
      .append("option")
      .attr("key", function(d) { return d.key })
      .text(function(d) { return d.name; });
  d3.select("#search").on("change", function() {
    var key = this.options[this.selectedIndex].getAttribute("key");
    showDetail(getSbData(sbData, key));
  });

  // update all viz
  updateYear(2014);

}

/**************** main update function: based on year ******************/

function updateYear(year) {
  
  // set year
  globals.currentYear = year; 
  thisYearData = fullData.filter(function(d) { return +d.year == globals.currentYear; });
  d3.select("#year").text(globals.currentYear).fadeIn();
  d3.selectAll("#years .year").classed("selected", function(d) { return d == globals.currentYear; })

  // create sunburst
  //var sbData = load.prepareDataSunburst(thisYearData);
  //sunburst.build(sbData);
  sbData = sunburst.changeYear(year);

  // if data key is not set (first execution) set it to root
  if(globals.currentDataKey == "")
    globals.currentDataKey = getKey(sbData);

  //show the details pane for selected node of sunburst with no transition (false)
  var currentData = getSbData(sbData, globals.currentDataKey);
  currentData = currentData != null ? currentData : sbData; // current data might be null if department is not present that year
  showDetail(currentData);
}

// Look for data corresponding to currently selected data (i.e. key)
function getSbData(node, key) {
  //console.log(node);
  if(getKey(node) === key) 
    return node;
  else if(typeof node.children !== 'undefined')
      for(var i = 0; i < node.children.length; i++) {
        var n = getSbData(node.children[i], key);
        if(n !== null) return n;
      }
  return null;
}

function getKey(d) {
  return d.depth + d.nameFull;
}

/**************** show details and update all viz *****************/

// show extended details pane for a selected / clicked element (given data)
function showDetail(d) {
  
  // global data key to be this data key
  globals.currentDataKey = getKey(d);

   // global color to be this color
  globals.currentColor = d.color;

  // update sunburst & associated breadcrumbs
  sunburst.update(d)

  // update detail summary text
  updateSummary(d);
  
  // select relevant data for barchart
  var fdata = fullData;
  if(d.depth == 0) {
    // nothing
  } else if (d.depth == 1) {
    fdata = fdata.filter(function(dd){return dd.dept === d.name});
  } else if (d.depth == 2) {
    fdata = fdata.filter(function(dd){return dd.office === d.name});
  }

  // update sparklines (data with all years)
  updateSparklines(fdata,d.name);

  // update bar chart -> just this year
  bar.updateBar(fdata.filter(function(d) { return +d.year == globals.currentYear; }));
  var resp = ds.responsive(d3.select("#barchart-container svg")).start(); // create responsive behaviour on load and resize events...
  resp.update(); // ... and force a responsive update now
  
  // update bar chart title
  d3.select("#officename").text(d.nameFull).fadeIn();

  // update select box
  d3.select('#search').node().value = d.nameFull;
}

/**************** update details: 'summary' ******************/

// Format CHF  XXX XXX XXX (on 19 characters)
function formatChf(d) {
  // Pad with spaces -> requires in css to have 'white-space: pre' (otherwise must pad with nbsp which is '\xa0')
  return "CHF" + d3.format("19,f")(d).replace(/,/g," ");
}

// Returns amount of known suppliers in d and children
function getChildrenAmountKnown(d) {
  var f;
  if(d.depth == 0) {
    f = function(dd) { return dd.supplier !== globals.UNKNOWN; }
  } else if(d.depth == 1) {
    f = function(dd) { return (dd.supplier !== globals.UNKNOWN) && (dd.dept === d.name); }
  } else if(d.depth == 2) {
    f = function(dd) { return (dd.supplier !== globals.UNKNOWN) && (dd.office === d.name); }
  }
  return d3.sum(thisYearData.filter(f), function(dd) {return +dd.amount});
}

function updateSummary(d) {
  var known = getChildrenAmountKnown(d), unknown = d.chf - known;
  d3.select("#details-total").text(formatChf(d.chf)).fadeIn();
  d3.select("#details-known").text(formatChf(known)).fadeIn();
  d3.select("#details-unknown").text(formatChf(unknown)).fadeIn();

  var pk = Math.round(100*known/d.chf), pu = Math.round(100*unknown/d.chf);
  pk = isNaN(pk) ? 0 : pk; pu = isNaN(pu) ? 0 : pu;
  d3.select("#details-known-percent").text(pk + "%").fadeIn();
  d3.select("#details-unknown-percent").text(pu + "%").fadeIn();

  d3.select(".total").style("background-color", globals.currentColor);
}

/**************** update details: sparklines ******************/

function updateSparklines(filtereddata,name) {
  
  // clean sparklines
  var div = d3.select("#sparkline-container");
  div.selectAll("*").remove();
  
  // create list of categories with total over category for this year and store in array
  var cats = d3.nest()
    .key(function(d) { return d.fullCategory; })
    .rollup(function(values) { return d3.sum(values.filter(function(d) { return +d.year == globals.currentYear; }), 
          function(d) {return +d.amount; }) })
    .entries(filtereddata);
  
  // sort by descending total over category this year
  //console.log(cats);
  cats = cats.sort(function(a,b) {return d3.descending(a.values,b.values)});
  
  //compute total amount (for proportion later on)
  var tot = d3.sum(filtereddata.filter(function(d) { return +d.year == globals.currentYear; }), 
      function(d) { return +d.amount; });
  
  // create a sparkline for each category
  cats.forEach(function(c) {
    spark.Sparkline(div, filtereddata.filter(function(dd) { return dd.fullCategory === c.key; }), tot, name);
  }); 
}


/**************** search box ******************/



