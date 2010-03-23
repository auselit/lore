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

lore.anno.ui.PageData = Ext.extend(Ext.util.Observable, {
    
   /** @constructor */
    constructor: function (config){
		this.model = config.model;
		this.clear();
		this.addEvents("annochanged");
	},
		
	store : function(url){
		var update_ds = {
			multiSelAnno: this.multiSelAnno.slice(),
			colourForOwner: lore.global.util.clone(this.colourForOwner),
			colourCount: this.colourCount,
			curSelAnnoId: this.curSelAnno ? this.curSelAnno.data.id : null,
			curAnnoMarkers: this.curAnnoMarkers.slice(),
			curImage: this.curImage,
			rdfa: lore.global.util.clone(this.rdfa),
			metaSelections: this.metaSelections.slice(),
		};
		
		lore.global.store.set(lore.constants.HIGHLIGHT_STORE, update_ds, url);
	},
	
	clear : function () {
		this.multiSelAnno = new Array();
		this.colourForOwner = {};
		this.colourCount = 0;
		this.curSelAnno;
		this.curAnnoMarkers = new Array();
		this.rdfa = {};
		this.metaSelections = [];
	},
	
	load : function(url, clear){
		lore.debug.anno(this.model, {
			t: this,
			m: this.model
		});
		var ds = lore.global.store.get(lore.constants.HIGHLIGHT_STORE, url);
		if (ds) {
			this.multiSelAnno = ds.multiSelAnno;
			this.colourForOwner = ds.colourForOwner;
			this.colourCount = ds.colourCount
			var curSelAnnoId = ds.curSelAnnoId;
			this.curAnnoMarkers = ds.curAnnoMarkers;
			this.curImage = ds.curImage;
			this.rdfa = ds.rdfa;
			this.metaSelections = ds.metaSelections;
			
			//TODO: should find unsaved version first?
			var rec = lore.global.util.findRecordById(this.model, curSelAnnoId);
			if (rec) {
				this.curSelAnno = rec;
			}
		} else if ( clear)
			this.clear();
	},
	
	/**
	 * Store the annotation that is currently selected in the view
	 * @param {Record} rec Record Currently selected annotation
	 */
	setCurrentAnno : function(rec, store){
		lore.debug.anno("setCurrentAnno(): ", {r:rec, s:store});
		var old = this.curSelAnno;
		this.curSelAnno = rec;
		this.curSelAnnoStore = store;
		this.fireEvent("annochanged", old, this.curSelAnno );
	},
	
	getCurrentAnno : function(){
		return this.curSelAnno;
	}
 
});