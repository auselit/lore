/*
 * Copyright (C) 2008 - 2010 School of Information Technology and Electrical
 * Engineering, University of Queensland (www.itee.uq.edu.au).
 * 
 * This file is part of LORE. LORE was developed as part of the Aus-e-Lit
 * project.
 * 
 * LORE is free software: you can redistribute it and/or modify it under the
 * terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version.
 * 
 * LORE is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along with
 * LORE. If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Object which manages retrieving RDFa from a page
 * @param {Object} config
 * @class lore.anno.ui.RDFaManager
 * @extends Ext.util.Observable
 */
lore.anno.ui.RDFaManager = Ext.extend(Ext.util.Observable, {
	
	/**
	 * @constructor
	 * @param {Object} config
	 * page: The current page
	 */
	constructor:function (config) {
		this.page = config.page;
		this.addEvents('rdfaloaded');
	},

	/**
	 * Load the RDFa for the page
	 * Fires 'rdfaloaded' event.
	 * @param {Object} contentWindow
	 */
	load: function (contentWindow ){
		// TODO: add check for store, and get cached RDFA
		if (!this.page.rdfa.triples) {
			this.gleanRDFa(contentWindow.document);
			this.fireEvent('rdfaloaded');
		}
	},
	
	/**
	 * Retrieve RDFa from a page and
	 * store it in the PageData object
	 * @param {Object} doc
	 */
	gleanRDFa : function (doc) {	
		try {
			var myrdf = $('body', doc).rdfa();
			
			this.page.rdfa = {
				triples: myrdf.databank.triples(),
				rdf: myrdf
			};
			
	 		lore.debug.anno('gleanRDFa: ' + this.page.rdfa, this.page.rdfa);		
		}catch (e) {
			lore.debug.anno("Error gleaning potential rdfa from page: " +e , e);
		}
	}
	
	// current not used
	/*isRDFaEnabled : function (doc) {
		var enabled = false;
		if (doc.doctype) {
			enabled = doc.doctype.publicId == "-//W3C//DTD HTML4+RDFa 1.0//EN" || doc.doctype.publicId == "-//W3C//DTD XHTML+RDFa 1.0//EN";
	    }
		return enabled;
	}*/
});

