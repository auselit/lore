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
lore.anno.ui.extension = Components.classes["@mozilla.org/extensions/manager;1"]
		.getService(Components.interfaces.nsIExtensionManager)
		.getInstallLocation(lore.constants.EXTENSION_ID)
		.getItemLocation(lore.constants.EXTENSION_ID);

	//TODO: This eventually should be a shared function and moved outta here into the model
	
	lore.anno.initModel = function ( theURL ) {
		lore.anno.annods = lore.global.store.create(lore.constants.ANNOTATIONS_STORE,
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
	
	lore.anno.ui.initModelHandlers = function () {
		var annosourcestreeroot = Ext.getCmp("annosourcestree").getRootNode();
		lore.anno.annods.on( { "update": {fn: lore.anno.ui.updateUIOnUpdate}, 
							   "load":{fn: lore.anno.ui.updateUI},
							   "remove":{fn: lore.anno.ui.updateUIOnRemove},
							   "clear": {fn: lore.anno.ui.updateUIOnClear}
							   });
    }
	
	lore.anno.ui.init = function(){
		try {
			lore.global.util.setXPointerService(new XPointerService());
			// TODO: some of this code could be shared in common library
			
			lore.anno.ui.topView = lore.global.ui.topWindowView.get(window.instanceId);
			lore.anno.ui.currentURL = lore.global.util.getContentWindow(window).location.href;
			lore.anno.initModel(lore.anno.ui.currentURL);
			lore.anno.ui.initGUI({ annods: lore.anno.annods});
			lore.anno.ui.initModelHandlers();
			
			lore.anno.ui.lorevisible = lore.anno.ui.topView.annotationsVisible();
			
 			lore.anno.ui.initTimeline();

			lore.global.ui.annotationView.registerView(lore.anno.ui, window.instanceId);
			// TODO:load preferences, shared code?
			try{
				lore.anno.ui.topView.loadAnnotationPrefs();
    		} catch (ex){
        		lore.debug.anno("Error loading annotation preferences: " + ex, ex);
    		}
			
			if (lore.anno.ui.currentURL && lore.anno.ui.currentURL != '' &&
				lore.anno.ui.currentURL != 'about:blank' &&
				lore.anno.ui.lorevisible) {
				lore.debug.anno("anno init: updating sources");
				lore.anno.updateAnnotationsSourceList(lore.anno.ui.currentURL, function (result, resultMsg) {
					if (result == 'fail') {
						lore.anno.ui.loreError("Failure loading annotations for page.");
					}
				});
				lore.anno.ui.loadedURL = lore.anno.ui.currentURL; //TODO: this could be shared code
			}
			lore.anno.ui.initialized = true;
									
			// TODO: the 'view' should call this function						
			lore.debug.anno("Annotation init");
		} catch (e ) {
			lore.debug.ui("Except in anno init ! " + e, e);
		}
	}
	
	lore.anno.ui.uninit = function () {
		lore.anno.ui.hideMarker(); 
	}
	
	Ext.EventManager.onDocumentReady(lore.anno.ui.init);

