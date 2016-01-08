/* Global variables */

var UNKNOWN = "Unknown"; // string used in CSV file, to detect unknown supplier companies
var MINANGLE = 5; //min angle in degrees to show label in sunburst

// Prepare multilingual
var fr = {
	root: "Administration fédérale",
	dutotal: "du total"               // xx % du total
}
var lang = fr;

/*****************/

module.exports = {
	lang: lang,
	UNKNOWN: UNKNOWN,
	MINANGLE: MINANGLE
}