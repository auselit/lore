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
     * @namespace
     * @name lore.global.ui 
	 */
	ui = {};
	
	Components.utils.import("resource://lore/debug.js");
	Components.utils.import("resource://lore/util.js");
	
	// TODO: global logging ( in addition to the logging for each view)
	// log to a log4j file 
	// log4j built-in xpc thing in firefox
	// handy if users experience problems they can send log file in an email
	
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
		ui.compoundObjectView.unregisterView();
		ui.annotationView.unregisterView();
        
		
		ui.load(win, instId, true);
		//win.annographiframe.location.reload(true);
		//win.graphiframe.location.reload(true);
	}
	/**
     * @param {} win
     * @param {} instId
     * @param {} reload
	 */
	ui.load = function (win, instId, reload) {
		var iframe1 = win.document.getElementById("annographiframe");
		
		iframe1.addEventListener("load", function onLoadTrigger(event){
			iframe1.removeEventListener("load", onLoadTrigger, true);
			iframe1.contentWindow.instanceId = instId; 
		}, true);
		if (reload) {
			win.annographiframe.location.reload(true);
		}
		else {
			iframe1.setAttribute("src", "chrome://lore/content/annotations/loreui_anno.html");
		}

		var iframe2 = win.document.getElementById("graphiframe");
		iframe2.addEventListener("load", function onLoadTrigger(event){
			iframe2.removeEventListener("load", onLoadTrigger, true);
			iframe2.contentWindow.instanceId = instId;
		}, true);
		if (reload) {
			win.graphiframe.location.reload(true);
		}
		else {
			iframe2.setAttribute("src", "chrome://lore/content/compound_objects/loreui_ore.html");
		}
	}
	
	/**
	 * Clear nodes all children from a tree node recursively
	 * @param {Ext.tree.TreeNode} treeRoot The tree node to clear
	 */
	ui.clearTree = function(treeRoot){
		while (treeRoot.firstChild) {
			treeRoot.removeChild(treeRoot.firstChild);
		}
	}
	/**
	 * Set up scripts for image selection etc when a page loads in the browser
	 * @param {} contextURL
	 */
	ui.locationLoaded = function(contextURL, win){
		/*var doc = util.getContentWindow().document;
		
		 if (contextURL.match(".jpg")){ // temporary hack to test
		
		 //if doc contains any images and it has not already been injected, inject image annotation script
		
		 util.injectScript("content/lib/ext/adapter/jquery/jquery-1.3.2.min.js",win);
		
		 util.injectScript("content/lib/jquery.imgareaselect-0.8.min.js",win);
		
		 var imgscript = "$('img').imgAreaSelect({onSelectEnd: function(){alert('image region selected');},handles:'corners'});";
		
		 var hidden = doc.createElement("div");
		
		 var script = doc.createElement("script");
		
		 script.type = "text/javascript";
		
		 script.innerHTML = imgscript;
		
		 var body = doc.getElementsByTagName("body")[0];
		
		 if (body){
		
		 body.appendChild(script);
		
		 body.appendChild(hidden);
		
		 }
		
		 }*/
		
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
     * @param {} srcObj
     * @param {} name
     * @return {}
	 */
	function createWrapper(srcObj, name, pre, post) {
			var wrapper = { _real: srcObj, _pre: pre, _post: post};
			for ( x in srcObj) {
				if ( typeof(srcObj[x]) == 'function' ) {
					wrapper[x] = eval('function(){'+
						// would need to chain argument values for _pre
						// if (this._pre) { for ( var i =0; i < this._pre.length; i++) { this._pre[i].apply(this._real, arguments); }} 
						//'debug.ui("' + name + '.' + x + ' args:" + arguments, arguments);' +
						'return this._real["' + x + '"].apply(this._real,arguments);' +
						// // if (this._post) { for ( var i =0; i < this._pre.length; i++) { this._pre[i].apply(this._real, arguments); }}
						// would need to chain return values for _post
							'}');
				}
			}
			return wrapper;
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
		
			this.loaded = function(instId){
				return this.views[instId] != null;
			};
			
			this.registerView = function(view, instId){
				this.views[instId] = createWrapper(view, this.name);
			};
			
			this.unregisterView = function(view){
				if (!view) {
					for (x in this.views) {
						if (this.views[x].uninit) {
							this.views[x].uninit();
						}
					}
					this.views = {};
				}
				else {
				//TODO:		
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
        
	
	
	
	