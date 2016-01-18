/* Global variables */

var UNKNOWN = "Unknown"; // string used in CSV file, to detect unknown supplier companies
var MINANGLE = 5; //min angle in degrees to show label in sunburst
var currentYear = 2011; //year currently being displayed
var currentColor = null; //year currently being displayed

// Prepare multilingual
var fr = {
	root: "Administration fédérale",
	of: "de"                          // e.g. xx % DE administration fédérale
}
var lang = fr;

/*****************/

module.exports = {
	lang: lang,
	UNKNOWN: UNKNOWN,
	MINANGLE: MINANGLE,
	currentYear: currentYear,
	currentColor: currentColor
}