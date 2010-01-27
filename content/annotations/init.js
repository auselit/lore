/*
 * Copyright (C) 2008 - 2009 School of Information Technology and Electrical
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
 * @include  "/oaiorebuilder/content/annotations.js"
 * @include  "/oaiorebuilder/content/uiglobal.js"
 * @include  "/oaiorebuilder/content/debug.js"
 * @include  "/oaiorebuilder/content/annotations/annotations_view_init.js"
 */

/**
 * Annotations View
 * @singleton
 * @class lore.anno.ui
 */
/**
 * @property extension 
 * Reference to the Extension
 */
lore.anno.ui.extension = Components.classes["@mozilla.org/extensions/manager;1"]
		.getService(Components.interfaces.nsIExtensionManager)
		.getInstallLocation(lore.constants.EXTENSION_ID)
		.getItemLocation(lore.constants.EXTENSION_ID);



	/**
	 * Initialize the annotations model and view. Registering the view and loading
	 * the annotations for the current page if the annotations view is visible
	 */
	lore.anno.ui.init = function(){
		try {

			lore.anno.ui.topView = lore.global.ui.topWindowView.get(window.instanceId);
			lore.anno.ui.currentURL = lore.global.util.getContentWindow(window).location.href;
			lore.anno.initModel(lore.anno.ui.currentURL);
			lore.anno.ui.initGUI({ annods: lore.anno.annods});
			lore.anno.ui.initModelHandlers();
			
			lore.anno.ui.lorevisible = lore.anno.ui.topView.annotationsVisible();
			
 			lore.anno.ui.initTimeline();

			lore.global.ui.annotationView.registerView(lore.anno.ui, window.instanceId);
			
			try{
				lore.anno.ui.topView.loadAnnotationPrefs();
    		} catch (ex){
        		lore.debug.anno("Error loading annotation preferences: " + ex, ex);
    		}
			
			lore.anno.ui.initialized = true;
			if (lore.anno.ui.currentURL && lore.anno.ui.currentURL != '' &&
				lore.anno.ui.currentURL != 'about:blank' &&
				lore.anno.ui.lorevisible) {
				lore.debug.anno("anno init: updating sources");
				lore.anno.ui.handleLocationChange(lore.anno.ui.currentURL);
				//lore.anno.ui.loadedURL = lore.anno.ui.currentURL; //TODO: this could be shared code
			}

			lore.debug.anno("Annotation init");
		} catch (e ) {
			lore.debug.ui("Except in anno init ! " + e, e);
		}
	}
	
	/**
	 * Destroy any objects and undo any changes made to the current content window
	 */
	lore.anno.ui.uninit = function () {
		lore.anno.ui.hideMarker(); 
	}

