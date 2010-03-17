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


try { 
var jumlib = {};

Components.utils.import("resource://mozmill/modules/jum.js", jumlib);
//Components.utils.import("resource://loretest/mozmill/modules/LoreController.js");

var lore = { global : {}};
Components.utils.import("resource://lore/util.js", lore.global);

controller = mozmill.getBrowserController();
var loreController = {
	
		overlay: controller.window.loreoverlay,
		anno: controller.window.document.getElementById('annographiframe').contentWindow,
		annoDoc: controller.window.document.getElementById('annographiframe').contentWindow.document,
		co: controller.window.document.getElementById('graphiframe').contentWindow,
		coDoc: controller.window.document.getElementById('graphiframe').contentWindow.document,
		win: controller.window,
		
		//TODO: Would be better to load from JSON file.
		testPreferences: {
			annoserver: "http://maenad-auselit.cloud.itee.uq.edu.au/danno/annotea",
			dccreator: "Test User",
			disable: false,
			mode: false,
			timeout: 1
		},
		
		waitForEvent: function(pre, observee, event, timeout, interval, msg){
			//loreController.anno.lore.debug.anno('waitForTreeNodeInsert - start ', arguments);
			var eventOccurred = false;
			
			if (!interval) 
				interval = 100;
			
			var success = function(){
				//loreController.anno.lore.debug.anno('node was inserted');
				eventOccurred = true;
			};
			
			observee.on(event, success, this);
			var millis = 0;
			if (pre) 
				pre();
			
			//loreController.anno.lore.debug.anno('polling');
			while (!eventOccurred && (millis < timeout)) {
				millis += interval;
				controller.sleep(interval);
			}
			
			observee.un(event, success, this);
			
			//loreController.anno.lore.debug.anno('waitForTreeNodeInsert - finish', arguments);
			jumlib.assertTrue(eventOccurred, msg || event + " occurred.");
			
		},
		
		waitForCurrentAnnoSelection: function(pre, page, timeout, interval){
			this.waitForEvent(pre, page, 'annochanged', timeout, interval, 'Annotation Selection Changed');
		},
		
		waitForTreeNodeInsert: function(pre, parent, timeout, interval){
			this.waitForEvent(pre, parent, 'append', timeout, interval, 'Node inserted');
		},
		
		assertValues: function(window, values){
			for (var name in values) {
				//loreController.anno.lore.debug.anno('checking ' + name + ' to be value: ' + values[name]);
				controller.assertValue(new elementslib.ID(window, name), values[name]);
			}
		},
		
		//TODO: Replace with firefox test profile run via command line
		pushPopTestPreferences: function(push){
			var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.lore.");
			prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
			if (push) {
				this.originalPreferences = {
					annoserver: prefs.getCharPref("annoserver"),
					dccreator: prefs.getCharPref("dccreator"),
					disable: prefs.getBoolPref("disable_annotations"),
					mode: prefs.getBoolPref("annotationmode"),
					timeout: prefs.getIntPref("annocache_timeout")
				}
				var t = this.testPreferences;
				prefs.setCharPref("annoserver", t.annoserver);
				prefs.setCharPref("dccreator", t.dccreator);
				prefs.setBoolPref("disable_annotations", t.disable);
				prefs.setBoolPref("annotationmode", t.mode);
				prefs.setIntPref("annocache_timeout", t.timeout); // no caching by default
			}
			else {
				var o = this.originalPreferences;
				prefs.setCharPref("annoserver", o.annoserver);
				prefs.setCharPref("dccreator", o.dccreator);
				prefs.setBoolPref("disable_annotations", o.disable);
				prefs.setBoolPref("annotationmode", o.mode);
				prefs.setIntPref("annocache_timeout", o.timeout);
			}
			
		},
		
		/**
		 * Delete all annotations currently in the data store.
		 */
		deleteAllInStore: function(){
			var annods = loreController.anno.lore.anno.annods;
			var annos = annods.getRange();
			
			var syncDeleteAnnotation = function(anno){
				// remove the annotation from the server
				
				var existsInBackend = !anno.data.isNew();
				//this.annods.remove(anno);
				if (existsInBackend) {
					req = new controller.window.XMLHttpRequest();
					
					req.open("DELETE", anno.data.id, false);
					req.setRequestHeader('User-Agent', 'XMLHttpRequest');
					req.setRequestHeader('Content-Type', 'application/text');
					req.send(null);
					
					jumlib.assertTrue(req.status == 200);
				}
			}
			
			var unprocessed = {};
			for (var i = 0; i < annos.length; i++) {
				unprocessed[annos[i].data.id] = annos[i];
			}
			
			var deleteMe = function(anno){
				if (!anno || !unprocessed[anno.data.id]) 
					return;
				
				unprocessed[anno.data.id] = null;
				if (anno.data.replies && anno.data.replies.count > 0) {
				
					for (var e in anno.data.replies.map) {
						deleteMe(unprocessed[e]);
					}
					anno.data.replies.count = anno.data.replies.localcount = 0;
				}
				syncDeleteAnnotation(anno);
			}
			
			for (var i = 0; i < annos.length; i++) {
				deleteMe(annos[i]);
			}
			annods.removeAll();
		},
		
		/**
		 * Import annotations into the local store, from a string containing valid RDF.
		 * This method is not used by the Annotation client as using the Danno import facility is recommended.
		 * @param {String} theRDF String containing valid RDF conformant to the Annotea spec
		 * @param {Object} theurl The url of the page this will be loaded into 
		 * @param {Function} callback A callback function that is used by the function to output success or failure
		 * The callback should support the following parameters
		 * result: Result as a string ('success' or 'fail')
		 * resultMsg: Result message
		 */
		importRDF: function(theRDF, theurl, callback){
		
			//ensure on the correct page.
			controller.open(theurl);
  			controller.waitForPageLoad(controller.tabs.activeTab);
			
			var parser = new controller.window.DOMParser();
			var xmldoc = parser.parseFromString(theRDF, "text/xml");
			
			if (!xmldoc) {
				return;
			}
			
			var n = xmldoc.getElementsByTagNameNS(loreController.anno.lore.constants.NAMESPACES["rdf"], "RDF")[0].childNodes;
			
			var resultNodes = [];
			for (var i = 0; i < n.length; i++) {
				if (n[i].localName == 'Description' && n[i].namespaceURI == loreController.anno.lore.constants.NAMESPACES["rdf"]) {
					resultNodes.push(n[i]);
				}
			}
			
			if (resultNodes.length == 0) 
				return;
			
			
			var annoMan = loreController.anno.lore.anno.annoMan;
			
			var createAnno = function(anno){
			
				if (processed[anno.id]) // shouldn't ever be true if there's no bugs
					return processed[anno.id];
				
				if (anno.isReply) {
					// create parents recursively, updating the about reference
					// to the the new id assigned by the server
					if (unprocessed[anno.about]) {
						if (!createAnno(unprocessed[anno.about])) 
							return null;
					}
					anno.about = processed[anno.about].id;
				}
				var annoid = anno.id + '';
				
				
				anno.id = null;
				var annoRDF = annoMan.serializer.serialize([anno], annoMan.annods);
				var xhr = new controller.window.XMLHttpRequest();
				xhr.open("POST", annoMan.prefs.url, false); //synchronous
				xhr.setRequestHeader('Content-Type', "application/rdf+xml");
				xhr.setRequestHeader('Content-Length', annoRDF.length);
				xhr.send(annoRDF);
				
				var success = xhr.status == 201;
				
				if (success) {
					var xml = parser.parseFromString(xhr.responseText, "text/xml");
					var n = resultNodes = xml.getElementsByTagNameNS(loreController.anno.lore.constants.NAMESPACES["rdf"], "Description");
					if (n && n.length == 1) {
						var newanno = new loreController.anno.lore.anno.Annotation(n[0]);
						// saves calling getBodyContent
						newanno.body = anno.body;
						newanno.bodyURL = anno.bodyURL;
						newanno.bodyLoaded = true;
						
						processed[annoid] = newanno;
						unprocessed[annoid] = null;
						loreController.anno.lore.debug.anno("processed " + anno.title + "(" + annoid + ")", newanno);
						annoMan.annods.loadData([newanno], true);
						return newanno;
					}
					else {
						loreController.anno.lore.debug.anno("error processing response xml. invalid xml.", {
							n: n,
							responseText: xhr.responseText
						});
					}
					
				}
				else {
					var msg = "error returned from server: " + xhr.status + ": " + xhr.statusText;
					loreController.anno.lore.debug.anno(msg, xhr.responseText);
					if (callback) 
						callback('fail', msg);
				}
				return null;
			};
			
			var annotations = annoMan.orderByDate(resultNodes, true);
			var unprocessed = {};
			var processed = {};
			for (var i = 0; i < annotations.length; i++) {
				unprocessed[annotations[i].id] = annotations[i];
			}
			
			var success = true;
			try {
				for (var i = 0; i < annotations.length; i++) {
					loreController.anno.lore.debug.anno("processing anno " + annotations[i].title + "(" + annotations[i].id + ")", annotations[i]);
					if (!createAnno(annotations[i])) {
						if (callback) 
							callback('fail', "Annotation import failed for annotation, \"" + annotations[i].title + "\"");
						success = false;
						break;
					}
				}
			} 
			catch (e) {
				loreController.anno.lore.debug.anno("error occurred during annotations import process: " + e, e);
			}
			
			if (success) {
				if (callback) 
					callback('success', 'All annotations imported successfully');
			}
		},
		
		openLore : function (annotations){
			var isVisibleFunc = annotations ? loreController.overlay.annotationsVisible:loreController.overlay.compoundObjectsVisible;
   			if (!isVisibleFunc()) {
    			 	controller.click(new elementslib.ID(controller.window.document, "loreStatusIcon"));
	   			jumlib.assertTrue(isVisibleFunc(),'LORE should be open');
   			}
		}
	}



	var setupModule = function ( module ) {
		
		loreController.openLore();
		loreController.pushPopTestPreferences(true);
				
		
		// Set up testing data
		loreController.importRDF(
			//TODO: Read this RDF from file
			'<?xml version="1.0" ?><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="http://maenad-auselit.cloud.itee.uq.edu.au/danno/annotea/CEB877B9A1524D53"><rdf:type rdf:resource="http://www.w3.org/2000/10/annotation-ns#Annotation"/><rdf:type rdf:resource="http://www.w3.org/2000/10/annotationType#Comment"/><annotates xmlns="http://www.w3.org/2000/10/annotation-ns#" rdf:resource="http://maenad-auselit.cloud.itee.uq.edu.au/fvt/bullstory.html"/><language xmlns="http://purl.org/dc/elements/1.1/">en</language><title xmlns="http://purl.org/dc/elements/1.1/">Test Annotation 1</title><creator xmlns="http://purl.org/dc/elements/1.1/">Test User</creator><created xmlns="http://www.w3.org/2000/10/annotation-ns#">2010-03-15T20:54:47.810-07:00</created><modified xmlns="http://www.w3.org/2000/10/annotation-ns#">Tue Mar 16 2010 14:01:23 GMT+1000</modified><context xmlns="http://www.w3.org/2000/10/annotation-ns#">http://maenad-auselit.cloud.itee.uq.edu.au/fvt/bullstory.html#xpointer(string-range(/html[1]/body[1]/div[1]/h1[1], "", 1, 23))</context><body xmlns="http://www.w3.org/2000/10/annotation-ns#"><rdf:Description><ContentType xmlns="http://www.w3.org/1999/xx/http#">text/html</ContentType><Body xmlns="http://www.w3.org/1999/xx/http#" rdf:parseType="Literal"><html xmlns="http://www.w3.org/TR/REC-html40"><head><title>Test Annotation 1</title></head><body>Test Annotation 1<br xmlns="http://www.w3.org/1999/xhtml" /></body></html></Body></rdf:Description></body><tag xmlns="http://austlit.edu.au/ontologies/2009/03/lit-annotation-ns#" resource="http://austlit.edu.au/run?ex=ShowThes&amp;tid=Jk;"/></rdf:Description><rdf:Description rdf:about="http://maenad-auselit.cloud.itee.uq.edu.au/danno/annotea/E7D5686F6349F910"><rdf:type rdf:resource="http://www.w3.org/2000/10/annotation-ns#Annotation"/><rdf:type rdf:resource="http://www.w3.org/2000/10/annotationType#Comment"/><annotates xmlns="http://www.w3.org/2000/10/annotation-ns#" rdf:resource="http://maenad-auselit.cloud.itee.uq.edu.au/fvt/bullstory.html"/><language xmlns="http://purl.org/dc/elements/1.1/">en</language><title xmlns="http://purl.org/dc/elements/1.1/">Test Annotation 2</title><creator xmlns="http://purl.org/dc/elements/1.1/">Test User</creator><created xmlns="http://www.w3.org/2000/10/annotation-ns#">2010-03-15T20:55:13.947-07:00</created><modified xmlns="http://www.w3.org/2000/10/annotation-ns#">Tue Mar 16 2010 14:01:23 GMT+1000</modified><body xmlns="http://www.w3.org/2000/10/annotation-ns#"><rdf:Description><ContentType xmlns="http://www.w3.org/1999/xx/http#">text/html</ContentType><Body xmlns="http://www.w3.org/1999/xx/http#" rdf:parseType="Literal"><html xmlns="http://www.w3.org/TR/REC-html40"><head><title>Test Annotation 2</title></head><body><br xmlns="http://www.w3.org/1999/xhtml" /></body></html></Body></rdf:Description></body></rdf:Description><rdf:Description rdf:about="http://maenad-auselit.cloud.itee.uq.edu.au/danno/annotea/2C5DA5296EF9247A"><rdf:type rdf:resource="http://www.w3.org/2001/03/thread#Reply"/><rdf:type rdf:resource="http://www.w3.org/2000/10/annotationType#Comment"/><inReplyTo xmlns="http://www.w3.org/2001/03/thread#" rdf:resource="http://maenad-auselit.cloud.itee.uq.edu.au/danno/annotea/E7D5686F6349F910"/><root xmlns="http://www.w3.org/2001/03/thread#" rdf:resource="http://maenad-auselit.cloud.itee.uq.edu.au/danno/annotea/E7D5686F6349F910"/><language xmlns="http://purl.org/dc/elements/1.1/">en</language><title xmlns="http://purl.org/dc/elements/1.1/">Test Annotation 3</title><creator xmlns="http://purl.org/dc/elements/1.1/">Test User</creator><created xmlns="http://www.w3.org/2000/10/annotation-ns#">2010-03-15T20:59:15.738-07:00</created><modified xmlns="http://www.w3.org/2000/10/annotation-ns#">Tue Mar 16 2010 14:01:23 GMT+1000</modified><body xmlns="http://www.w3.org/2000/10/annotation-ns#"><rdf:Description><ContentType xmlns="http://www.w3.org/1999/xx/http#">text/html</ContentType><Body xmlns="http://www.w3.org/1999/xx/http#" rdf:parseType="Literal"><html xmlns="http://www.w3.org/TR/REC-html40"><head><title>Test Annotation 3</title></head><body>This is a reply.<br xmlns="http://www.w3.org/1999/xhtml" /></body></html></Body></rdf:Description></body></rdf:Description><rdf:Description rdf:about="http://maenad-auselit.cloud.itee.uq.edu.au/danno/annotea/4BFFE0136F34EFBD"><rdf:type rdf:resource="http://www.w3.org/2001/03/thread#Reply"/><rdf:type rdf:resource="http://www.w3.org/2000/10/annotationType#Comment"/><inReplyTo xmlns="http://www.w3.org/2001/03/thread#" rdf:resource="http://maenad-auselit.cloud.itee.uq.edu.au/danno/annotea/2C5DA5296EF9247A"/><root xmlns="http://www.w3.org/2001/03/thread#" rdf:resource="http://maenad-auselit.cloud.itee.uq.edu.au/danno/annotea/E7D5686F6349F910"/><language xmlns="http://purl.org/dc/elements/1.1/">en</language><title xmlns="http://purl.org/dc/elements/1.1/">Test Annotation 4</title><creator xmlns="http://purl.org/dc/elements/1.1/">Test User</creator><created xmlns="http://www.w3.org/2000/10/annotation-ns#">2010-03-15T20:59:38.888-07:00</created><modified xmlns="http://www.w3.org/2000/10/annotation-ns#">Tue Mar 16 2010 14:01:23 GMT+1000</modified><body xmlns="http://www.w3.org/2000/10/annotation-ns#"><rdf:Description><ContentType xmlns="http://www.w3.org/1999/xx/http#">text/html</ContentType><Body xmlns="http://www.w3.org/1999/xx/http#" rdf:parseType="Literal"><html xmlns="http://www.w3.org/TR/REC-html40"><head><title>Test Annotation 4</title></head><body><br xmlns="http://www.w3.org/1999/xhtml" /></body></html></Body></rdf:Description></body></rdf:Description></rdf:RDF>',
			//TODO: should be a chrome URL bundled with package
			"http://maenad-auselit.cloud.itee.uq.edu.au/fvt/bullstory.html", 
			function(result, msg) {
				loreController.anno.lore.debug.anno(":- " + result + ", " + msg);
			});
		 
	}
	
	var teardownModule = function ( module ) {
		loreController.deleteAllInStore();
		loreController.pushPopTestPreferences(false);
	
	}

	
	var setupTest = function(test){
		loreController.anno.lore.anno.annodsunsaved.removeAll();
		loreController.anno.lore.anno.ui.page.setCurrentAnno();
	}
	
	var teardownTest = function(test){
		loreController.anno.lore.anno.annodsunsaved.removeAll();
		loreController.anno.lore.anno.ui.page.setCurrentAnno();
	}
	
	var addClick = function(){
				loreController.anno.lore.debug.anno("clicking 'add annotation'");
				controller.click(new elementslib.ID(controller.window.document, "add-annotation"));
	};
	
	var addAnnotation = function (amount) {
			
			// tree node should be inserted
			var oldLength = loreController.anno.lore.anno.ui.treeunsaved.childNodes.length;
			for (var i = 0; i < amount; i++) {
				loreController.waitForTreeNodeInsert( addClick, loreController.anno.lore.anno.ui.treeunsaved, 5000, 100);
			} 
			var newLength = loreController.anno.lore.anno.ui.treeunsaved.childNodes.length;
			jumlib.assertTrue(oldLength + amount == newLength, "Node count increased by " + amount + ". old: " + oldLength + " new: " + newLength);
			
			// editor panel should appear
			controller.waitForElement(new elementslib.ID(loreController.annoDoc, "ext-gen34"), 5000);
			
			loreController.assertValues(loreController.annoDoc, {
				"annotationslistform_typecombo": "Comment",
				"annotationslistform_title": "New Annotation",
				"annotationslistform_creator": loreController.testPreferences.dccreator ,
				"annotationslistform_contextdisp": ""
			});
			
			//TODO: the body element, getting a proper id for the editor panel
			// and setting up the preferences and annotation server etc as part of the module setup and teardown
			//controller.assertValue(new elementslib.XPath(controller.window.frames[3].frames[0].document, "/html/body"), '');
	}
	
	var replyClick = function () {
		loreController.anno.lore.debug.anno("clicking 'reply to annotation'");
		controller.click(new elementslib.ID(controller.window.document, "reply-annotation"));
	}
	
	var replyToAnnotation = function (amount, rec ) {
		 
		 	if ( !rec ) {
				var recs = loreController.anno.lore.anno.annods.getRange();
				rec = recs[0]; 
			}

			// tree node should be inserted
			var oldLength = loreController.anno.lore.anno.ui.treeunsaved.childNodes.length;
			
			for (var i = 0; i < amount; i++) {
				var node = lore.global.util.findChildRecursively(loreController.anno.lore.anno.ui.treeroot, 'id', rec.data.id);
				var clickNode = function(){
					loreController.anno.lore.debug.anno("clicking tree node");
					node.fireEvent('click', node);
				};
				loreController.waitForCurrentAnnoSelection(clickNode, loreController.anno.lore.anno.ui.page, 5000);
				loreController.waitForTreeNodeInsert( replyClick, loreController.anno.lore.anno.ui.treeunsaved, 5000, 100);
			} 
			
			var newLength = loreController.anno.lore.anno.ui.treeunsaved.childNodes.length;
			jumlib.assertTrue(oldLength + amount == newLength, "Node count increased by " + amount + ". old: " + oldLength + " new: " + newLength);
			
			// editor panel should appear
			controller.waitForElement(new elementslib.ID(loreController.annoDoc, "ext-gen34"), 5000);
			
			loreController.assertValues(loreController.annoDoc, {
				"annotationslistform_typecombo": "Comment",
				"annotationslistform_title": "Re: " + rec.data.title,
				"annotationslistform_creator": loreController.testPreferences.dccreator ,
				"annotationslistform_contextdisp": ""
			});
	}
	
			
	var testAdd = function(){
		 addAnnotation(1);
	}
	
	var testAddMultiple = function () {
		addAnnotation(3); 	
		addAnnotation(10); 	 
	}

	var testAddReply = function () {
		replyToAnnotation(1);
	}
	
	var testAddReplyMultiple = function () {
		replyToAnnotation(3);
		replyToAnnotation(10);
	}
	
	
} catch (e ) {
	controller.window.alert(e);
}

 
