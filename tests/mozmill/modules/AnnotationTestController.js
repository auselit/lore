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

var jumlib = {};

lore = {global: {}};
Components.utils.import("resource://mozmill/modules/jum.js", jumlib);
Components.utils.import("resource://loretest/mozmill/modules/LoreController.js");
Components.utils.import("resource://lore/util.js", lore.global);
Components.utils.import("resource://lore/debug.js", lore);


var EXPORTED_SYMBOLS = ['AnnotationTestController'];

 


AnnotationTestController = {
	
	init: function(controller, loreController, elementslib){
		_overlay = this.overlay=  controller.window.loreoverlay;
		_anno = this.anno =  controller.window.document.getElementById('annographiframe').contentWindow;
		_annoDoc = this.annoDoc= controller.window.document.getElementById('annographiframe').contentWindow.document;
		_co = this.co= controller.window.document.getElementById('graphiframe').contentWindow;
		_coDoc = this.coDoc= controller.window.document.getElementById('graphiframe').contentWindow.document;
		_win = this.win= controller.window;
		_controller = this.controller = controller;
		_loreController = this.loreController = loreController;
		_elementslib = this.elementslib = elementslib;
		_annoController = this;
		return this;
	},

		
	waitForCurrentAnnoSelection: function(pre, page, timeout, interval, fail){
		_loreController.waitForEvent(pre, page, 'annochanged', timeout, interval, 'Annotation Selection Changed', fail);
	},
		
	/**
	 * Delete all annotations currently in the data store.
	 */
	deleteAllInStore: function(){
		var annods = _anno.lore.anno.annods;
		var annos = annods.getRange();
		
		var thus = this;
		var syncDeleteAnnotation = function(anno){
			// remove the annotation from the server
			
			var existsInBackend = !anno.data.isNew();
			//_annods.remove(anno);
			if (existsInBackend) {
				req = new thus.controller.window.XMLHttpRequest();
				
				req.open("DELETE", anno.data.id, false);
				req.setRequestHeader('User-Agent', 'XMLHttpRequest');
				req.setRequestHeader('Content-Type', 'application/text');
				req.send(null);
				
				if ( req.status != 200) {
					lore.debug.anno("request status: " + req.status, req);
				}
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
			annods.remove(anno);
		}
		
		for (var i = 0; i < annos.length; i++) {
			deleteMe(annos[i]);
		}
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
		try {
			//ensure on the correct page.
			_controller.open(theurl);
			_controller.waitForPageLoad(_controller.tabs.activeTab);
			
			var parser = new _controller.window.DOMParser();
			var xmldoc = parser.parseFromString(theRDF, "text/xml");
			
			if (!xmldoc) {
				return;
			}
			
			var n = xmldoc.getElementsByTagNameNS(_anno.lore.constants.NAMESPACES["rdf"], "RDF")[0].childNodes;
			
			var resultNodes = [];
			for (var i = 0; i < n.length; i++) {
				if (n[i].localName == 'Description' && n[i].namespaceURI == _anno.lore.constants.NAMESPACES["rdf"]) {
					resultNodes.push(n[i]);
				}
			}
			
			if (resultNodes.length == 0) 
				return;
			
			
			var annoMan = _anno.lore.anno.annoMan;
			
			var thus = this;
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
				var xhr = new thus.controller.window.XMLHttpRequest();
				xhr.open("POST", annoMan.prefs.url, false); //synchronous
				xhr.setRequestHeader('Content-Type', "application/rdf+xml");
				xhr.setRequestHeader('Content-Length', annoRDF.length);
				xhr.send(annoRDF);
				
				var success = xhr.status == 201;
				
				if (success) {
					var xml = parser.parseFromString(xhr.responseText, "text/xml");
					var n = resultNodes = xml.getElementsByTagNameNS(thus.anno.lore.constants.NAMESPACES["rdf"], "Description");
					if (n && n.length == 1) {
						var newanno = new thus.anno.lore.anno.Annotation(n[0]);
						// saves calling getBodyContent
						newanno.body = anno.body;
						newanno.bodyURL = anno.bodyURL;
						newanno.bodyLoaded = true;
						
						processed[annoid] = newanno;
						unprocessed[annoid] = null;
						//thus.anno.lore.debug.anno("processed " + anno.title + "(" + annoid + ")", newanno);
						annoMan.annods.loadData([newanno], true);
						return newanno;
					}
					else {
						thus.anno.lore.debug.anno("error processing response xml. invalid xml.", {
							n: n,
							responseText: xhr.responseText
						});
					}
					
				}
				else {
					var msg = "error returned from server: " + xhr.status + ": " + xhr.statusText;
					thus.anno.lore.debug.anno(msg, xhr.responseText);
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
					//lore.debug.anno("processing anno " + annotations[i].title + "(" + annotations[i].id + ")", annotations[i]);
					if (!createAnno(annotations[i])) {
						if (callback) 
							callback('fail', "Annotation import failed for annotation, \"" + annotations[i].title + "\"");
						success = false;
						break;
					}
				}
			} 
			catch (e) {
				lore.debug.anno("error occurred during annotations import process: " + e, e);
			}
			
			if (success) {
				if (callback) 
					callback('success', 'All annotations imported successfully');
			}
		} catch (e) {
			_controller.window.alert(e);
		}
	},
		
	assertEditorValues : function (data) {
		 
		// editor panel should appear
		_controller.waitForElement(new _elementslib.ID(_annoDoc, "annotationslistform_annotationsform"), 5000);
		
		// Problems checking via XPath and controller method so use Ext Internal State
		var bodyCmp = _anno.lore.anno.ui.formpanel.getComponent("body");
		var val = lore.global.util.trim(bodyCmp.getValue());
		
		//TODO: Context and Tags field
		_loreController.assertValues(_annoDoc, {
			"annotationslistform_typecombo": data.type,
			"annotationslistform_title": data.title,
			"annotationslistform_creator": data.creator ,
			"annotationslistform_contextdisp": ((data.selection == null || data.selection == '') ? '' : '"' + data.selection + '"')
		});
		
	 
			
		// Problems checking via XPath and controller method so use Ext Internal State
		var bodyCmp = _anno.lore.anno.ui.formpanel.getComponent("body");
		var val = lore.global.util.trim(bodyCmp.getValue());
		
		/*var l = loreController.anno.lore;
		l.debug.anno('-->VAL IS: ' + val);
		for ( var i =0; i < val.length; i ++ ) {
			l.debug.anno('code: ' + val.charCodeAt(i));
		}*/
		
		// the html editor control has it's own magical ways of generating html tags inconsistently, let's
		// not try and predict what it'll come up with, just ensure that it contains the expected data
		jumlib.assertTrue(val.indexOf(data.body) != -1, "Body is somewhat equal to expected. expected be in body: " + data.body + " actual body: " + val);
	},
	
	setTextSelection: function(node ) {
		var window = lore.global.util.getContentWindow(_controller.window);
		var document = window.document;
		
		var sel = window.getSelection();
		if (sel.rangeCount > 0) 
			sel.removeAllRanges();
		
		var range = document.createRange();
		range.selectNode(node);
		sel.addRange(range);
	},
	
	addAnnotation : function (amount, selection, altFunc) {
		altFunc = altFunc || _annoController.addClick;
		// tree node should be inserted
		var treeunsaved = _anno.lore.anno.ui.treeunsaved;
		var nodes = [];
		
		for (var i = 0; i < amount; i++) {
			
			var oldLength = treeunsaved.childNodes.length;
			var oldLastChild = treeunsaved.lastChild;
			_loreController.waitForTreeNodeInsert( altFunc, treeunsaved, 5000, 100);
			var newLength = treeunsaved.childNodes.length;
			var newLastChild = treeunsaved.lastChild;
			jumlib.assertTrue(oldLength + 1 == newLength, "Node count increased by 1. old: " + oldLength + " new: " + newLength);
			jumlib.assertTrue(oldLastChild != newLastChild, "Node was appended to end of list");;
			nodes.push(newLastChild);
			
			// node supplied
			_annoController.assertEditorValues({ type: "Comment",
								title: "New Annotation",
								body: "",  
								selection: selection || '',
								creator: _loreController.testPreferences.dccreator
			});
			
		} 
		return nodes;
	},
	
	deleteAnnotation : function (node, altFunc, noclick){
		var t = this;
		if (!noclick) {
			_annoController.waitForCurrentAnnoSelection(function(){
				t.treeNodeClick(node);
			}, _loreController.anno.lore.anno.ui.page, 5000, 100);
		}
		altFunc ? altFunc(): _annoController.deleteClick();
		_controller.sleep(100); // wait for messagebox pop-up
		var parent = node.parentNode || _loreController.anno.lore.anno.ui.treeroot;
		var oldLength = _annoController.childNodesCount(parent); 
		_loreController.waitForTreeNodeRemoval(_annoController.clickYesDeleteDialog, parent, 5000,100);
		var newLength =  _annoController.childNodesCount(parent);  
		jumlib.assertTrue(oldLength - 1 == newLength, "Node has been deleted. old: " + oldLength + " new: " + newLength);
	},
	
	childNodesCount : function (root) {
		var count = 0;
		for ( var i =0; i < root.childNodes.length; i++ ) {
			var n = root.childNodes[i];
			if ( n.childNodes && n.childNodes.length > 0)
				count += _annoController.childNodesCount(n);
		}
		return count + root.childNodes.length;
	},
	
	// use globals for these functions as the 'this' scope may vary  
	hideEditorClick: function () {
		_controller.click(new _elementslib.ID(_controller.window.frames[3].document, "ext-gen101"));
	},
	treeNodeClick : function (node) {
		// controller.click(new _elementslib.Elem(node.ui.getEl()));
		node.fireEvent('click', node);
	},
	treeNodeDblClick : function (node) {
		//controller.doubleClick(new _elementslib.Elem(node.ui.getEl()));
		node.fireEvent('dblclick', node);
	},
	treeNodeRightClick : function  (node ) {
		_controller.rightClick(new _elementslib.Elem(node.ui.getEl()));
	},
	addClick : function(){
		lore.debug.anno("clicking 'add annotation'");
		_controller.click(new _elementslib.ID(_controller.window.document, "add-annotation"));
	},
	deleteClick : function () {
		_controller.click(new _elementslib.ID(_controller.window.document, "remove-annotation"));
	},
	editClick : function  () {
		_controller.click(new _elementslib.ID(_controller.window.document, "edit-annotation"));
	},
	editContextMenuClick : function  (node) {
		_annoController.treeNodeRightClick(node);
		_controller.waitThenClick(new _elementslib.ID(_controller.window.document, "edit_" + node.id));
	},
	
	domNodeFromButtonArray : function(btns, targetText) {
			for (var i=0; i < btns.length; i++) {
				if (btns[i].getText() == targetText) {
					// get the dom element, and fire the event off via DOM
					return btns[i].btnEl.dom;
				}
			}
		return null;		 
	},
	
	clickYesDeleteDialog : function () {
		if (!_annoController.clickYesDeleteDialog.dom ) {
			_annoController.clickYesDeleteDialog.dom = _annoController.domNodeFromButtonArray(_loreController.anno.Ext.MessageBox.getDialog().buttons, "Yes");
		}
		_controller.click(new _elementslib.Elem(_annoController.clickYesDeleteDialog.dom));
	},
	
	replaceElemValue :  function(elem, value){
		_controller.keypress(elem,"a", {ctrlKey:true, altKey:false,shiftKey:false, metaKey:false});
		_controller.type(elem, 	value);
		
	},

	saveClick: function() {
		_controller.click(new _elementslib.ID(_controller.window.document, 'save-annotation'));
	},
	
	saveAllClick: function() {
		_controller.click(new _elementslib.ID(_controller.window.document, 'save-all-annotations'));
	},
	
	toggleHighlightAllClick: function() {
		_controller.click(new _elementslib.ID(_controller.window.document, 'show-annotations'));
	},
	
	//TODO: work around for buttons required

	hideEditorClick:function() {
		_controller.click(new _elementslib.ID(_controller.window.frames[3].document, "ext-gen101"));
	},
	
	resetEditorClick:function() {
		_controller.click(new _elementslib.ID(_controller.window.frames[3].document, "ext-gen110"));
	},
	saveInEditorClick:function() {
		_controller.click(new _elementslib.ID(_controller.window.frames[3].document, "ext-gen104"));
	},
	
	deleteInEditorClick:function () {
		_controller.click(new _elementslib.ID(_controller.window.frames[3].document, "ext-gen107"));
	},
	replyClick : function () {
		lore.debug.anno("clicking 'reply to annotation'");
		_controller.click(new _elementslib.ID(_controller.window.document, "reply-annotation"));
	},
	replyContextMenuClick : function (node) {
		_annoController.treeNodeRightClick(node);
		_controller.sleep(100);
		_controller.click(new _elementslib.ID(_controller.window.document, "reply_" + node.id));
	},
	deleteClick : function () {
		_controller.click(new _elementslib.ID(_controller.window.document, "remove-annotation"));
	},
	
 	replyToAnnotation : function (amount, node, expected, altFunc ) {
		 
			// tree node should be inserted
			
			altFunc = altFunc || _annoController.replyClick;
			
			for (var i = 0; i < amount; i++) {
				//var node = lore.global.util.findChildRecursively(_loreController.anno.lore.anno.ui.treeroot, 'id', rec.data.id);
				var clickNode = function(){
					lore.debug.anno("clicking tree node");
					_annoController.treeNodeClick(node);
				};
				_annoController.waitForCurrentAnnoSelection(clickNode, _loreController.anno.lore.anno.ui.page, 5000);
				
				var oldLength = _loreController.anno.lore.anno.ui.treeunsaved.childNodes.length;
				_loreController.waitForTreeNodeInsert( altFunc, _loreController.anno.lore.anno.ui.treeunsaved, 5000, 100);
				var newLength = _loreController.anno.lore.anno.ui.treeunsaved.childNodes.length;
				jumlib.assertTrue(oldLength + 1 == newLength, "Node count increased by 1. old: " + oldLength + " new: " + newLength);
				_annoController.assertEditorValues(expected);
			} 
	},
	
	deleteUnsaved : function (amount, altFunc ) {
		var treeunsaved = _loreController.anno.lore.anno.ui.treeunsaved;
		_annoController.addAnnotation(amount);
		
		var clickLastAdded = function () {
			_annoController.treeNodeClick(treeunsaved.lastChild);
		}
		
		var oldLength = treeunsaved.childNodes.length;
		_loreController.waitForTreeNodeRemoval(_annoController.deleteClick, treeunsaved, 5000,100);
		for ( var i =0; i < (amount-1); i++ ) {
			_annoController.waitForCurrentAnnoSelection(_annoController.clickLastAdded, _loreController.anno.lore.anno.ui.page,5000,100);
			_loreController.waitForTreeNodeRemoval(altFunc || _annoController.deleteClick, treeunsaved, 5000,100);	
		}
		var newLength = treeunsaved.childNodes.length;
		
		jumlib.assertTrue(oldLength - amount == newLength, "Nodes have been deleted. old: " + oldLength + " new: " + newLength);
	},
	
	editAnnotation : function (node, expected, changes, altFunc ) {
		_annoController.waitForCurrentAnnoSelection(function (){_annoController.treeNodeClick(node);},
													_loreController.anno.lore.anno.ui.page, 5000, 100);
													
		altFunc = altFunc || _annoController.editClick;
		altFunc();
		
		_annoController.assertEditorValues(expected);
		
		if (!changes) {
			changes =  {
				title: 'Modified Title',
				type: "Comment", 
				body: "Modified Body",
				creator: _loreController.testPreferences.dccreator,
				selection: expected.selection
			}
		}
			
		// highlighting tested in different suite
		// annotation type tested in different test suite.
		// controller.type(new _elementslib.ID(_loreController.annoDoc, 'annotationslistform_typecombo'), 'Question');
		// CTRL+A on field to ensure text is selected in text box, so that previous value is overwritten
		_annoController.replaceElemValue(new _elementslib.ID(_annoDoc, 'annotationslistform_title'),changes.title);
		_annoController.replaceElemValue(new _elementslib.ID(_annoDoc, 'annotationslistform_creator'),changes.creator);
		_annoController.replaceElemValue(new _elementslib.XPath(_controller.window.frames[3].frames[0].document, "/html"),changes.body);
	  
		// Click on another node to hide editor and trigger creation of a node under the 'unsaved changes' tree		
		var altNode = node.parentNode.firstChild;
		while(altNode != null && (altNode.id == node.id )) {
			altNode = altNode.nextSibling;
		}
		jumlib.assertNotNull(altNode, "Alternative node to click exists");
		var treeunsaved = _loreController.anno.lore.anno.ui.treeunsaved;
		var oldLength = treeunsaved.childNodes.length;
		if (altNode) {
			
			_loreController.waitForTreeNodeInsert( function (){
				
				_annoController.waitForCurrentAnnoSelection(function(){_annoController.treeNodeClick(altNode);}, 
														_loreController.anno.lore.anno.ui.page, 5000, 100);
				}, 			
				treeunsaved, 5000, 100);
		
		}
		var newLength = treeunsaved.childNodes.length;	
		jumlib.assertFalse(_loreController.anno.lore.anno.ui.formpanel.isVisible(), "Editor hidden.");;
		
		// Check unsaved node appears and check that fields when re-clicked are still there.

		jumlib.assertTrue(oldLength+1 == newLength, 'Node number increased');
		var newNode = treeunsaved.lastChild;
		jumlib.assertTrue(newNode.id == node.id + "-unsaved");
		
		
		_annoController.waitForCurrentAnnoSelection(function (){_annoController.treeNodeClick(newNode);},
													_loreController.anno.lore.anno.ui.page,5000,100);
		altFunc();					
		_annoController.assertEditorValues(changes);
		_annoController.hideEditorClick();
 		return newNode;
		
	},

	saveAnnotation : function(nodes, expected, altFunc) {
		altFunc = altFunc || _annoController.saveClick; 
		
		var preNew = function(){
			altFunc();
			// give time for the annotation bodies to load, was getting weird race conditions
			// with deletions before the content was loaded
			//TODO: func that waits for annotations to load ( atm could just be a sleep operator)
			_controller.sleep(2000);
		};
		
		var preExisting = function () {
			// trigger save, then switch tab back and forth to the current page to ensure 
			// the annotations are refreshed from the server.
			altFunc();
			_controller.sleep(500);
			var url = _controller.tabs.activeTab.location.href;
			_controller.open("about:blank");
			_controller.waitForPageLoad(_controller.tabs.activeTab);
			_controller.open(url);
			_controller.waitForPageLoad(_controller.tabs.activeTab);
			_controller.sleep(2000);
		}
		
		var preSaveAll = function (){
			_annoController.saveAllClick(); // save all always refreshes
			_controller.sleep(2000);
		}
		
	
		var foundNodes = [];
		var id = null; //node.id.replace('-unsaved','');
		
		var condition = function(tree, parent, targetNode){
				try {
					lore.debug.anno('condition() called. targetNode: ' + targetNode, {
						arg: arguments,
					});
					
					//if (targetNode.id == id) {  ID is changed, newer version of danno returns the id in a header...
					var anno = _loreController.anno.lore.global.util.findRecordById(_loreController.anno.lore.anno.annods, targetNode.id).data

					
						//TODO: need more sophisticated way of matching anntation 
					for (var i = 0; i < expected.length; i++) {
						lore.debug.anno('anno titile:' + anno.title + ' expected title: ' + expected[i].title);
						if (anno && anno.title == expected[i].title) {
							 
							foundNodes.push(targetNode);
							lore.debug.anno(targetNode + 'added to list of ' + foundNodes.length, targetNode);
							if (foundNodes.length == nodes.length) 
								return true;
							break;
						}
					}
				} 
				catch (e) {
					_controller.window.alert(e);
				}
			}
		
		if ( nodes.length == 1 ) { // single annotation to save
			
			var id = _loreController.anno.lore.anno.ui.nodeIdToRecId(nodes[0]);
			lore.debug.anno('node id: ' + id);
			var anno = lore.global.util.findRecordById(_loreController.anno.lore.anno.annods,  id);
			if ( anno == null)
				anno = lore.global.util.findRecordById(_loreController.anno.lore.anno.annodsunsaved,  id);
			
			pre = anno.data.isNew() ? preNew: preExisting;	
		} else {
			pre = preSaveAll;
		}
			
		_loreController.recurringWaitForEvent(pre, _loreController.anno.lore.anno.ui.treeroot, 'append', condition, 5000, 100, "Wait treenode/s which matches the saved treenode id/s to be inserted after save.");
		_annoController.initTestNodeMap();
		jumlib.assertTrue(foundNodes.length == nodes.length);
		
		for (var i = 0; i < foundNodes.length; i++) {
		
			_annoController.waitForCurrentAnnoSelection(function(){
				_annoController.treeNodeClick(foundNodes[i]);
			}, _loreController.anno.lore.anno.ui.page, 5000, 100);
			lore.debug.anno('foundNode: ' + foundNodes[i], foundNodes[i]);
			_annoController.editClick();
			_annoController.assertEditorValues(expected[i]);
		}
		
	},
	
	initTestNodeMap : function(){
		_annoController.testNodeMap = {};
		
		var recurseNodes = function(parent){
			for (var i = 0; i < parent.childNodes.length; i++) {
				var n = parent.childNodes[i];
				var rec = lore.global.util.findRecordById(_loreController.anno.lore.anno.annods, n.id);
				_annoController.testNodeMap[rec.data.title] = n;
				if (n.childNodes && n.childNodes.length > 0) 
					recurseNodes(n);
			}
		}
		recurseNodes(_loreController.anno.lore.anno.ui.treeroot);
	}
}
