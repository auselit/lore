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

/*
 * @include  "/oaiorebuilder/content/annotations/annotations.js"
 * @include  "/oaiorebuilder/content/debug.js"
 * @include  "/oaiorebuilder/content/util.js"
 */

lore.anno.ui.PageView = function (pagedata, model) {
			
			this.page = pagedata;
			this.model = model;	
			this.model.on('load', this.handleLoad, this);
			this.model.on('remove', this.handleRemove, this);	
			this.model.on('update', this.handleUpdate, this);
		}
		
		lore.anno.ui.PageView.prototype = {
			tog : function () {
				if (this.page.multiSelAnno.length > 0) {
					// hide then reshow 
					lore.anno.ui.toggleAllAnnotations();
					lore.anno.ui.toggleAllAnnotations();
				}
			},
			
			handleLoad: function(store, records, options) {
				this.tog();
			},
			
			handleRemove: function(store, rec, ind) {
				this.tog();
			},
			
			handleUpdate: function(store, rec, operation) {
				try {
					lore.debug.anno("PageView:handleUpdate()", store);
					lore.anno.ui.hideMarker();
					lore.anno.ui.highlightCurrentAnnotation(rec);
				} catch (e) {
					lore.debug.anno("PageView:handleUpdate() - " + e, e);
				}
			}
}