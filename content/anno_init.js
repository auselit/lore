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


 


	//TODO: This eventually should be a shared function
	lore.ui.initModel = function ( theURL ) {
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
	
	//TODO: This eventually should be a shared function
	lore.ui.initViews = function ( theviews ) {
		for ( var i = 0; i< theviews.length; i++) {
			var v = theviews[i];
			if (typeof(v) == "function") {
				v( { annods: lore.anno.annods});
			} 
		}
	}
	
	
	lore.ui.initControllers = function () {
		var annosourcestreeroot = Ext.getCmp("annosourcestree").getRootNode();
		lore.anno.annods.on( { "update": {fn: lore.ui.anno.updateUIOnUpdate}, 
							   "load":{fn: lore.ui.anno.updateUI},
							   "remove":{fn: lore.ui.anno.updateUIOnRemove},
							   });
    }
	
	
	

	
	lore.ui.init = function(){
		try {
			lore.m_xps = new XPointerService();
			// TODO: this could be shared in common library
			// TODO: namespace should reflect components i.e lore.ui.initModel??
			
			window.top.getBrowser().selectedBrowser.contentWindow.location.href;
			lore.ui.currentURL = lore.util.getContentWindow().location.href;
			lore.ui.initModel(lore.ui.currentURL);
			lore.ui.initViews([lore.ui.anno.initGUI]);
			lore.ui.initControllers();
			
			
			// TODO:load preferences, shared code?
			try{
				window.parent.loreoverlay.loadAnnoPrefs();
    		} catch (ex){
        		alert(ex.toString());
    		}
	
			//TODO: could be shared code		
			if (window.parent.document.getElementById('oobAnnoContentBox')
			.getAttribute("collapsed") == "true") {
				lore.ui.lorevisible = false;
			} else {
				lore.ui.lorevisible = true;
			}
			
			
 			lore.ui.anno.initTimeline();
			
			lore.debug.anno("The uri is " + lore.ui.currentURL);
			if (lore.ui.currentURL && lore.ui.currentURL != '' &&
				lore.ui.currentURL != 'about:blank' &&
				lore.ui.lorevisible) {
				lore.debug.ui("Updating annotation source list");
				lore.debug.ui(lore.anno,lore.anno);
				lore.anno.updateAnnotationsSourceList(lore.ui.currentURL);
				lore.ui.loadedURL = lore.ui.currentURL; //TODO: this could be shared code
			}
									
			// TODO: the 'view' should call this function						
			lore.debug.anno("Annotation init");
		} catch (e ) {
			lore.debug.ui("Errors! " + e, e);
		}
	}
	
	Ext.EventManager.onDocumentReady(lore.ui.init);

