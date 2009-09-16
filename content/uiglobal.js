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

	var EXPORTED_SYMBOLS = ['global'];
	
	global = {};
	
	/*
	 * TODO: This is temporary until lore.debug is imported as a shared js module
	 */
	FBTrace = Components.classes["@joehewitt.com/firebug-trace-service;1"]
        .getService(Components.interfaces.nsISupports)
        .wrappedJSObject
        .getTracer("extensions.lore");
            
	// TODO: global logging ( in addition to the logging for each view)
	// log to a log4j file instead of firebug window??
	// log4j built-in xpc thing in firefox
	// handy if users experience problems they can send log file in an email
	
	/**
	 * Display an informational message in the status bar
	 *
	 * @param {}
	 *            message The message to display
	 */
	global.loreInfo = function(message){
	}
	
	/**
	 * Display an warning message in the status bar
	 *
	 * @param {}
	 *            message The message to display
	 */
	global.loreWarning = function(message){
	}
	/**
	 * Display an error message in the status bar
	 *
	 * @param {}
	 *            message The message to display
	 */
	global.loreError = function(message){
	}
	
	global.reset = function (win ) {
		win.annographiframe.lore.ui.anno.hideMarker(); //TODO:change
		global.compoundObjectView.unregisterView();
		global.annotationView.unregisterView();
		
		win.annographiframe.location.reload(true);
		win.graphiframe.location.reload(true);
	}
	
	global.load = function (win) {
		win.document.getElementById("annographiframe").setAttribute("src", "chrome://lore/content/annotations/loreui_anno.html");
        win.document.getElementById("graphiframe").setAttribute("src", "chrome://lore/content/compound_objects/loreui.html");
	}
	
	/**
	 * Clear nodes from sources tree
	 *
	 * @param {Object} theTree The tree node to clear
	 */
	global.clearTree = function(treeRoot){
		while (treeRoot.firstChild) {
			treeRoot.removeChild(treeRoot.firstChild);
		}
	}
	/**
	 * Set up scripts for image selection etc when a page loads in the browser
	 * @param {} contextURL
	 */
	global.locationLoaded = function(contextURL){
		/*var doc = lore.util.getContentWindow().document;
		
		 if (contextURL.match(".jpg")){ // temporary hack to test
		
		 //if doc contains any images and it has not already been injected, inject image annotation script
		
		 lore.util.injectScript("content/lib/ext/adapter/jquery/jquery-1.3.2.min.js",doc);
		
		 lore.util.injectScript("content/lib/jquery.imgareaselect-0.8.min.js",doc);
		
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
	 * UI Wrapper classes
	 * The intention is that the views are never directly accesses via their iframes
	 * by other view/overlay code
	 */
	global.compoundObjectView = {
	
		coViews: [],
		
		loaded: function(){
			return this.coViews.length > 0;
		},
		
		registerView: function(coView ){
			this.coViews.push(coView);
		},
		
		unregisterView: function (coView) {
			if (!coView) {
				this.coViews = [];
				this.funcMap = [];
			} else {
				//TODO:		
			}
		}
	}

	var funcs = ["setrelonturl", "setdccreator","setRepos","show","hide",
	"disableUIFeatures","loadCompoundObject","loadRDF","handleLocationChange", "addFigure",
	"saveRDFToRepository", "deleteFromRepository", "serializeREM", "loadRelationshipsFromOntology" ];
	for ( var i=0;i < funcs.length;i++) {
		var funcname = funcs[i];
		global.compoundObjectView[funcname] = eval('function(){'+
			'FBTrace.sysout("[UI] " + "compoundObjectView.' + funcname + ' args:" + arguments, arguments);' +
			'	for (var j = 0; j < this.coViews.length; j++) {' +
			'	this.coViews[j]["' + funcname + '"].apply(this.coViews[j],arguments);' +
			'}' +
		'}');
	}
	
	
	global.annotationView = {
	
		annoViews: [],
		
		loaded: function(){
			return this.annoViews.length > 0;
		},
		
		registerView: function(annoView){
			this.annoViews.push(annoView);
		},
		
		unregisterView: function (annoView) {
			if (!annoView) {
				this.annoViews = [];
			} else {
				//TODO:		
			}
		},
	}
	
	var funcs = ["handleLocationChange", "show","hide","setRepos","setdccreator","disableUIFeatures",
	"handleAddAnnotation", "handleDeleteAnnotation", "handleEditAnnotation","handleReplyToAnnotation",
	"handleSaveAnnotationChanges", "handleSaveAllAnnotationChanges", "showAllAnnotations"  ];
	
	for ( var i=0;i < funcs.length;i++) {
		var funcname = funcs[i];
		global.annotationView[funcname] = eval('function(){'+
			'FBTrace.sysout("[UI] " + "annotationView.' + funcname + ' args:" + arguments, arguments);' +
			'	for (var j = 0; j < this.annoViews.length; j++) {' +
			'	this.annoViews[j]["' + funcname + '"].apply(this.annoViews[j],arguments);' +
			'}' +
		'}');
	}
	
	global.topWindowView = {
		topView: null,
		
		registerView: function(topView){
			this.topView = topView;
		}
	}
	
	var funcs = ["loadAnnotationPrefs", "loadCompoundObjectPrefs",
	"setCompoundObjectsVisibility","setAnnotationsVisibility","compoundObjectsVisible",
	"annotationsVisible","getVariationContentWindow","variationContentWindowIsVisible",
	"updateVariationSplitter"];
	
	for ( var i=0;i < funcs.length;i++) {
		var funcname = funcs[i];
		global.topWindowView[funcname] = eval('function(){'+
			'FBTrace.sysout("[UI] " + "topWindowView.' + funcname + ' args:" + arguments, arguments);' +
			'return this.topView["' + funcname + '"].apply(this.topView,arguments);' +
		'}');
	}
	
	global.textMiningView = {
		tmView: null,
		requestTextMiningMetadata: function(){
			tmView.requestTextMiningMetadata();
		},
		
		registerView: function(view){
			this.tmView = view;
		}
	}
	
	
	