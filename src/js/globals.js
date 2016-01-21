/* Global variables */

var UNKNOWN = "Unknown"; // string used in CSV file, to detect unknown supplier companies
var MINANGLE = 5; //min angle in degrees to show label in sunburst

var SUPPLIER_LABEL_MAX = 25; // characters shown in label of bar charts 'supplier'
var SUPPLIER_AMOUNT = 40; // show only xx most important suppliers in chart

var currentYear = 2011; //year currently being displayed
var currentColor = null; //year currently being displayed


// Prepare multilingual
var fr = {
	dataSuffix: "Fr",
	root: "Administration fédérale",
	of: "de" ,                         // e.g. xx % DE administration fédérale
	missingData: "(missing data)",
	mandates: "Mandats",
	part: "Part"
}
var lang = fr;

/*****************/

module.exports = {
	lang: lang,
	UNKNOWN: UNKNOWN,
	MINANGLE: MINANGLE,
	SUPPLIER_LABEL_MAX: SUPPLIER_LABEL_MAX,
	SUPPLIER_AMOUNT: SUPPLIER_AMOUNT,
	currentYear: currentYear,
	currentColor: currentColor
}