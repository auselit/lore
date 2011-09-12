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

Components.utils["import"]("resource://mozmill/modules/jum.js", jumlib);

var lore = { global : {}};
Components.utils["import"]("resource://lore/util.js", lore);
Components.utils["import"]("resource://loretest/mozmill/modules/LoreController.js");
Components.utils["import"]("resource://loretest/mozmill/modules/AnnotationTestController.js");

	
	//TODO: #185 - This file needs to be separated into separate files for each group of operation as the
	// tests run for too long, and if there's failures it takes a long time to go through fixing...also script timeout events occur
	var setupModule = function ( module ) {
		try {
			controller = mozmill.getBrowserController();
			loreController = LoreController.init(controller, elementslib);
			annoController = AnnotationTestController.init(controller, loreController, elementslib);
			
			loreController.openLore();
			loreController.pushPopTestPreferences(true);
			
			// Set up testing data
			annoController.importRDF(	//TODO: Read this RDF from file
			'<?xml version="1.0" ?><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="http://maenad-auselit.cloud.itee.uq.edu.au/danno/annotea/6E616583CD44CD3C"><rdf:type rdf:resource="http://www.w3.org/2000/10/annotation-ns#Annotation"/><rdf:type rdf:resource="http://www.w3.org/2000/10/annotationType#Comment"/><annotates xmlns="http://www.w3.org/2000/10/annotation-ns#" rdf:resource="chrome://loretest/content/bullstory.html"/><language xmlns="http://purl.org/dc/elements/1.1/">en</language><title xmlns="http://purl.org/dc/elements/1.1/">testDelete</title><creator xmlns="http://purl.org/dc/elements/1.1/">Test User</creator><created xmlns="http://www.w3.org/2000/10/annotation-ns#">2010-03-21T17:49:25.183-07:00</created><modified xmlns="http://www.w3.org/2000/10/annotation-ns#">Mon Mar 22 2010 11:23:56 GMT+1000</modified><body xmlns="http://www.w3.org/2000/10/annotation-ns#"><rdf:Description><ContentType xmlns="http://www.w3.org/1999/xx/http#">text/html</ContentType><Body xmlns="http://www.w3.org/1999/xx/http#" rdf:parseType="Literal"><html xmlns="http://www.w3.org/TR/REC-html40"><head><title>testDelete</title></head><body></body></html></Body></rdf:Description></body></rdf:Description><rdf:Description rdf:about="http://maenad-auselit.cloud.itee.uq.edu.au/danno/annotea/8B21E4249AED1237"><rdf:type rdf:resource="http://www.w3.org/2000/10/annotation-ns#Annotation"/><rdf:type rdf:resource="http://www.w3.org/2000/10/annotationType#Comment"/><annotates xmlns="http://www.w3.org/2000/10/annotation-ns#" rdf:resource="chrome://loretest/content/bullstory.html"/><language xmlns="http://purl.org/dc/elements/1.1/">en</language><title xmlns="http://purl.org/dc/elements/1.1/">testReply</title><creator xmlns="http://purl.org/dc/elements/1.1/">Test User</creator><created xmlns="http://www.w3.org/2000/10/annotation-ns#">2010-03-21T18:03:34.275-07:00</created><modified xmlns="http://www.w3.org/2000/10/annotation-ns#">Mon Mar 22 2010 11:23:56 GMT+1000</modified><body xmlns="http://www.w3.org/2000/10/annotation-ns#"><rdf:Description><ContentType xmlns="http://www.w3.org/1999/xx/http#">text/html</ContentType><Body xmlns="http://www.w3.org/1999/xx/http#" rdf:parseType="Literal"><html xmlns="http://www.w3.org/TR/REC-html40"><head><title>testReply</title></head><body></body></html></Body></rdf:Description></body></rdf:Description><rdf:Description rdf:about="http://maenad-auselit.cloud.itee.uq.edu.au/danno/annotea/995006877728311F"><rdf:type rdf:resource="http://www.w3.org/2000/10/annotation-ns#Annotation"/><rdf:type rdf:resource="http://www.w3.org/2000/10/annotationType#Comment"/><annotates xmlns="http://www.w3.org/2000/10/annotation-ns#" rdf:resource="chrome://loretest/content/bullstory.html"/><language xmlns="http://purl.org/dc/elements/1.1/">en</language><title xmlns="http://purl.org/dc/elements/1.1/">testReplyMultiple</title><creator xmlns="http://purl.org/dc/elements/1.1/">Test User</creator><created xmlns="http://www.w3.org/2000/10/annotation-ns#">2010-03-21T18:03:58.041-07:00</created><modified xmlns="http://www.w3.org/2000/10/annotation-ns#">Mon Mar 22 2010 11:23:56 GMT+1000</modified><body xmlns="http://www.w3.org/2000/10/annotation-ns#"><rdf:Description><ContentType xmlns="http://www.w3.org/1999/xx/http#">text/html</ContentType><Body xmlns="http://www.w3.org/1999/xx/http#" rdf:parseType="Literal"><html xmlns="http://www.w3.org/TR/REC-html40"><head><title>testReplyMultiple</title></head><body></body></html></Body></rdf:Description></body></rdf:Description><rdf:Description rdf:about="http://maenad-auselit.cloud.itee.uq.edu.au/danno/annotea/7BCB16D60FA6BEE9"><rdf:type rdf:resource="http://www.w3.org/2000/10/annotation-ns#Annotation"/><rdf:type rdf:resource="http://www.w3.org/2000/10/annotationType#Comment"/><annotates xmlns="http://www.w3.org/2000/10/annotation-ns#" rdf:resource="chrome://loretest/content/bullstory.html"/><language xmlns="http://purl.org/dc/elements/1.1/">en</language><title xmlns="http://purl.org/dc/elements/1.1/">testDelete2</title><creator xmlns="http://purl.org/dc/elements/1.1/">Test User</creator><created xmlns="http://www.w3.org/2000/10/annotation-ns#">2010-03-21T18:07:14.632-07:00</created><modified xmlns="http://www.w3.org/2000/10/annotation-ns#">Mon Mar 22 2010 11:23:56 GMT+1000</modified><body xmlns="http://www.w3.org/2000/10/annotation-ns#"><rdf:Description><ContentType xmlns="http://www.w3.org/1999/xx/http#">text/html</ContentType><Body xmlns="http://www.w3.org/1999/xx/http#" rdf:parseType="Literal"><html xmlns="http://www.w3.org/TR/REC-html40"><head><title>testDelete2</title></head><body></body></html></Body></rdf:Description></body></rdf:Description><rdf:Description rdf:about="http://maenad-auselit.cloud.itee.uq.edu.au/danno/annotea/88A6CA76403CFE99"><rdf:type rdf:resource="http://www.w3.org/2000/10/annotation-ns#Annotation"/><rdf:type rdf:resource="http://www.w3.org/2000/10/annotationType#Comment"/><annotates xmlns="http://www.w3.org/2000/10/annotation-ns#" rdf:resource="chrome://loretest/content/bullstory.html"/><language xmlns="http://purl.org/dc/elements/1.1/">en</language><title xmlns="http://purl.org/dc/elements/1.1/">testDeleteViaEditorPanel</title><creator xmlns="http://purl.org/dc/elements/1.1/">Test User</creator><created xmlns="http://www.w3.org/2000/10/annotation-ns#">2010-03-21T18:11:17.414-07:00</created><modified xmlns="http://www.w3.org/2000/10/annotation-ns#">Mon Mar 22 2010 11:23:56 GMT+1000</modified><body xmlns="http://www.w3.org/2000/10/annotation-ns#"><rdf:Description><ContentType xmlns="http://www.w3.org/1999/xx/http#">text/html</ContentType><Body xmlns="http://www.w3.org/1999/xx/http#" rdf:parseType="Literal"><html xmlns="http://www.w3.org/TR/REC-html40"><head><title>testDeleteViaEditorPanel</title></head><body></body></html></Body></rdf:Description></body></rdf:Description><rdf:Description rdf:about="http://maenad-auselit.cloud.itee.uq.edu.au/danno/annotea/B99625905BB26651"><rdf:type rdf:resource="http://www.w3.org/2000/10/annotation-ns#Annotation"/><rdf:type rdf:resource="http://www.w3.org/2000/10/annotationType#Comment"/><annotates xmlns="http://www.w3.org/2000/10/annotation-ns#" rdf:resource="chrome://loretest/content/bullstory.html"/><language xmlns="http://purl.org/dc/elements/1.1/">en</language><title xmlns="http://purl.org/dc/elements/1.1/">testEdit</title><creator xmlns="http://purl.org/dc/elements/1.1/">Test User</creator><created xmlns="http://www.w3.org/2000/10/annotation-ns#">2010-03-21T18:13:52.294-07:00</created><modified xmlns="http://www.w3.org/2000/10/annotation-ns#">Mon Mar 22 2010 11:23:56 GMT+1000</modified><context xmlns="http://www.w3.org/2000/10/annotation-ns#">chrome://loretest/content/bullstory.html#xpointer(string-range(/html[1]/body[1]/div[1]/h1[1], "", 1, 23))</context><body xmlns="http://www.w3.org/2000/10/annotation-ns#"><rdf:Description><ContentType xmlns="http://www.w3.org/1999/xx/http#">text/html</ContentType><Body xmlns="http://www.w3.org/1999/xx/http#" rdf:parseType="Literal"><html xmlns="http://www.w3.org/TR/REC-html40"><head><title>testEdit</title></head><body>Test Edit 1<br xmlns="http://www.w3.org/1999/xhtml" /></body></html></Body></rdf:Description></body></rdf:Description><rdf:Description rdf:about="http://maenad-auselit.cloud.itee.uq.edu.au/danno/annotea/8A572B41D512FBF8"><rdf:type rdf:resource="http://www.w3.org/2000/10/annotation-ns#Annotation"/><rdf:type rdf:resource="http://www.w3.org/2000/10/annotationType#Comment"/><annotates xmlns="http://www.w3.org/2000/10/annotation-ns#" rdf:resource="chrome://loretest/content/bullstory.html"/><language xmlns="http://purl.org/dc/elements/1.1/">en</language><title xmlns="http://purl.org/dc/elements/1.1/">testSave</title><creator xmlns="http://purl.org/dc/elements/1.1/">Test User</creator><created xmlns="http://www.w3.org/2000/10/annotation-ns#">2010-03-21T18:16:17.344-07:00</created><modified xmlns="http://www.w3.org/2000/10/annotation-ns#">Mon Mar 22 2010 11:23:56 GMT+1000</modified><context xmlns="http://www.w3.org/2000/10/annotation-ns#">chrome://loretest/content/bullstory.html#xpointer(string-range(/html[1]/body[1]/div[1]/h4[1], "", 1, 22))</context><body xmlns="http://www.w3.org/2000/10/annotation-ns#"><rdf:Description><ContentType xmlns="http://www.w3.org/1999/xx/http#">text/html</ContentType><Body xmlns="http://www.w3.org/1999/xx/http#" rdf:parseType="Literal"><html xmlns="http://www.w3.org/TR/REC-html40"><head><title>testSave</title></head><body>testSave 1<br xmlns="http://www.w3.org/1999/xhtml" /></body></html></Body></rdf:Description></body></rdf:Description><rdf:Description rdf:about="http://maenad-auselit.cloud.itee.uq.edu.au/danno/annotea/854AB32EED12E702"><rdf:type rdf:resource="http://www.w3.org/2000/10/annotation-ns#Annotation"/><rdf:type rdf:resource="http://www.w3.org/2000/10/annotationType#Comment"/><annotates xmlns="http://www.w3.org/2000/10/annotation-ns#" rdf:resource="chrome://loretest/content/bullstory.html"/><language xmlns="http://purl.org/dc/elements/1.1/">en</language><title xmlns="http://purl.org/dc/elements/1.1/">testSaveAll_1</title><creator xmlns="http://purl.org/dc/elements/1.1/">Test User</creator><created xmlns="http://www.w3.org/2000/10/annotation-ns#">2010-03-21T18:18:47.133-07:00</created><modified xmlns="http://www.w3.org/2000/10/annotation-ns#">Mon Mar 22 2010 11:23:56 GMT+1000</modified><body xmlns="http://www.w3.org/2000/10/annotation-ns#"><rdf:Description><ContentType xmlns="http://www.w3.org/1999/xx/http#">text/html</ContentType><Body xmlns="http://www.w3.org/1999/xx/http#" rdf:parseType="Literal"><html xmlns="http://www.w3.org/TR/REC-html40"><head><title>testSaveAll_1</title></head><body>testSaveAll_1<br xmlns="http://www.w3.org/1999/xhtml" /></body></html></Body></rdf:Description></body></rdf:Description><rdf:Description rdf:about="http://maenad-auselit.cloud.itee.uq.edu.au/danno/annotea/AD3C943F07B17A54"><rdf:type rdf:resource="http://www.w3.org/2000/10/annotation-ns#Annotation"/><rdf:type rdf:resource="http://www.w3.org/2000/10/annotationType#Comment"/><annotates xmlns="http://www.w3.org/2000/10/annotation-ns#" rdf:resource="chrome://loretest/content/bullstory.html"/><language xmlns="http://purl.org/dc/elements/1.1/">en</language><title xmlns="http://purl.org/dc/elements/1.1/">testSaveAll_2</title><creator xmlns="http://purl.org/dc/elements/1.1/">Test User</creator><created xmlns="http://www.w3.org/2000/10/annotation-ns#">2010-03-21T18:23:17.795-07:00</created><modified xmlns="http://www.w3.org/2000/10/annotation-ns#">Mon Mar 22 2010 11:23:56 GMT+1000</modified><body xmlns="http://www.w3.org/2000/10/annotation-ns#"><rdf:Description><ContentType xmlns="http://www.w3.org/1999/xx/http#">text/html</ContentType><Body xmlns="http://www.w3.org/1999/xx/http#" rdf:parseType="Literal"><html xmlns="http://www.w3.org/TR/REC-html40"><head><title>testSaveAll_2</title></head><body>testSaveAll_2</body></html></Body></rdf:Description></body></rdf:Description><rdf:Description rdf:about="http://maenad-auselit.cloud.itee.uq.edu.au/danno/annotea/D8161E349F8BB77E"><rdf:type rdf:resource="http://www.w3.org/2001/03/thread#Reply"/><rdf:type rdf:resource="http://www.w3.org/2000/10/annotationType#Comment"/><inReplyTo xmlns="http://www.w3.org/2001/03/thread#" rdf:resource="http://maenad-auselit.cloud.itee.uq.edu.au/danno/annotea/7BCB16D60FA6BEE9"/><root xmlns="http://www.w3.org/2001/03/thread#" rdf:resource="http://maenad-auselit.cloud.itee.uq.edu.au/danno/annotea/7BCB16D60FA6BEE9"/><language xmlns="http://purl.org/dc/elements/1.1/">en</language><title xmlns="http://purl.org/dc/elements/1.1/">Re: testDelete2</title><creator xmlns="http://purl.org/dc/elements/1.1/">Test User</creator><created xmlns="http://www.w3.org/2000/10/annotation-ns#">2010-03-21T18:08:51.114-07:00</created><modified xmlns="http://www.w3.org/2000/10/annotation-ns#">Mon Mar 22 2010 11:23:56 GMT+1000</modified><body xmlns="http://www.w3.org/2000/10/annotation-ns#"><rdf:Description><ContentType xmlns="http://www.w3.org/1999/xx/http#">text/html</ContentType><Body xmlns="http://www.w3.org/1999/xx/http#" rdf:parseType="Literal"><html xmlns="http://www.w3.org/TR/REC-html40"><head><title>Re: testDelete2</title></head><body></body></html></Body></rdf:Description></body></rdf:Description><rdf:Description rdf:about="http://maenad-auselit.cloud.itee.uq.edu.au/danno/annotea/779E2F992157FDC9"><rdf:type rdf:resource="http://www.w3.org/2001/03/thread#Reply"/><rdf:type rdf:resource="http://www.w3.org/2000/10/annotationType#Comment"/><inReplyTo xmlns="http://www.w3.org/2001/03/thread#" rdf:resource="http://maenad-auselit.cloud.itee.uq.edu.au/danno/annotea/7BCB16D60FA6BEE9"/><root xmlns="http://www.w3.org/2001/03/thread#" rdf:resource="http://maenad-auselit.cloud.itee.uq.edu.au/danno/annotea/7BCB16D60FA6BEE9"/><language xmlns="http://purl.org/dc/elements/1.1/">en</language><title xmlns="http://purl.org/dc/elements/1.1/">Re: testDelete2_2</title><creator xmlns="http://purl.org/dc/elements/1.1/">Test User</creator><created xmlns="http://www.w3.org/2000/10/annotation-ns#">2010-03-21T18:09:55.023-07:00</created><modified xmlns="http://www.w3.org/2000/10/annotation-ns#">Mon Mar 22 2010 11:23:56 GMT+1000</modified><body xmlns="http://www.w3.org/2000/10/annotation-ns#"><rdf:Description><ContentType xmlns="http://www.w3.org/1999/xx/http#">text/html</ContentType><Body xmlns="http://www.w3.org/1999/xx/http#" rdf:parseType="Literal"><html xmlns="http://www.w3.org/TR/REC-html40"><head><title>Re: testDelete2_2</title></head><body></body></html></Body></rdf:Description></body></rdf:Description></rdf:RDF>',
			"chrome://loretest/content/bullstory.html", function(result, msg){
				loreController.anno.lore.debug.anno(": " + result + ", " + msg);
			});
			controller.sleep(2000);
			// setup up anno node name map
			annoController.initTestNodeMap();
		} catch(e){
			controller.window.alert(e);
		}
		 
	}
	
	var teardownModule = function ( module ) {
		annoController.deleteAllInStore();
		loreController.pushPopTestPreferences(false);
	}
	
	var setupTest = function(test){
		loreController.anno.lore.anno.annoMan.annodsunsaved.removeAll();
		loreController.anno.lore.anno.ui.page.setCurrentAnno();
	}
	
	var teardownTest = function(test){
		annoController.hideEditorClick();
		loreController.anno.lore.anno.annoMan.annodsunsaved.removeAll();
		loreController.anno.lore.anno.ui.page.setCurrentAnno();
	}
	

	 
	var testAdd = function(){
		 annoController.addAnnotation(1);
	}
	
	var testAddMultiple = function () {
		annoController.addAnnotation(3); 	
		annoController.addAnnotation(10); 	 
	}

	var testAddReply = function () {
		var expected = {
				type: "Comment",
				title: "Re: testReply",
				creator: loreController.testPreferences.dccreator,
				body: ''
			};
		annoController.replyToAnnotation(1, annoController.testNodeMap['testReply'], expected);
	}
	
	var testAddReplyMultiple = function(){
		var expected = {
				type: "Comment",
				title: "Re: testReplyMultiple",
				creator: loreController.testPreferences.dccreator,
				body: ''
		};
		annoController.replyToAnnotation(3	, annoController.testNodeMap['testReplyMultiple'], expected);
		annoController.replyToAnnotation(10, annoController.testNodeMap['testReplyMultiple'], expected);
	}
	
	var testReplyViaContextMenu = function () {
		var expected = {
				type: "Comment",
				title: "Re: testReply",
				creator: loreController.testPreferences.dccreator,
				body: ''
		};
		var node = annoController.testNodeMap['testReply']
		annoController.replyToAnnotation(1, node, expected, function () {annoController.replyContextMenuClick(node);});	
	}
		
	// remove an unsaved annotation
	var testDeleteUnsaved = function () {
		annoController.deleteUnsaved(1);
	}
	
	var testDeleteUnsavedMultiple = function() {
		annoController.deleteUnsaved(3);
		annoController.deleteUnsaved(10);
	}
	 
	
	var testDelete = function () {
		// delete a leaf node
 		annoController.deleteAnnotation(annoController.testNodeMap['testDelete']);

		// attempt to delete an annotation with replies
		var node = annoController.testNodeMap['testDelete2'];
		annoController.waitForCurrentAnnoSelection(function (){annoController.treeNodeClick(node);},
												loreController.anno.lore.anno.ui.page, 5000, 100);
		annoController.deleteClick();
		controller.sleep(100); // wait for messagebox pop-up
		var treeroot = loreController.anno.lore.anno.ui.treeroot;
		var oldLength = treeroot.childNodes.length;
		loreController.waitForTreeNodeRemoval(annoController.clickYesDeleteDialog, treeroot, 5000, 100, true);
		var newLength = treeroot.childNodes.length;
		jumlib.assertTrue(oldLength == newLength, "Node has not been deleted. old: " + oldLength + " new: " + newLength);
	}

	var testDeleteReply = function () {

		var replyNode = annoController.testNodeMap['Re: testDelete2'];
		var parent = replyNode.parentNode;

		replyNode.ensureVisible();

		var oldParLength = parent.childNodes.length;
		annoController.deleteAnnotation(replyNode);
		var newParLength = parent.childNodes.length;
		jumlib.assertTrue ( oldParLength -1 == newParLength, "Parent node reply count reduced. Old: " + oldParLength + " new: " + newParLength);
	}
	
	var testDeleteUnsavedViaEditorPanel = function () {
		annoController.deleteUnsaved(1, annoController.deleteInEditorClick); 
	}
	
	var testDeleteViaEditorPanel = function () {
		// delete a leaf node

		var delInEditor = function () {
			// TODO: these two lines also used in editorview, rip out as a sep func.
			annoController.editClick();
			// editor panel should appear
			controller.waitForElement(new elementslib.ID(loreController.annoDoc, "annotationslistform_annotationsform"), 5000);
			annoController.deleteInEditorClick();
		}
		annoController.deleteAnnotation(annoController.testNodeMap['testDeleteViaEditorPanel'], annoController.delInEditor);
		
	}
	
	
	var testDblClickEditAndHide = function () {
		var node = annoController.testNodeMap['testEdit'];
		
		annoController.treeNodeDblClick(node);
		// editor panel should appear
		controller.waitForElement(new elementslib.ID(loreController.annoDoc, "annotationslistform_annotationsform"), 5000);
		annoController.hideEditorClick();
		jumlib.assertFalse(loreController.anno.lore.anno.ui.formpanel.isVisible(), "Editor Panel is hidden.");
	}
	
	var testEditViaContextMenu = function () {
		var node = annoController.testNodeMap['testEdit'];
		annoController.editContextMenuClick(node);
		controller.waitForElement(new elementslib.ID(loreController.annoDoc, "annotationslistform_annotationsform"), 5000);
	}
	
	var testEdit = function () {
		var node = annoController.testNodeMap['testEdit'];
		annoController.editAnnotation(node, {
			title: 'testEdit',
			body: "Test Edit 1",  
			type: "Comment", 
			selection: 'The Bulletin Story Book',
			creator: loreController.testPreferences.dccreator
		});
	}
	
	
	
	 var testSaveNewAnnotations = function(){
	
		// save a new annotation
		var unsavedNode = annoController.addAnnotation(1)[0];
		annoController.hideEditorClick();
		annoController.saveAnnotation([unsavedNode], [{
			type: "Comment",
			title: "New Annotation",
			body: "",
			selection: '',
			creator: loreController.testPreferences.dccreator
		}]);
	}
	
	var testSaveExistingAnnotation = function () { 
		
		// save an existing modified annotation
	 
		var node = annoController.testNodeMap['testSave'];
		
		var changes =  {
				title: 'Modified Title testSave',
				type: "Comment", 
				body: "Modified Body",
				creator: loreController.testPreferences.dccreator,
				selection:  'The  Procession of Egos'
							 
			}

		unsavedNode = annoController.editAnnotation(node, {
		 title:		"testSave",
		 body: 		"testSave 1",
		 type: 		"Comment",
		 selection: 'The  Procession of Egos',
		 creator: 	loreController.testPreferences.dccreator
		 }, changes);
		 
		 annoController.saveAnnotation([unsavedNode], [changes]);
	}

	var testSaveViaEditor = function () {
		var unsavedNode = annoController.addAnnotation(1)[0];
		annoController.saveAnnotation([unsavedNode], [{
			type: "Comment",
			title: "New Annotation",
			body: "",
			selection: '',
			creator: loreController.testPreferences.dccreator
		}], annoController.saveInEditorClick );
	}
	
	
	
	var testSaveAllNewAnnotations = function(){
		// save multiple new annotations
		var unsavedNodes = annoController.addAnnotation(3);
		var values = [{
			type: "Comment",
			title: "New Annotation",
			body: "",
			selection: '',
			creator: loreController.testPreferences.dccreator
		}];
		values.push(values[0]);
		values.push(values[0]);
		annoController.hideEditorClick();
		
		annoController.saveAnnotation(unsavedNodes, values);
	}
		
	var testSaveAllExisting = function () {	
		// save multiple existing annotations

		var unsavedNodes = [];
		
		var node = annoController.testNodeMap['testSaveAll_1'];
		
		var changes =  [{
				title: 'Modified Title testSave',
				type: "Comment", 
				body: "Modified Body",
				creator: loreController.testPreferences.dccreator,
				selection:  null
		}];
		var c = lore.util.clone(changes[0]);
		changes.push(c);

		unsavedNodes.push( annoController.editAnnotation(node, {
		 title:		"testSaveAll_1",
		 body: 		"testSaveAll_1",
		 type: 		"Comment",
		 selection: null,
		 creator: 	loreController.testPreferences.dccreator
		 }, changes[0]));
		 
		unsavedNodes.push( annoController.editAnnotation(node.nextSibling, {
		 title:		"testSaveAll_2",
		 body: 		"testSaveAll_2",
		 type: 		"Comment",
		 selection: null,
		 creator: 	loreController.testPreferences.dccreator
		 }, changes[1]));
		
		annoController.saveAnnotation(unsavedNodes, changes);
	}

	
	// This operation is testing in the highlighting testing module
	// var testToggleHighlightAll = function () {}
	// var testExportAnnotation = function () {} - Not Worthing test via GUI
	
} catch (e ) {
	controller.window.alert(e);
}

 
