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


lore.anno.ui.RDFaManager = Ext.extend(Ext.util.Observable, {
	
	constructor:function (config) {
		this.page = config.page;
		this.addEvents('rdfaloaded');
	},

	load: function (contentWindow ){
		// add check for store, and get cached RDFA
		if (!this.page.rdfa.triples) {
			this.gleanRDFa(contentWindow.document);
			this.fireEvent('rdfaloaded');
		}
	},
	
	gleanRDFa : function (doc) {	
		try {
			var myrdf = $('body', doc).rdfa();
			lore.debug.anno("rdfa for the page...", myrdf.databank.triples());
			this.page.rdfa = {
				triples: myrdf.databank.triples(),
				rdf: myrdf
			};
			
	 		lore.debug.anno('glean rdfa: ' + this.page.rdfa, this.page.rdfa);		
		}catch (e) {
			lore.debug.anno("Error gleaning potential rdfa from page: " +e , e);
		}
	},
	
	isRDFaEnabled : function (doc) {
		var enabled = false;
		if (doc.doctype) {
			lore.debug.anno ("Document: " +  doc.doctype.name + doc.doctype.publicId + doc.doctype.systemId );
			enabled = doc.doctype.publicId == "-//W3C//DTD HTML4+RDFa 1.0//EN" || doc.doctype.publicId == "-//W3C//DTD XHTML+RDFa 1.0//EN";
	    }
		return enabled;
	}
});

