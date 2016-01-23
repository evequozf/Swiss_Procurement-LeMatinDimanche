/***********************************************/
/*             DATASTORY D3 UTILS              */
/***********************************************/

//Requires d3.js !

//Define namespace ds with an initially empty list of properties
//see http://appendto.com/2010/10/how-good-c-habits-can-encourage-bad-javascript-habits-part-1/
ds = (function() {
	var properties = {};
	return properties;
})();

(function() {

	//Declare version
	ds.version = "0.2";

/************ Adding util - example prototype *****************/
/*
//(function() {  //leave out: only one is needed at beginning of file after ds declaration

	function util() {
		var height    = 10,
			container = d3.select("body"),
			that      = container.append("div"); //private
		
		my.container = function (value) {
			if (!arguments.length) return container;
	    	container = value;
	    	return my;
		}

		my.height = function (value) {
			if (!arguments.length) return height;
	    	height = value;
	    	return my;
		}
		
		function my() {
			//Create item, using 'height'
			if(that == null) {
				that = container.append("div");
			}
			that.attr("height");
		}
	}

	ds.util = util;

// })(); // leave out: only one is needed at the end of file
*/

/***************** Evalutation of value or function ***************//*
*/

	// Helper function, taking arbitrary number of parameters (p1, p2, p3, ...)
	// and return p1 ( p2, p3, ... ) if p1 is a function,
	// and the value of p1 otherwise	
	// read https://shifteleven.com/articles/2007/06/28/array-like-objects-in-javascript/
	function ds_eval() {
		if(!arguments.length) return null;
		var args = Array.prototype.slice.call(arguments);
		var p1 = args.shift();
		return ((typeof p1 === "function") ? p1.apply(this, args) : p1);
	}


/***************** Tooltip *********************//*

1. Easiest use: create the tooltip by binding to a selection, 
an set html for content change:

	var tt = ds.tooltip(selection);
  	tt.html(function(d) { return d.Nom + "<br>" + d.Altitude + "m"; });

2. Without binding to selection, you have to manually call listeners : 
attach the display of the tooltip to a selection of D3 elements 
by just setting the .html(). Warning: without binding a selection but
nevertheless using relative .x and .y, the call to show needs to provide the
"this" context of the element as third argument !

	var tt = ds.ttip();
  	selection
    	.on("mouseover", function(d,i) { tt.html(d.Something).show(d,i,this); })
    	.on("mouseout", tt.hide);

3. More complex example, building the structure of the tooltip beforehand, and setting
it to display on specific x,y positions relative to the SVG container's coordinate system
and not on event d3.event.pageX and d3.event.pageY (default) :

	function attachTooltip(selection) {
  
	  // Initialize tooltip and set variables for dynamic content
	  var tt    = ds.ttip(selection),
	      nom   = tt.content().append("div").attr("class","title"),
	      par   = tt.content().append("div").attr("class","parti"),
	      parI  = par.append("span").attr("class","filterPartiIcon"),
	      parN  = par.append("span"),
	      com   = tt.content().append("div");
	  
	  // Set tooltip position to be at the middle of this element
	  // shortcut for x(function, true) (true mean relative coordinates)
	  tt
    	.x(function(d){return x(d);})
    	.y(function(d){return y(d);})
    	.offsety(r);

	  // Update variables in tooltip without reselecting
	  tt.onShow(function(d,i) {
	    nom.html(d.Nom);
	    parI.style("background-color",color(d.Parti));
	    parNF.html(d.Parti);
	    com.html(d.Commune)
	  });
	  
	  // Bind to additional event
	  svg.on("click", tt.hide);    //touch screen -> hide on click elsewhere
	}

4. Easily create a default tooltip that shows all properties of the element being hovered
   by just calling ds.ttip(<selection>).table()



IMPORTANT WARNING

The value set by .html(...) has precedence over the value of .onShow(...).
Therefore, when the tooltip is shown, tt.html() is evaluated before 
and it replaces the whole HTML content. For example if you call:

	var tt = ds.tooltip(selection);
	var div = tt.content().append("div");
	tt.onShow(function(d) { div.text("Hello"); });
	tt.html("World");
	tt.show();

The tooltip will actually be just 

	<div class="tooltip">World</div>.

Therefore, to avoid bad surprises, use wether .html() or .onShow(), 
but not both simultaneously. Setting .html(null) effectively removes
execution of the .html() when showing the tooltip.

Also, different tooltips can be created for different d3 selection, e.g.:

	var tt1 = ds.tooltip( svg.selectAll("rect") );
  	tt1.html("I'm rect");

	var tt2 = ds.tooltip( svg.selectAll("circle") );
  	tt2.html("I'm circle and red").content().style("color","red");

-------------------------------

See function definition for further fields and functions.

*/

	function ttip(selection) {
		
		// Fields with default values
		var container = d3.select("body"),
			defclass  = "tooltip",
			defstyle  = "position: absolute; pointer-events: none;",
			that      = _init(),

			isAbsoluteX = true,
			isAbsoluteY = true,
			x         = function(d,i,context) { return d3.event.pageX; },
			y         = function(d,i,context) { return d3.event.pageY; },
			offsetx   = function(d,i,context) { return -that.node().getBoundingClientRect().width/2;},
			offsety   = function(d,i,context) { return 15;},
			
			onShow    = function() {},
			html      = null;

		// (Re-)Generate the tooltip in case content was removed by caller
		function my() {
			if((that == null) || (that.node().parentNode == null))
				that = _init();
			
			/*
			// Keep for debugging !
			// centrer le tooltip sur l'élément hoverisé:
			// -> marche bien mais demande d'avoir setté .x() et .y()
			// et d'appeler impérativement show(d,i,context)
			// avec context = le 'this' du svg survolé
			
			matrix = function(d,i,context) {
				return context.getScreenCTM()
		      		.translate(x(d,i,context), y(d,i,context));
			}
			_realX = function(d,i,context) {
		      return (window.pageXOffset + matrix(d,i,context).e + offsetx(d,i,context)) + "px";
		  	}
		  	_realY = function(d,i,context) {
		      return (window.pageYOffset + matrix(d,i,context).f + offsety(d,i,context))  + "px";
		  	}
		  	*/

		  	/* 
		  	// Keep for debugging ! 
		  	// Works for absolute x + y only. Kept for debug
		  	_realX = function(d,i) {
		      return x(d,i) + offsetx(d,i) + "px";
		  	}
		  	_realY = function(d,i) {
		      return y(d,i) + offsety(d,i) + "px";
		  	}
		  	*/
		}

		// Initialize by creating a div for this tooltip
		function _init() {
			return container.append("div").attr({"class":defclass,"style":defstyle});
		}

		// Functions that converts a given x and y in containers' coordinates
		// into absolute coordinates on the page, pageX and pageY.
		// see http://codepen.io/recursiev/pen/zpJxs
		function _matrix(d,i,context) {
			return context.getScreenCTM()
	    		.translate(ds_eval(x,d,i,context), ds_eval(y,d,i,context));
		}
		function _pageX(d,i,context) {
			return (window.pageXOffset + _matrix(d,i,context).e);
		};
		function _pageY(d,i,context) {
			return (window.pageYOffset + _matrix(d,i,context).f);
		};
		
		// Return real x and y. This is x + offset, in absolute screen coordinates.  	
	  	function _realX(d,i,context) {
	  		var s = 
	  			(!isAbsoluteX ? _pageX(d,i,context) : ds_eval(x,d,i,context))
	  			+ ds_eval(offsetx,d,i,context) 
	  			+ "px";
	  		return s;
	  	}
	  	function _realY(d,i,context) {
	  		var s = 
	  		(!isAbsoluteX ? _pageY(d,i,context) : ds_eval(y,d,i,context))
	  		 + ds_eval(offsety,d,i,context) 
	  		 + "px";
	  		return s;
	  	}

		// Getter/setters to use for x and y. isAbsolute must be set to true
		// if the value is absolute on the page (and not relative to parent)
		my.x = function(func, isAbsolute) {
			if (!arguments.length) return x;
			isAbsoluteX = (isAbsolute === 'undefined') ? false : isAbsolute;
	    	x = func;
	    	return my;
		}

		my.y = function(func, isAbsolute) {
			if (!arguments.length) return y;
	    	isAbsoluteY = (isAbsolute === 'undefined') ? false : isAbsolute;
	    	y = func;
	    	return my;
		}

		my.offsetx = function(func) {
			if (!arguments.length) return offsetx;
	    	offsetx = func;
	    	return my;
		}

		my.offsety = function(func) {
			if (!arguments.length) return offsety;
	    	offsety = func;
	    	return my;
		}

		// Returns a D3 selection with the contents of this
		my.content = function () {
			return that;
		}

		// Clears the content of this tooltip
		my.clear = function() {
			that.selectAll("*").remove();
			return my;
		}

		my.html = function(value) {
			if (!arguments.length) return html;
			html = value;
	    	return my;
		}

		// Easily create a default tooltip that shows all properties of the current element
		// by just calling ds.ttip(<selection>).table()
		my.table = function() {
			html = function(d) { 
				that.selectAll("*").remove();
				ds.table([d], that).create(); 
				return that.outerHTML;
			};
	    	return my;
		}

		my.onShow = function(func) {
			if (!arguments.length) return onShow;
	    	onShow = func;
	    	return my;
		}

		// Shows the tooltip
		my.show = function(d,i,context) {
			// Build or rebuild if destroyed
			my();  
			// First execute html, and set HTML
			var v = (typeof html === 'function') ? html(d,i,context) : html;
			if (v != null) that.html(v);
			// Then execute onShow
			if (typeof onShow === 'function') onShow(d,i,context);
			that
				.style("left", _realX(d,i,context))
				.style("top", _realY(d,i,context))
		    	.transition().duration(100).style("opacity", 1);
		  	return my;
		}

		// Hides the tooltip
		my.hide = function() {
			that.transition().duration(200).style("opacity", 0); 
			return my;
		}

		// Bind selection once and for all and register listeners.
		// (following code cannot be put in my(), otherwise never called...
		// is it good practice here ? FIXME ?)
		if(selection != null) {
			selection.on("mouseover",function(d,i) { my.show(d,i,this); });
			selection.on("mouseout",function(d,i) { my.hide(d,i,this); });
		}

		return my;
	}
	
	// Extend ds with defined function
	ds.tooltip = ttip;
	ds.ttip = ttip;



/***************** Responsive Resize *********************//*

Resize automatically the svg given in argument, on 'resize' and 'load' events.
Use start() to start listening to events, and stop() to stop. (These functions
actually add or remove event listeners...)

Create by calling ds.responsive(svgElement).onResize(foo)
The svgElement is a d3 selection that contains just a svg and
the foo function given as argument to onResize will be invoked whenever an update() takes place.
It is invoked with updated svgElement, initial width and initial height
of svg upon creation of the ds.responsive() :

	onResize(svgElement, initial_width, initial_height).

The update(event) function can also be called directly to force an update
outside of regular updates triggered by 'resize' and 'load' events.

Upon creation of the responsive object, it is automatically registered as event listener as follows:
	window.addEventListener('resize', ...);
	window.addEventListener('load', ...);

---------------------------
Minimal use case with callback : 
	
	function customResize(svg,initialSVGWidth,initialSVGHeight) {
  		// Make custom updates, given svg (resized) as a d3.selection
  		// and initial width and height as numbers
  		// ...
	}

	// Create the responsive wrapper and start it
	var rsp = ds.responsive(d3.select("svg"))
				.onResize(customResize)
				.start();

	// Stop listening to events
	rsp.stop();

---------------------------
*/

//TODO : add argument maxWidth (by default it is SVG initial size).
// todo : add argument minWidth 

	function responsive(svgElement) {
		
		var svg          = svgElement,
			w            = svg.attr("width"),
    		h            = svg.attr("height"),
			aspect       = w / h,
			//minWidth     = 0,
			//minHeight    = 0,
			init         = true,
			onResize     = null,
			events       = ['resize', 'load'],
			started      = false;

		my.update = function(event) {
			my();
		  	return my;
		}

		my.onResize = function(func) {
			if (!arguments.length) return onResize;
	    	onResize = func;
	    	return my;
		}

		/*
		my.events = function (value) {
			if (!arguments.length) return events;
			if(started) { 
				my.stop();
				events = value;
				my.start();
			} else {
				events = value;
			}
	    	return my;
		}
		*/

		my.start = function() {
			if(!started)
				for(var i=0; i<events.length; i++)
					window.addEventListener(events[i],my.update);
			started = true;
			return my;
		}

		my.stop = function() {
			if(started)
				for(var i=0; i<events.length; i++)
					window.removeEventListener(events[i],my.update);
			started = false;
			return my;
		}

		function my() {
			if(init) {
				svg.attr("viewBox","0 0 "+w+" "+h).attr("preserveAspectRatio","xMidYMid");
				init = false;
			}
			if(svg.node().parentNode == null) return; // to fix updates of not connected to DOM elements
			//console.log(svg.node());
			//console.log(svg.node().parentNode);
			//console.log(svg.node().parentNode == null);
			var targetWidth = svg.node().parentNode.offsetWidth;
		  	targetWidth = targetWidth < w ? targetWidth : w;
		  	var targetHeight = targetWidth / aspect;
		  	svg.attr("width", targetWidth);
		  	svg.attr("height", targetHeight);
		  	if (typeof onResize === 'function') onResize(svg,w,h);
		}

		return my;
	}

	ds.responsive = responsive;



/***************** Easy table creator *********************//*
// using code from Gregor Aisch http://bl.ocks.org/gka/17ee676dc59aa752b4e6
// http://vis4.net/blog/posts/making-html-tables-in-d3-doesnt-need-to-be-a-pain/

EXAMPLE USE (todo: update with more generic and different uses)

var columsSpec = [
    //{head: 'No', cl: '', html: ƒ('No')},
    {head: 'Id', cl: 'id', html: function(d) {
      return ('<a id="anchor' + d.No + '">' + d.Id +'</a>');
    }}, // internal anchor : onclick on circle -> transport in table
    {head: 'Libellé', cl: 'text', html: ƒ('Type')},
    {head: 'Charges 2015', cl: 'num', html: ƒ('Charges2015')},
    //{head: 'Revenus 2015', cl: 'num', html: ƒ('Revenus2015')},
    {head: 'Charges 2016', cl: 'num', html: ƒ('Charges2016')},
    //{head: 'Revenus 2016', cl: 'num', html: ƒ('Revenus2016')},
    {head: 'Charges 2017', cl: 'num', html: ƒ('Charges2017')},
    //{head: 'Revenus 2017', cl: 'num', html: ƒ('Revenus2017')},
    {head: 'Charges 2018', cl: 'num', html: ƒ('Charges2018')},
    //{head: 'Revenus 2018', cl: 'num', html: ƒ('Revenus2018')},
    {head: 'Total Charges', cl: 'num totalcharges', html: ƒ('TotalCharges')},
    //{head: 'Total Revenus', cl: 'num totalrevenus', html: ƒ('TotalRevenus')}
  ];
  
  ds.table(finances, d3.select("#table")).columnsSpecs(columsSpec).create();

*/

	function table(_data, _container) {

		var container = _container,
			table     = container.append("table"),
			data      = _data,
			columns   = null;

		my.create = function() {
			my();
			return my;
		}

		my.remove = function() {
			table.remove();
			return my;
		}
	    
		/*
		// Put enter / update / exit ?
		function enter() {

		}

		function update() {

		}

		function exit() {

		}
		*/

		// Set full spec of columns to be displayed. Format is a list of specs:
		// [ { head: 'Movie title', cl: 'title', html: function(d) { return d.title; } }, ... ]
		my.columnsSpecs = function(cols) {
			if (!arguments.length) return columns;
	    	columns = cols;
	    	return my;
		}

		// Set only fields names that should be displayed ['movie','year']
		// automatically set full spec with default accessor d['movie']
		// and empty class
		my.fields = function(fields) {
			columns = createColumnSpec(fields);
	    	return my;
		}

		function createColumnSpec(headers) {
			return headers.map(function(d) {
        			return { head: d, cl: "", html: function(g){ return g[d] } }
        		});
		}

        function my() {
        	// if columns not defined, set it automatically by taking key names of first entry
        	if (columns == null && data.length > 0) {
        		columns = createColumnSpec(d3.keys(data[0]));
        	}

			// create table header
		    table.append('thead').append('tr')
		        .selectAll('th')
		        .data(columns).enter()
		        .append('th')
		        .attr('class', function(d){ return d.cl; })
		        .text(function(d){ return d.head; });

		    // create table body
		    table.append('tbody')
		        .selectAll('tr')
		        .data(data).enter()
		        .append('tr')
		        .selectAll('td')
			        .data(function(row, i) {
			            return columns.map(function(c) {
			                // compute cell values for this specific row
			                var cell = {};
			                d3.keys(c).forEach(function(k) {
			                    cell[k] = typeof c[k] == 'function' ? c[k](row,i) : c[k];
			                });
			                return cell;
			            });	
			        }).enter()
			        .append('td')
			        .html(function(d){ return d.html; })
			        .attr('class', function(d){ return d.cl; });
		}

		return my;
	}

	// set in namespace
	ds.table = table;




/***************** Number formatting *********************//*

FIXME : needs to use locale by D3

*/
	function formatNumber(d) {
		return d3.format(",f")(d).replace(/,/g," ");	
	}

	ds.formatNumber = formatNumber;



})();




