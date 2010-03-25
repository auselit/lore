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
	
	var lore = {
		global: {}
	};
	
	Components.utils.import("resource://lore/util.js", lore.global);
	Components.utils.import("resource://loretest/mozmill/modules/LoreController.js");
	Components.utils.import("resource://loretest/mozmill/modules/AnnotationTestController.js");
	Components.utils.import("resource://lore/debug.js", lore);
	
	var setupModule = function ( module ) {
		try {
			controller = mozmill.getBrowserController();
			loreController = LoreController.init(controller, elementslib);
			annoController = AnnotationTestController.init(controller, loreController, elementslib);
			//lore.global.store.setCaching(false);
			loreController.openLore();
			loreController.pushPopTestPreferences(true);
			// Set up testing data
			annoController.importRDF(	//TODO: Read this RDF from file
			'<?xml version="1.0" ?><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="http://maenad-auselit.cloud.itee.uq.edu.au/danno/annotea/FFE753C70C5FF60A"><rdf:type rdf:resource="http://www.w3.org/2000/10/annotation-ns#Annotation"/><rdf:type rdf:resource="http://www.w3.org/2000/10/annotationType#Comment"/><annotates xmlns="http://www.w3.org/2000/10/annotation-ns#" rdf:resource="chrome://loretest/content/bullstory.html"/><language xmlns="http://purl.org/dc/elements/1.1/">en</language><title xmlns="http://purl.org/dc/elements/1.1/">testViewHighlighting</title><creator xmlns="http://purl.org/dc/elements/1.1/">Test User</creator><created xmlns="http://www.w3.org/2000/10/annotation-ns#">2010-03-22T01:17:38.224-07:00</created><modified xmlns="http://www.w3.org/2000/10/annotation-ns#">Mon Mar 22 2010 18:33:20 GMT+1000</modified><context xmlns="http://www.w3.org/2000/10/annotation-ns#">chrome://loretest/content/bullstory.html#xpointer(string-range(/html[1]/body[1]/div[1]/h1[1], "", 1, 23))</context><body xmlns="http://www.w3.org/2000/10/annotation-ns#"><rdf:Description><ContentType xmlns="http://www.w3.org/1999/xx/http#">text/html</ContentType><Body xmlns="http://www.w3.org/1999/xx/http#" rdf:parseType="Literal"><html xmlns="http://www.w3.org/TR/REC-html40"><head><title>testViewHighlighting</title></head><body><br xmlns="http://www.w3.org/1999/xhtml" /></body></html></Body></rdf:Description></body></rdf:Description></rdf:RDF>',
			"chrome://loretest/content/bullstory.html", function(result, msg){
				lore.debug.anno(": " + result + ", " + msg);
			});
			controller.refresh();
			// wait for any handlers that listen to refresh events to activate
			controller.sleep(1000);
			annoController.initTestNodeMap();

			
			
		} catch(e){
			lore.debug.anno("setupModule(): " +e,e);
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
		var sel = lore.global.util.getContentWindow(controller.window).getSelection();
		if (sel.rangeCount > 0) 
			sel.removeAllRanges();
		
	}
	
	var testViewHighlighting = function () {
		// click on an existing annotation
		annoController.waitForCurrentAnnoSelection(function(){
				annoController.treeNodeClick(annoController.testNodeMap['testViewHighlighting']);
			}, loreController.anno.lore.anno.ui.page, 5000, 100);

					
		// check highlight appears
		var highlightElem = new elementslib.XPath(controller.tabs.activeTab, "/html/body/div/h1/span");
		
		controller.assertNode(highlightElem);
		controller.assertText(highlightElem, "The Bulletin Story Book");
		//controller.assertProperty(highlightElem, '_dom_ignore_element_', true);
		// don't check for visual characteristics such as background colour and underline as they may change
		
	 
		// check that pop up appears when hovering over highlight
		controller.mouseOver(highlightElem);
		controller.sleep(500); // wait for the pop-up to be rendered
		var elem = new elementslib.XPath(controller.tabs.activeTab, "/html/body/div[2]");
		controller.assertNode(elem);
		var node = lore.global.util.getNodeForXPath("/html/body/div[2]", lore.global.util.getContentWindow(controller.window).document);
		jumlib.assertEquals(node.style.display, 'block', 'Pop up node exists and is visible');
		
		// check that pop up closes
		controller.click(new elementslib.XPath(controller.tabs.activeTab, "/html/body/div[2]/img[1]"));
		controller.sleep(500);
		node = lore.global.util.getNodeForXPath("/html/body/div[2]",lore.global.util.getContentWindow(controller.window).document);
		jumlib.assertEquals(node.style.display, 'none', 'Pop up node is not visible');
			
		// check that highlighting disappears when focus is taken off annotation
		lore.debug.anno('about to add an annotation, should NOT hsave setCurrentAnno call yet');
		annoController.addAnnotation(1);
		controller.assertNodeNotExist(highlightElem);
	 
	 	lore.debug.anno('setCurAnno() should be called after this.');
		// re-select and then delete
		annoController.waitForCurrentAnnoSelection(function(){
				annoController.treeNodeClick(annoController.testNodeMap['testViewHighlighting']);
			}, loreController.anno.lore.anno.ui.page, 5000, 100);

		lore.debug.anno('setCurAnno() should be called before this.');
		// check highlighting appears again
		var highlightElem = new elementslib.XPath(controller.tabs.activeTab, "/html/body/div/h1/span");
		controller.assertNode(highlightElem);
		
		// delete annotation, ensuring highlight disappears off page
		annoController.deleteAnnotation(annoController.testNodeMap['testViewHighlighting'], null, true);
		controller.assertNodeNotExist(highlightElem);
		
	}
	
	
	
	//TODO: Some further testing of the highlighting pop-up such as position in regards to 
	// pop-ups appearing near the window borders, containing large amounts of text.
	
	var testAddWithHighlighting = function(){
		// /html/body/div/h4  == "The  Procession of Egos."
		var document = lore.global.util.getContentWindow(controller.window).document;
		var node = document.getElementsByTagName("h4")[0];  

		annoController.setTextSelection(node);
		var unsavedNode = annoController.addAnnotation(1, "The  Procession of Egos.");
		
		//TODO: Could also save the Annotation and check that it appears with the new context given but
		// this overlaps with some of the SaveExistingAnnotation/s tests ( which have a context selected).
	}
	
	var testAddWithHighlightingViaContextMenu = function () {
		
		// test 'create annotation with selection' menu works
		var document = lore.global.util.getContentWindow(controller.window).document;
		var node = document.getElementsByTagName("h4")[0];  

		annoController.setTextSelection(node);
		controller.rightClick(new elementslib.Elem(node));
		var unsavedNode = annoController.addAnnotation(1, "The  Procession of Egos.",	function(){
			controller.waitThenClick(new elementslib.ID(controller.window.document, "addanno-lore"))
		});
	}
	
	
	
	
	var testUpdateContext = function () {
		var unsavedNode = annoController.addAnnotation(1);
		
		var document = lore.global.util.getContentWindow(controller.window).document;
		var node = document.getElementsByTagName("h4")[0];  
		annoController.setTextSelection(node);
			
		controller.sleep(500);
		// editor panel should be visible from recent add operation
		controller.waitForElement(new elementslib.ID(annoController.annoDoc, "annotationslistform_annotationsform"), 5000);
		controller.click(new elementslib.ID(controller.window.frames[3].document, "ext-gen60"));
		controller.sleep(500);
		loreController.assertValues(annoController.annoDoc, {
			"annotationslistform_contextdisp": '"The  Procession of Egos."'
		});
	}
	
	var testUpdateContextViaContextMenu = function(){
		var unsavedNode = annoController.addAnnotation(1);
		
		var document = lore.global.util.getContentWindow(controller.window).document;
		var node = document.getElementsByTagName("h4")[0];  
		annoController.setTextSelection(node);
			
		controller.sleep(500);
		controller.rightClick(new elementslib.Elem(node));
		controller.waitThenClick(new elementslib.ID(controller.window.document, "modannosel-lore"));
		controller.sleep(500);
		loreController.assertValues(annoController.annoDoc, {
			"annotationslistform_contextdisp": '"The  Procession of Egos."'
		});
		
	}
	
	var testImageHighlightingEnabled = function () {
		var doc = lore.global.util.getContentWindow(controller.window).document;
		var node = doc.getElementById("lore_image_highlighting_inserted");
		jumlib.assertNotNull(node, "Image highlighting is enabled");
		
	}
	
	
	var testViewImageHighlighting = function () {
		// Set up testing data
		annoController.importRDF(	//TODO: Read this RDF from file
			'<?xml version="1.0" ?><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="http://maenad-auselit.cloud.itee.uq.edu.au/danno/annotea/244B84B2E63F065F"><rdf:type rdf:resource="http://www.w3.org/2000/10/annotation-ns#Annotation"/><rdf:type rdf:resource="http://www.w3.org/2000/10/annotationType#Comment"/><annotates xmlns="http://www.w3.org/2000/10/annotation-ns#" rdf:resource="chrome://loretest/content/centennial_park.htm"/><language xmlns="http://purl.org/dc/elements/1.1/">en</language><title xmlns="http://purl.org/dc/elements/1.1/">testViewImageHighlighting</title><creator xmlns="http://purl.org/dc/elements/1.1/">Test User</creator><created xmlns="http://www.w3.org/2000/10/annotation-ns#">2010-03-23T00:08:18.973-07:00</created><modified xmlns="http://www.w3.org/2000/10/annotation-ns#">Tue Mar 23 2010 17:39:05 GMT+1000</modified><context xmlns="http://www.w3.org/2000/10/annotation-ns#">chrome://loretest/content/centennial_park.htm#xpointer(image-range(id("DataListItem_ctl00_imgItem"),[80,58],[545,114],"chrome://loretest/content/centennial_park_files/a195001h.jpg"))</context><body xmlns="http://www.w3.org/2000/10/annotation-ns#"><rdf:Description><ContentType xmlns="http://www.w3.org/1999/xx/http#">text/html</ContentType><Body xmlns="http://www.w3.org/1999/xx/http#" rdf:parseType="Literal"><html xmlns="http://www.w3.org/TR/REC-html40"><head><title>testViewImageHighlighting</title></head><body></body></html></Body></rdf:Description></body></rdf:Description><rdf:Description rdf:about="http://maenad-auselit.cloud.itee.uq.edu.au/danno/annotea/D0691DBC6666C35D"><rdf:type rdf:resource="http://www.w3.org/2000/10/annotation-ns#Annotation"/><rdf:type rdf:resource="http://www.w3.org/2000/10/annotationType#Comment"/><annotates xmlns="http://www.w3.org/2000/10/annotation-ns#" rdf:resource="chrome://loretest/content/centennial_park.htm"/><language xmlns="http://purl.org/dc/elements/1.1/">en</language><title xmlns="http://purl.org/dc/elements/1.1/">testViewImageHighlighting_2</title><creator xmlns="http://purl.org/dc/elements/1.1/">Test User</creator><created xmlns="http://www.w3.org/2000/10/annotation-ns#">2010-03-23T00:09:07.552-07:00</created><modified xmlns="http://www.w3.org/2000/10/annotation-ns#">Tue Mar 23 2010 17:39:05 GMT+1000</modified><context xmlns="http://www.w3.org/2000/10/annotation-ns#">chrome://loretest/content/centennial_park.htm#xpointer(image-range(id("DataListItem_ctl00_imgItem"),[71,269],[186,299],"chrome://loretest/content/centennial_park_files/a195001h.jpg"))</context><body xmlns="http://www.w3.org/2000/10/annotation-ns#"><rdf:Description><ContentType xmlns="http://www.w3.org/1999/xx/http#">text/html</ContentType><Body xmlns="http://www.w3.org/1999/xx/http#" rdf:parseType="Literal"><html xmlns="http://www.w3.org/TR/REC-html40"><head><title>testViewImageHighlighting_2</title></head><body><br xmlns="http://www.w3.org/1999/xhtml" /></body></html></Body></rdf:Description></body></rdf:Description><rdf:Description rdf:about="http://maenad-auselit.cloud.itee.uq.edu.au/danno/annotea/55EADD71627C6532"><rdf:type rdf:resource="http://www.w3.org/2000/10/annotation-ns#Annotation"/><rdf:type rdf:resource="http://www.w3.org/2000/10/annotationType#Comment"/><annotates xmlns="http://www.w3.org/2000/10/annotation-ns#" rdf:resource="chrome://loretest/content/centennial_park.htm"/><language xmlns="http://purl.org/dc/elements/1.1/">en</language><title xmlns="http://purl.org/dc/elements/1.1/">testViewImageHighlighting_text_1</title><creator xmlns="http://purl.org/dc/elements/1.1/">Test User</creator><created xmlns="http://www.w3.org/2000/10/annotation-ns#">2010-03-23T00:09:49.194-07:00</created><modified xmlns="http://www.w3.org/2000/10/annotation-ns#">Tue Mar 23 2010 17:39:05 GMT+1000</modified><context xmlns="http://www.w3.org/2000/10/annotation-ns#">chrome://loretest/content/centennial_park.htm#xpointer(string-range(/html[1]/body[1]/form[1]/div[2]/div[1]/table[1]/tbody[1]/tr[2]/td[1]/table[1]/tbody[1]/tr[1]/td[2]/div[1]/table[1]/tbody[1]/tr[1]/td[1]/table[1]/tbody[1]/tr[1]/td[2]/b[1], "", 1, 7))</context><body xmlns="http://www.w3.org/2000/10/annotation-ns#"><rdf:Description><ContentType xmlns="http://www.w3.org/1999/xx/http#">text/html</ContentType><Body xmlns="http://www.w3.org/1999/xx/http#" rdf:parseType="Literal"><html xmlns="http://www.w3.org/TR/REC-html40"><head><title>testViewImageHighlighting_text_1</title></head><body><br xmlns="http://www.w3.org/1999/xhtml" /></body></html></Body></rdf:Description></body></rdf:Description><rdf:Description rdf:about="http://maenad-auselit.cloud.itee.uq.edu.au/danno/annotea/0E37F81140A5BDB3"><rdf:type rdf:resource="http://www.w3.org/2000/10/annotation-ns#Annotation"/><rdf:type rdf:resource="http://www.w3.org/2000/10/annotationType#Comment"/><annotates xmlns="http://www.w3.org/2000/10/annotation-ns#" rdf:resource="chrome://loretest/content/centennial_park.htm"/><language xmlns="http://purl.org/dc/elements/1.1/">en</language><title xmlns="http://purl.org/dc/elements/1.1/">testViewImageHighlighting_text_2</title><creator xmlns="http://purl.org/dc/elements/1.1/">Test User</creator><created xmlns="http://www.w3.org/2000/10/annotation-ns#">2010-03-23T00:10:08.214-07:00</created><modified xmlns="http://www.w3.org/2000/10/annotation-ns#">Tue Mar 23 2010 17:39:05 GMT+1000</modified><context xmlns="http://www.w3.org/2000/10/annotation-ns#">chrome://loretest/content/centennial_park.htm#xpointer(string-range(/html[1]/body[1]/form[1]/div[2]/div[1]/table[1]/tbody[1]/tr[2]/td[1]/table[1]/tbody[1]/tr[1]/td[2]/div[1]/table[1]/tbody[1]/tr[1]/td[1]/table[2]/tbody[1]/tr[2]/td[2]/b[1], "", 1, 16))</context><body xmlns="http://www.w3.org/2000/10/annotation-ns#"><rdf:Description><ContentType xmlns="http://www.w3.org/1999/xx/http#">text/html</ContentType><Body xmlns="http://www.w3.org/1999/xx/http#" rdf:parseType="Literal"><html xmlns="http://www.w3.org/TR/REC-html40"><head><title>testViewImageHighlighting_text_2</title></head><body><br xmlns="http://www.w3.org/1999/xhtml" /></body></html></Body></rdf:Description></body></rdf:Description></rdf:RDF>',
			"chrome://loretest/content/centennial_park.htm", function(result, msg){
				lore.debug.anno(": " + result + ", " + msg);
			});
		annoController.initTestNodeMap();	
		
		
		annoController.waitForCurrentAnnoSelection(function(){
				annoController.treeNodeClick(annoController.testNodeMap['testViewImageHighlighting']);
			}, loreController.anno.lore.anno.ui.page, 5000, 100);

					
		// check highlight appearsmozmill.getBrowserController()
 		controller.sleep(100);
		var highlightElem = new elementslib.XPath(controller.tabs.activeTab, "/html/body/span[2]");
		controller.assertNode(highlightElem);
		
		var document = lore.global.util.getContentWindow(controller.window).document;
	 
		// check that pop up appears when hovering over highlight
		controller.mouseOver(highlightElem);
		controller.sleep(500); // wait for the pop-up to be rendered
		var elem = new elementslib.XPath(controller.tabs.activeTab, "/html/body/div");
		controller.assertNode(elem);
		var node = lore.global.util.getNodeForXPath("/html/body/div", document);
		jumlib.assertEquals(node.style.display, 'block', 'Pop up node exists and is visible');
		
		// check that pop up closes
		
		/* The automated testing is having issues with this, however it's not apparent when done manually
		   so this is more an issue with using mozmill
		controller.click(new elementslib.XPath(controller.tabs.activeTab, "/html/body/div/img[1]"));
		node = lore.global.util.getNodeForXPath("/html/body/div", document);
		jumlib.assertEquals(node.style.display, 'none', 'Pop up node is not visible');*/
		
		// check that highlighting disappears when focus is taken off annotation
		annoController.addAnnotation(1);
		controller.assertNodeNotExist(highlightElem);
		controller.sleep(2000);	 

		// re-select and then delete
		annoController.waitForCurrentAnnoSelection(function(){
				annoController.treeNodeClick(annoController.testNodeMap['testViewImageHighlighting']);
			}, loreController.anno.lore.anno.ui.page, 5000, 100);


		// check highlighting appears again
		var highlightElem = new elementslib.XPath(controller.tabs.activeTab, "/html/body/span[2]");
		controller.assertNode(highlightElem);
		
		// delete annotation, ensuring highlight disappears off page
		annoController.deleteAnnotation(annoController.testNodeMap['testViewImageHighlighting'], null, true);
		controller.assertNodeNotExist(highlightElem);
		
		annoController.deleteAllInStore();
		controller.open("chrome://loretest/content/bullstory.html");
		controller.waitForPageLoad(this.controller.tabs.activeTab);
		annoController.initTestNodeMap();
	}
	
	
	/* TODO: Further work needs to be done to mimic a mousedown, drag, and mouseup for selection, if it's possible  
	var testAddWithImageHighlighting = function() {
		controller.open("chrome://loretest/content/centennial_park.htm");
		controller.waitForPageLoad(this.controller.tabs.activeTab);
		
		 
		var window = lore.global.util.getContentWindow(controller.window);
		var document = window.document;
		
		var fireOnThis = document.getElementById('DataListItem_ctl00_imgItem');
		var evObj = document.createEvent('MouseEvents');
		var clientX = 10;
		var clientY = 10;
		var screenX = fireOnThis.offsetLeft + clientX;
		var screenY = fireOnThis.offsetTop + clientY;
		
		evObj.initMouseEvent( 'mousemove', true, true, window, 1, screenX, screenY, clientX, clientY, false, false, true, false, 0, null );
		fireOnThis.dispatchEvent(evObj);
		controller.sleep(1000);
		evObj = document.createEvent('MouseEvents');
		
		evObj.initMouseEvent( 'mousedown', true, true, window, 1, screenX, screenY, clientX, clientY, false, false, true, false, 0, null );
		fireOnThis.dispatchEvent(evObj);
		controller.sleep(1000);
		clientX= clientY = 40;
		screenX = fireOnThis.offsetLeft + clientX;
		screenY = fireOnThis.offsetTop  + clientY;
		evObj = document.createEvent('MouseEvents');
		evObj.initMouseEvent( 'mousemove', true, true, window, 1, screenX, screenY, clientX, clientY, false, false, true, false, 0, null );
		fireOnThis.dispatchEvent(evObj);
		controller.sleep(1000);
		evObj = document.createEvent('MouseEvents');
		evObj.initMouseEvent( 'mouseup', true, true, window, 1, screenX, screenY, clientX, clientY, false, false, true, false, 0, null );
		fireOnThis.dispatchEvent(evObj);
		
		
		
	//	controller.click(new elementslib.ID(controller.tabs.activeTab, "DataListItem_ctl00_imgItem"),0, 0);
		
		controller.sleep(5000);
		
	
		controller.open("chrome://loretest/content/bullstory.html");
		controller.waitForPageLoad(this.controller.tabs.activeTab);
		
	}*/
	
}  catch (e ) {
	controller.window.alert(e);
}
