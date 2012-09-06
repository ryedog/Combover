 var Combover = {};


/**
 * Initialize Combover
 *
 */
(function(exports) {
	/*
	 * Stores helper callbacks
	 * @property-private
	 */
	var helpers = [];

	/*
	 * Stores helper callbacks
	 * @property-private
	 */
	var renders = [];
	
	/**
	 * Whether to display debug statements
	 */
	exports.debug 		= false;
	
	/**
	 * Array of all templates
	 */
	exports.templates 	= [];

	/**
	 *
	 * @param name
	 */
	exports.addHelper = function(name, fn) {
		helpers[name] = fn;
	}


	/**
	 *
	 * @param name
	 */	
	exports.addRenderer = function(name, fn) {
		renders[name] = fn;
	}
	
	/**
	 * Formats a number
	 * @param 
	 * @link {http://stackoverflow.com/questions/149055/how-can-i-format-numbers-as-money-in-javascript}
	 */
	function formatNumber(n, c, d, t){
		var c = isNaN(c = Math.abs(c)) ? 2 : c, 
			d = d == undefined ? "." : d, 
			t = t == undefined ? "," : t, 
			s = n < 0 ? "-" : "", 
			i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", 
			j = (j = i.length) > 3 ? j % 3 : 0;
			
		return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
	};	


	/**
	 *
	 *
	 * @param txt String
	 */
	function debug(m1, m2, m3) {
		if ( console && exports.debug )
			console.log(m1, m2, m3);
	}


	/**
	 * Gets a variables type
	 *   Array, Object, String, etc
	 *
	 * @param 
	 *
	 * @return String the object type
	 */
	function getType(object) {
		return Object.prototype.toString.call(object).match(/^\[object\s(.*)\]$/)[1];
	} 


	/**
	 * Determines if a variable is primitive
	 *
	 * @param data Mixed
	 *
	 * @return Boolean 
	 */
	function isPrimitive(data) {
		var type = typeof(data);
		
		switch ( typeof data ) {
			case 'boolean':
			case 'number':
			case 'string':
			case 'undefined':
			case null:
				return true;	
		}
		
		return false;
	}
	

	/**
	 * Just like Array.map but provides the current index
	 *
	 * @param arr Array
	 * @param callback Function
	 */
	function map(arr, callback) {
		
		switch (typeof arr) {
			case 'string':
			for ( var i=0; i<arr.length; i++ ) {
				if ( callback.call(this, arr[i], i) === false )
					return false;
			}
		}
		
		return true;
	}


	/**
	 * Gets the outerHtml for a JQuery object
	 *
	 * @param source JQuery 
	 *
	 * @return String
	 */		
	function oHtml(source) {
		return source.get(0).outerHTML;	
	}
		

	/**
	 * Parses the combs in the "comb" HTML attribute and
	 * returns an array of Combs which houses the member,
	 * attribute, renders & helpers
	 *
	 * @param txt String
	 * 
	 * @return Array of combs
	 */
	function parseCombs(txt) {
		debug('*** Being parseCombs: ' + txt );
		var matches, combs = [];
		if (txt )
			txt.split(/\s+/).map(function(item) {
		
				var comb = item.split('@');
					comb = {
						escape:		true,
						member:		comb[0],
						attribute: 	comb[1],
						renders:   	[],
						helpers: 	[]
					}
					
				// Shorthands - Remove & Parse them
				//-----------------------------------------
				var modifiers = comb.member.match(/^\W*/);
				map(modifiers[0], function(char) {
					
					if ( char == '<' )
						comb.escape = false;
					else if ( renders[char] )
						comb.renders.push( renders[char] )
					else if ( helpers[char] )
						comb.helpers.push( helpers[char] );
					
				});
				comb.member = comb.member.replace(/^\W*/, '') ;
					
				combs.push(comb);
			});
		debug('---- End parseCombs: ', combs);
		
		return combs;
	}


	/**
	 *
	 */	
	function hideComb(data, comb, is_direct) {
		var render = false;
		data = is_direct ? data : data[comb.member];
		
		comb.renders.map(function(fn) {
			if (! fn.call(this, data, comb.member) )
				render = true;
		})
		
		return render;	
	}


	/**
	 * Encodes text to HTML
	 *
	 * @param
	 *
	 * @return String the encode HTML
	 */
	function htmlEncode(value) {
		var el = document.createElement("div");
		el.innerText = el.textContent = value;
		return el.innerHTML;	
	}

	
	/**
	 *
	 */	
	function toHtml(data, comb, html) {
		
		// Apply Renders & Format Data
		//---------------------------------------
		if ( data == undefined )
			data = '';
			
		comb.helpers.map(function(fn) {
			data = fn.call(this, data);
		});
		
		if ( comb.escape )
			data = htmlEncode(data);
		
		// Get Text to replace
		//------------------------------
		var text = comb.attribute
				? html.attr( comb.attribute )
				: html.html();
		if ( text == undefined )
			text = '{.}';
		
		
		var source = html.clone();
		var val = text.replace('{.}', data);

		
		if ( comb.attribute )
			source.attr(comb.attribute, val)
		else
			source.html(val);
		
		return oHtml( source );	
	}


	/**
	 *
	 */	
	exports.compile = function(source) {
			// Initialize the source
		if ( typeof source == "string" )
				source = $(source);
		
		source = source.clone();
		debug('*** Compiling: ' + source.html());
		
		
		var template2 = new template(source);
		
		debug(template2.map);
			
		var container = {
			object: template2,
			renderer: template2.render.bind(template2),  
		};
		exports.templates.push( container );
		
		template2.combs = [{
			member: null,
			renders: []
		}]
		debug('*** End Compile\n\n\n');

		return container.renderer;	
	}

	
	/**
	 *
	 */	
	function template(source, inherit) { 

		// Members
		//-------------------------------------
		this.attr       = null;
		this.holder 	= null;
		this.children   = [];
		this.isNested   = source.children().length > 0;
		this.combs 		= parseCombs( source.attr('comb') );
		
		// Add Renderer
		//-------------------------------------
		source.removeAttr('comb');

		// Add inheritance
		if ( inherit ) {
			this.combs[0].renders.push(renders[inherit]);
			inherit = null;
		}
		
		if ( source.attr('render') ) {
			var renderer = source.attr('render');
			console.log('*** Renderer: ' + renderer);
			
			// Allow > in renderer to apply to all children
			if ( renderer[0] == '>' ) {
				renderer = renderer.substring(1);
				inherit = renderer;
			} else {
				this.combs[0].renders.push(renders[renderer]);
			}
		}
		
		
		this.source = source;

		
				
		// Handle Expression Markup
		//--------------------------------------
		if (! this.isNested ) {
			
			//this.source.html().
			
			if ( this.source.html().indexOf('{.}') == -1 )
				this.source.html('{.}');
		} 


		// Parse the source
		//-------------------------------------
		var self = this;
		
		(function parse(source) {
			source.children().each( function(index) {
				
				var o    = $(this),
				  comb = o.attr('comb');
				
				// comb (NO) - Continue down the DOM
				//-----------------------------------------
				if (! comb ) {
				  debug('*** sss' );
				  return parse( o );        
				}
				
				debug('*** Parsing Comb: ' + oHtml(o) );
				debug('*** Parsing Comb2: ' + oHtml(o) );
				debug(comb);
				var child = new template( o.clone(), inherit );
				//self.map[comb] = new Combover.template( o.clone() );
				
				
				child.holder = '{-{' + self.children.length + '}-}';
				self.children.push( child );
				
				o.replaceWith( child.holder );        
				
			})
		})(source);
		
		debug('*** Property: ' + this.property + ' ' + oHtml(this.source) );
	};
	
	
	/**
	 *
	 */
	template.prototype.renderComb = function(comb, data, source, is_direct) {
		
		// Figure out the value to render & type
		//------------------------------------------------
		var val = is_direct
			? data
			: data[comb.member];
		var type = getType( val );

		debug('--- RenderComb: ' + comb.member + ' ' + type, val, data);


		// Simple Rending
		//------------------------------------------------
		if (! this.isNested && isPrimitive(val) ) {			
			debug('    Simple ' + oHtml(source));

			return toHtml(val, comb, source);	
		}
		
		

		
		// Render Objects
		//------------------------------------------------
		var html = '';
		if ( type == 'Object' ) {
			
			debug('    Object ' + oHtml(source));
			html = oHtml( source );
			
			this.children.map(function(t) {
			  debug('    Child: ', t.combs);

			  html = html.replace(t.holder, t._render(val) );
			  debug('*** Partial HTML: ' + html);
			});
			debug('*** Final HTML: ' + html);
			return html;
		}
		
		
		// Render Arrays
		//------------------------------------------------
		if ( type == 'Array' ) {
			debug('    Array ' + oHtml(source));

			val.map(function(item){
				debug('   Array.Item: ', item);
				
				html += this.renderComb(comb, item, source, true);
			}, this);
			
			return html;
		}
				

		// Nested Primitives
		//-----------------------------------
			debug('    Nested Primitive ' + oHtml(source));
			html = oHtml( source );
			
			this.children.map(function(t) {
				debug('       Child: ', t.combs);

				html = html.replace(t.holder, t._render(data, false) );
				debug('       Partial HTML: ' + html);  
			});
			
			html = toHtml(val, comb, $(html));
			
			debug('      Final HTML: ' + html);
			return html;
	}


	/**
	 * Arrays filled w/ primitives are different
	 *
	 * they need to loop through all combs when iterating
	 * through each value. How do we handle this?
	 *
	 * Right now its hacked w/ a seperate function
	 *
	 * @temp perhaps return an array instead of string from renderComb
	 *       then just apply each additional comb to each element of of the array?
	 */
	template.prototype.renderArray = function(data, source) {
		debug('    RenderArray ' + oHtml(source));
		
		var html = ''
		var self = this;
		
		data.map(function(item){
			
			// Apply Render
			if ( hideComb(item, self.combs[0], true) ) {
				debug('*** Not Rendering', self.combs[0]);
				return;
			}			
			
			// Apply each comb
			var item_html = source;
			self.combs.map(function(comb) {
				item_html = $( self.renderComb(comb, item, $( item_html ), true) );
			});
			html += oHtml( item_html );
			
		});
		
		return html;		
	}


	/**
	 * Internal render, which is called for each template
	 * except for the first one (that's what .render is for)
	 *
	 * @param 
	 *
	 * @return String the html to render
	 */
	template.prototype._render = function(data) {


		var html = this.source;
		
		// Handle Arrays
		//
		// @temp currently not sure how to handle Arrays filled w/ primities
		//------------------------------------------------
		if ( data[ this.combs[0].member ] instanceof Array )
			return this.renderArray( data[ this.combs[0].member ], html );
		
		
		
		// All other types
		//--------------------------------------------------
		// Apply Renders
		if ( hideComb(data, this.combs[0]) ) {
			debug('*** Not Rendering', this.combs[0]);
			return '';
		}
				
		
		this.combs.map(function(comb) {
			debug('*** _Render: ' + comb.member + ( comb.attribute ? '@' + comb.attribute : ''));
			
			html = comb.attribute
				? toHtml( data[comb.member], comb, $(html) )
				: this.renderComb(comb, data, $(html));
		}, this);
		
		return html;
	}	


	/**
	 * Method called to render the root template
	 *
	 * @param 
	 *
	 * @return String the html to render
	 */
	template.prototype.render = function(data) {
		
		var html = this.source.html();
		debug('*** Render ' + html);
	
		this.children.map(function(t) {
			debug('    Child: ', t.combs);
			html = html.replace(t.holder, t._render(data) );
		});
		
		return html;
	}


	//---------------------------------------------------------------------------------------------------------------------
	// Initialize
	//---------------------------------------------------------------------------------------------------------------------
	exports.addHelper('^', function(val) 	{	return new String(val).toUpperCase();			});
	exports.addHelper('$', function(val) 	{	return '$' + formatNumber(val, 2);				});
	exports.addHelper('%', function(val) 	{	return formatNumber(val*100, 0)	+ '%'			});
	exports.addHelper('#', function(val) 	{	return formatNumber(val, 2)						});
	exports.addHelper(',', function(val) 	{	return formatNumber(val, 0)						});
	
	exports.addRenderer('!', function(val) 	{	return val != '' && val != null && val != undefined && val != false;	});
	exports.addRenderer('?', function(val) 	{	return val !== undefined												});
	

})(Combover);