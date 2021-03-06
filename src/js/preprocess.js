/************ Preprocessing **********************/

globals = require('./globals.js');

module.exports = function(data, suppliers, depts, offices, categories) {
	
	var sfx = globals.lang.dataSuffix;

	/* Keys = idSupplier, idCategory, deptDe, officeDe */
	var su = d3.map(suppliers, function(d) { return d.idSupplier; }),
		de = d3.map(depts, function(d) { return d.deptDe; }),
		of = d3.map(offices, function(d) { return d.original; }),
		ca = d3.map(categories, function(d) { return d.idCategory; });

	/* create additional fields in main data table */
	var fullData = data.map(function(d) {
		
		var s = su.get(d.idSupplier);
		d.supplier = (s) ? s["supplier"] : globals.UNKNOWN;
		d.supplierDetail = (s) ? s["supplierDetail"] : d.idSupplier;

		var dept = de.get(d.deptDe);
		d.dept = (dept) ? dept["dept" + sfx] : d.deptDe;
		d.fullDept = (dept) ? dept["fullDept" + sfx] : d.deptDe;

		var office = of.get(d.officeDe);
		d.office = (office) ? office["office" + sfx] : d.officeDe;
		d.fullOffice = (office) ? office["fullOffice" + sfx] : d.officeDe;

		var cat = ca.get(d.intCategory);
		d.fullCategory = (cat) ? cat["fullCategory" + sfx] : d.idCategory;

		return d;
	});

	return fullData;
};