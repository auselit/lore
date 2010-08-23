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

	var EXPORTED_SYMBOLS = ['ui'];	
	/**
     * @singleton
     * @class lore.global.ui 
	 */
	ui = {};
	
	Components.utils.import("resource://lore/debug.js");
	Components.utils.import("resource://lore/util.js");
	
	/**
	 * Display an informational message to the user
	 * @param {String} message The message to display
	 */
	ui.loreInfo = function(message){
	};
	
	/**
	 * Display an warning message to the user
	 * @param {String} message The message to display
	 */
	ui.loreWarning = function(message){
	};
	/**
	 * Display an error message to the user
	 * @param {String} message The message to display
	 */
	ui.loreError = function(message){
	};
	/**
     * @param {} win
     * @param {} instId
	 */
	ui.reset = function (win, instId ) {
		try {
			ui.compoundObjectView.unregisterView();
        } catch (e1) {
            debug.ui ("error unregistering coview: " + e1,e1);
        }
        try {    
			ui.annotationView.unregisterView();
        } catch (e2) {
            debug.ui("error unregistering annoview: " + e2,e2);
        }
        try {
			ui.load(win, instId, true);
		} catch (e3) {
			debug.ui ("error loading ui on reset: " + e3,e3);
		}
	}
	
	ui.resetAnnotations = function ( win, instId ) {
		 try {    
			ui.annotationView.unregisterView();
        } catch (e2) {
            debug.ui("error unregistering annoview: " + e2,e2);
        }
        try {
			ui.loadAnnotations(win, instId, true);
		} catch (e3) {
			debug.ui ("error loading ui on reset: " + e3,e3);
		}
	}
	
	ui.resetCompoundObjects = function ( win, instId ) {
		try {
			ui.compoundObjectView.unregisterView();
        } catch (e1) {
            debug.ui ("error unregistering coview: " + e1,e1);
        }
        try {
			ui.loadCompoundObjects(win, instId, true);
		} catch (e3) {
			debug.ui ("error loading ui on reset: " + e3,e3);
		}
	}
	
	ui.loadAnnotations  = function ( win, instId, reload ) {
		var iframe1 = win.document.getElementById("annographiframe");
		
		iframe1.addEventListener("load", function onLoadTrigger(event){
			iframe1.removeEventListener("load", onLoadTrigger, true);
			iframe1.contentWindow.instanceId = instId;
            iframe1.contentWindow.lore.anno.ui.init();
		}, true);
		if (reload) {
			win.annographiframe.location.reload(true);
		}
		else {
			iframe1.setAttribute("src", "chrome://lore/content/annotations/loreui_anno.html");
		}
	}
	
	ui.loadCompoundObjects = function ( win, instId, reload ) {
		var iframe2 = win.document.getElementById("graphiframe");
		iframe2.addEventListener("load", function onLoadTrigger(event){
        	iframe2.removeEventListener("load", onLoadTrigger, true);
            iframe2.contentWindow.instanceId = instId;
            iframe2.contentWindow.lore.ore.ui.init();
		}, true);
		if (reload) {
			win.graphiframe.location.reload(true);
		}
	    else {
		    iframe2.setAttribute("src", "chrome://lore/content/compound_objects/loreui_ore.html");
	    }
	}
	/**
     * @param {} win
     * @param {} instId
     * @param {} reload
	 */
	ui.load = function (win, instId, reload) {
		ui.loadAnnotations(win, instId, reload );
        ui.loadCompoundObjects(win, instId, reload);
	}
	
	/**
	 * Called just before the browser window is closed
	 */
	ui.onClose = function (window, instId) {
		var annoView = ui.annotationView.get(instId);
		if (!annoView) {
			lore.debug.anno("in ui.onClose, unable to get annoView", {annotationView:ui.annotationView});
			return;
		}
		if (annoView.hasModifiedAnnotations()) {
			if (window.confirm("Click 'Ok' to save changes to modified annotations.")) {
				annoView.handleSaveAllAnnotationChanges();
			}
		}
	}
	
	/**
	 * Called as the window is unloading, just before it disappears
	 */
	ui.onUnLoad = function(window, instId) {
		try {
			ui.annotationView.unregisterView(instId);
			ui.compoundObjectView.unregisterView(instId);
			ui.topWindowView.unregisterView(instId);
		} catch (e) {
			debug.ui('ui.onUnLoad(window, instId)', e);
		}
	}

	ui.setCurrentURL = function (instance,url) {
		if ( !ui.currentURLs )
			ui.currentURLs = {};
		ui.currentURLs[instance] = url;
	}
	
	ui.getCurrentURL = function (instance) {
		return ui.currentURLs ? ui.currentURLs[instance]: null;
	}
	/**
     * @return {}
    */
    ui.genInstanceID = function () {
        if ( !ui.genInstanceID.counter) {
            ui.genInstanceID.counter = 1;
        } else {
            ui.genInstanceID.counter++;
        }
        return ui.genInstanceID.counter;
    }
	
	/**
	 * UI View 
	 * The intention is that the views are never directly accesses via their iframes
	 * by other view/overlay code
     * @param {} args
	 */
		function Views(args){

			this.name = args.name;
			this.views = {};
			this.events = {};
		
			this.loaded = function(instId){
				return this.views[instId] != null;
			};
			
			this.onload = function(instId, callback) {
				
				if ( !this.events[instId] )
					this.events[instId] = [callback];
				else
					this.events[instId].push(callback);
			}			
			
			this.registerView = function(view, instId){
				this.views[instId] = util.createWrapper(view, this.name);
				var e = this.events[instId];
				if ( e && e.length > 0) {
					for ( var i =0; i < e.length; i++) {
						e[i](instId);
					}
				}
				this.events[instId] = null;
			};
			
			this.unregisterView = function(instId){
				if (!instId) {
					for (x in this.views) {
						if (this.views[x].uninit) {
							this.views[x].uninit();
						}
					}
					this.views = {};
				}
				else {
					try {
						if (this.views[instId].uninit) {
								this.views[instId].uninit();
						}
					} catch (e) {
						debug.ui('unregisterView(' + instId + ')', e);
					}
					delete this.views[instId];
					delete this.events[instId];		
				}
			};
			
			this.get = function(instId){
				return this.views[instId];
			};
		}
		
		
		ui.compoundObjectView = new Views({
			name: 'coView'
		});
		ui.annotationView = new Views({
			name: 'annoView'
		});
		ui.topWindowView = new Views({
			name: 'topView'
		});
        
	
	
	
	