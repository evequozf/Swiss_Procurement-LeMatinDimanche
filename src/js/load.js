var globals = require('./globals.js');

/**************** data preparation sunburst ******************/

// Prepare data format for sunburst: should look like import/fake-sunburst.json
// + added fields e.g. fullDept, fullOffice, percentages, ...
function prepareDataSunburst(fulldata,year) {
	
	//sunburst shows only one year -> keep only current year
	filtereddata = fulldata.filter(function(d) { return +d.year == year; });

	//console.log(data);
	var nest = d3.nest()
		.key(function(d) {return d.dept;})
		.key(function(d) {return d.office;})
		.rollup(function(values) {return {
			"fullDept": values[0].fullDept,     // store additional params
			"fullOffice": values[0].fullOffice, // store additional params
			"chf":d3.sum(values, function(dd) {return +dd.amount;})
		}})
		.map(filtereddata,d3.map);
	//console.log(nest);

	// construct sunburst data (aka fake.json format) from nested data above
	var depts = [], sumdepts = 0;
	nest.forEach(function(key,value) {
		// level 1 : dept
		var offices = [], sumoffices = 0, fullDept = '';
		// level 2 : offices
		value.forEach(function(key,value) {
			offices.push( {
					"name": key,
					"nameFull": value.fullOffice,
					"chf": +value.chf
				});
			sumoffices += +value.chf;
			fullDept = value.fullDept;  // parameters are stored at the leaf level, i.e. here
		});
		// level 2 : insert proportion of each office
		offices = offices.map(function(d) {
			d.percent = Math.round(100 * d.chf / sumoffices); 
			return d;
		});
		// level 1 : dept create
		depts.push( {
				"name": key,
				"nameFull": fullDept,
				"chf": sumoffices,
				"children": offices
			});
		sumdepts += sumoffices;
		// level 1 : insert proportion of each dept
		depts = depts.map(function(d) {
			d.percent = Math.round(100 * d.chf / sumdepts); 
			return d;
		})
	});
	return {"name":globals.lang.root, "nameFull":globals.lang.root, "children": depts, "chf": sumdepts, "percent": 100};
}

/**************** data preparation bar ******************/

// Prepare data format for bar chart: should look like import/fake-bar.tsv
function prepareDataBar(filtereddata) {
	var data = [];
	var nest = d3.nest()
		.key(function(d) {return d.supplier})
		.rollup(function(d) {return {
			"chf":d3.sum(d, function(dd) {return +dd.amount;})
		}})
		.map(filtereddata,d3.map);

	// construct bar data from nested data above (removing "UNKNOWN")
	nest.forEach(function(key,value) {	
		if(key !== globals.UNKNOWN) {
			data.push( {
					"supplier": key,
					"amount": value.chf
				});
		}
	});
	return data.sort(function(a,b) {return d3.descending(a.amount, b.amount)});
}


/*****************************/
module.exports = {
	prepareDataSunburst: prepareDataSunburst,
	prepareDataBar: prepareDataBar
}

