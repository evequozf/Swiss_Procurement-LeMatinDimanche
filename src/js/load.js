var globals = require('./globals.js');

/*****************************/
module.exports = {
	prepareDataSunburst: prepareDataSunburst,
	prepareDataBar: prepareDataBar
}

/**************** data preparation sunburst ******************/

var years = globals.years;

// Prepare data format for sunburst: should look like import/fake-sunburst.json
// + added fields e.g. fullDept, fullOffice, percentages, ...
// + added years
function prepareDataSunburst(filtereddata) {
	
	//console.log(data);
	var nest = d3.nest()
		.key(function(d) {return d.dept;})
		.key(function(d) {return d.office;})
		.rollup(function(values) {
			// v will be {fullDept: ..., fullOffice: ..., chf_all: ..., chf_2011: ..., chf_2012: ......, chf: ...}
			var v =  {
				"fullDept": values[0].fullDept,     // store additional params
				"fullOffice": values[0].fullOffice, // store additional params
				"chf_all":d3.sum(values, function(dd) {return +dd.amount;})
			}
			v.chf = v.chf_all; // default chf value is total over all years
			// constructs chf_2014: xxxx, chf_2013: yyyy, etc. for each value
			years.forEach(function(year) {
				v["chf_"+year] = d3.sum(values.filter(function(dd){ return +dd.year === year}), 
					function(dd) {return +dd.amount;})
			});
			return v;
		})
		.map(filtereddata,d3.map);
	//console.log(nest);

	// construct sunburst data (aka fake.json format) from nested data above
	var depts = [], sumdepts = {all: 0};
	nest.forEach(function(key,value) {
		// level 1 : we are here inside a dept
		var offices = [], sumoffices = {all: 0}, fullDept = '';
		// level 2 : we go inside each office of the dept
		value.forEach(function(key,value) {
			var v = {
				"name": key,
				"nameFull": value.fullOffice,
				"chf": value.chf,
				"chf_all": value.chf_all
			};
			// constructs chf_yyyy value with yyyy = year, & sumoffices per year
			years.forEach(function(year) {
				v["chf_"+year] = value["chf_"+year];
				if(!sumoffices[year]) sumoffices[year] = 0;
				sumoffices[year] += value["chf_"+year];
			});
			sumoffices.all += value.chf_all;
			offices.push(v);
			fullDept = value.fullDept;  // parameters are stored at the leaf level, i.e. here
		});
		// level 2 : insert proportion of each office for each year
		offices = offices.map(function(d) {
			d.percent_all = Math.round(100 * d.chf_all / sumoffices.all); 
			years.forEach(function(year) {
				d["percent_"+year] = Math.round(100 * d["chf_"+year] / sumoffices[year]);
			});
			d.percent = d.percent_all;
			return d;
		});

		//console.log(offices);

		// level 1 : dept create
		var d = {
				"name": key,
				"nameFull": fullDept,
				"chf": sumoffices.all,
				"chf_all": sumoffices.all,
				"children": offices
		};
		// constructs chf_yyyy value with yyyy = year, & sumdepts per year & percentage
		years.forEach(function(year) {
			d["chf_"+year] = sumoffices[year];
			if(!sumdepts[year]) sumdepts[year] = 0;
			sumdepts[year] += sumoffices[year];
		});
		sumdepts.all += sumoffices.all;
		depts.push(d);
	});

	// level 1 : insert proportion of each dept
	depts = depts.map(function(d) {
		d.percent_all = Math.round(100 * d.chf_all / sumdepts.all); 
		years.forEach(function(year) {
			d["percent_"+year] = Math.round(100 * d["chf_"+year] / sumdepts[year]);
		});
		d.percent = d.percent_all;
		return d;
	});

	//console.log(depts);

	// Create root
	var root = {
		"name":globals.lang.root, 
		"nameFull":globals.lang.root, 
		"children": depts, 
		"chf": sumdepts.all, 
		"chf_all": sumdepts.all, 
		"percent": 100,
		"percent_all": 100
	}

	// constructs chf_yyyy and percent_yyyy value with yyyy = year
	years.forEach(function(year) {
		root["chf_"+year] = sumdepts[year];
		root["percent_"+year] = 100;
	});
		
	return root;
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