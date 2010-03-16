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
 * Class wrapper for an RDF annotation provides access to values modified from
 * dannotate.js
 * @class lore.anno.Preferences
 * @param {Node} rdf Root element of an RDF annotation returned by Danno
 * @param {boolean} bodyOps Optional parameter specifying RDF was loaded from file
 */
lore.anno.Preferences = Ext.extend(Ext.util.Observable, {

	constructor: function (config) {
		this.prefsObj = config.prefObj;
		this.addEvents('prefs_changed');
		this.setPrefs(config);
		this.prefsObj.on('annoprefs_changed', this.setPrefs, this);
	},
	
	setPrefs: function (args) {
		try {
			lore.debug.anno("lore.anno.Preferences:setPrefs", args);
			Ext.apply(this, args);
			this.mode = args.mode ? lore.constants.ANNOMODE_SCHOLARLY: lore.constants.ANNOMODE_NORMAL;
			this.fireEvent('prefs_changed', this);
		} catch(e) {
			lore.debug.anno(e,e);
		}	
	},
	
	load: function () {
		try{
			this.prefsObj.loadAnnotationPrefs();
    	} catch (ex){
        	lore.debug.anno("Error loading annotation preferences: " + ex, ex);
    	}
	},
	
	destructor: function () {
		this.prefsObj.un('annoprefs_changed', this.setPrefs, this);
	}
	
});
