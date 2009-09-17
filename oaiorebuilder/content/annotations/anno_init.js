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

// Reference to the Extension
lore.ui.extension = Components.classes["@mozilla.org/extensions/manager;1"]
		.getService(Components.interfaces.nsIExtensionManager)
		.getInstallLocation(lore.constants.EXTENSION_ID)
		.getItemLocation(lore.constants.EXTENSION_ID);

	//TODO: This eventually should be a shared function and moved outta here into the model
	
	lore.anno.initModel = function ( theURL ) {
		lore.anno.annods = lore.store.create(lore.anno.ANNOTATIONS_STORE,
		new Ext.data.JsonStore({
									fields: [
										{name: 'created'}, 
										{name: 'creator'}, 
										{name: 'title'}, 
										{name: 'body'}, 
										{name: 'modified'}, 
										{name: 'type'}, 
										{name: 'lang'},
                                        {name: 'resource'},
                                        {name: 'id'},
                                        {name: 'context'},
                                        {name: 'isReply'},
                                        {name: 'bodyURL'},
                                        {name: 'about'},
                                        {name: 'original'},
                                        {name: 'variant'},
                                        {name: 'originalcontext'},
                                        {name: 'variantcontext'},
                                        {name: 'variationagent'},
                                        {name: 'variationplace'},
                                        {name: 'variationdate'},
                                        {name: 'tags'}
                                        ],
									data: {}
								}), theURL);
		
	}
	
	lore.ui.anno.initModelHandlers = function () {
		var annosourcestreeroot = Ext.getCmp("annosourcestree").getRootNode();
		lore.anno.annods.on( { "update": {fn: lore.ui.anno.updateUIOnUpdate}, 
							   "load":{fn: lore.ui.anno.updateUI},
							   "remove":{fn: lore.ui.anno.updateUIOnRemove},
							   "clear": {fn: lore.ui.anno.updateUIOnClear}
							   });
    }
	
	lore.ui.anno.init = function(){
		try {
			lore.m_xps = new XPointerService();
			// TODO: some of this code could be shared in common library

			lore.ui.currentURL = lore.util.getContentWindow().location.href;
			lore.anno.initModel(lore.ui.currentURL);
			lore.ui.anno.initGUI({ annods: lore.anno.annods});
			lore.ui.anno.initModelHandlers();
			
			lore.ui.lorevisible = lore.ui.global.topWindowView.annotationsVisible();
			
 			lore.ui.anno.initTimeline();

			lore.ui.global.annotationView.registerView(lore.ui.anno);
			// TODO:load preferences, shared code?
			try{
				lore.ui.global.topWindowView.loadAnnotationPrefs();
    		} catch (ex){
        		lore.debug.anno("Error loading annotation preferences: " + ex, ex);
    		}
			
			if (lore.ui.currentURL && lore.ui.currentURL != '' &&
				lore.ui.currentURL != 'about:blank' &&
				lore.ui.lorevisible) {
				lore.debug.anno("anno init: updating sources");
				lore.anno.updateAnnotationsSourceList(lore.ui.currentURL);
				lore.ui.loadedURL = lore.ui.currentURL; //TODO: this could be shared code
			}
			lore.ui.initialized = true;
									
			// TODO: the 'view' should call this function						
			lore.debug.anno("Annotation init");
		} catch (e ) {
			lore.debug.ui("Except in anno init ! " + e, e);
		}
	}
	
	lore.ui.anno.uninit = function () {
		lore.ui.anno.hideMarker(); 
	}
	
	Ext.EventManager.onDocumentReady(lore.ui.anno.init);

