/* Global variables */

var UNKNOWN = "Unknown"; // string used in CSV file, to detect unknown supplier companies
var MINANGLE = 5; //min angle in degrees to show label in sunburst

var SUNBURST_LABEL_MAX = 15; // characters shown in label of sunburst

var SUPPLIER_LABEL_MAX = 25; // characters shown in label of bar charts 'supplier'
var SUPPLIER_AMOUNT = 40; // show only xx most important suppliers in chart

var years = [2011, 2012, 2013, 2014]
var currentYear = 2011; //year currently being displayed
var currentColor = null; //year currently being displayed

var currentDataKey = "";  // key value of current data (based on sunburst data format)

var showDetail = null; // will hold global function to show detail of a selected element, set in main.js

// Prepare multilingual
var fr = {
	dataSuffix: "Fr",
	root: "Administration fédérale",
	of: "de" ,                         // e.g. xx % DE administration fédérale
	missingData: "(missing data)",
	mandates: "Mandats",
	part: "Part"
}
var de = {
	dataSuffix: "De",
	root: "Bundesverwaltung",
	of: "von" ,                         // e.g. xx % DE administration fédérale
	missingData: "(missing data)",
	mandates: "Mandaten",
	part: "Anteil"
}
var lang = fr;

/*****************/

module.exports = {
	lang: lang,
	UNKNOWN: UNKNOWN,
	MINANGLE: MINANGLE,
	SUNBURST_LABEL_MAX: SUNBURST_LABEL_MAX,
	SUPPLIER_LABEL_MAX: SUPPLIER_LABEL_MAX,
	SUPPLIER_AMOUNT: SUPPLIER_AMOUNT,
	years: years,
	currentYear: currentYear,
	currentColor: currentColor, 
	currentDataKey: currentDataKey,
	showDetail: showDetail
}
