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

/*
 * @include  "/oaiorebuilder/content/annotations/model/AnnotationManager.js"
 * @include  "/oaiorebuilder/content/annotations/model/PageData.js"
 * @include  "/oaiorebuilder/content/annotations/ui/PageView.js"
 * @include  "/oaiorebuilder/content/annotations/ui/Marker.js"
 * @include  "/oaiorebuilder/content/annotations/ui/EditorPanel.js"
 * @include  "/oaiorebuilder/content/annotations/ui/ColumnTree.js"
 * @include  "/oaiorebuilder/content/annotations/ui/SearchPanel.js"
 * @include  "/oaiorebuilder/content/annotations/ui/TimelinePanel.js"
 * @include  "/oaiorebuilder/content/annotations/model/Preferences.js"
 * @include  "/oaiorebuilder/content/debug.js"
 * @include  "/oaiorebuilder/content/util.js"
 * @include  "/oaiorebuilder/content/uiglobal.js"
 * @include  "/oaiorebuilder/content/constants.js"
 */

	
	
/* Methods called by the topView (overlay.js) */

/**
 * Show the annotations view. Notify of location change
 * if it happened and show page elements
 */
lore.anno.ui.show = function(){
	lore.anno.ui.lorevisible = true;
	
	if (lore.anno.ui.currentURL && lore.anno.ui.currentURL != 'about:blank' &&
	lore.anno.ui.currentURL != '' &&
	(!lore.anno.ui.loadedURL || lore.anno.ui.currentURL != lore.anno.ui.loadedURL)) {
		lore.anno.ui.handleLocationChange(lore.anno.ui.currentURL);
	}
	lore.anno.ui.pageui.setContentsVisible(true);
}

/**
 * Hide the annotations view
 */
lore.anno.ui.hide = function(){
	lore.anno.ui.lorevisible = false;
	lore.anno.ui.pageui.setContentsVisible(false);
}

/**
 * Hide the variation splitter window 
 */
lore.anno.ui.hideVariationSplitter = function () {
	lore.anno.ui.pageui.removeHighlightForCurrentAnnotation(lore.anno.ui.topView.getVariationContentWindow());
}

/**
 * Detemerine whether any annotations are modified 
 */
lore.anno.ui.hasModifiedAnnotations = function () {
	lore.anno.ui.updateAnnoFromForm();
	return lore.anno.annoMan.annodsunsaved.getCount() > 0;
}
/**
 * Get the currently selected image
 */
lore.anno.ui.getCurSelImage = function () {
	return lore.anno.ui.pageui.getCurSelImage();
}
/**
 * Get the currently selected annotation
 */
lore.anno.ui.getCurrentAnno = function () {
	return lore.anno.ui.page.curSelAnno;
}

/**
 * Get the currently edited annotation
 */
lore.anno.ui.getCurrentEditedAnno = function() {
	return lore.anno.ui.formpanel.getRec();
}
		
/**
 * Find a node with the given id 
 * @param {Object} id
 * @param {Object} tree
 */
lore.anno.ui.findNode = function (id, tree){
	if( tree) {
		return lore.global.util.findChildRecursively( tree, 'id', id);
	}
	var n = lore.global.util.findChildRecursively( lore.anno.ui.treeunsaved, 'id', id + "-unsaved");
	if (!n ) 
		n = lore.global.util.findChildRecursively(lore.anno.ui.treeroot, 'id', id );
	return n;
}

/**
 * Make node visible and selected in tree panel and show the editor panel
 * @param {Object} rec
 */
lore.anno.ui.selectAndShowNode = function (rec) {
		var node = lore.anno.ui.findNode(rec.data.id);
		
		lore.anno.ui.page.setCurrentAnno(rec);
		if (node) {
			lore.anno.ui.formpanel.show(rec);
			node.ensureVisible();
			node.select();
		}
		// Necessary due to a bug in Ext related to drawing text fields
		// Should be fixed in Ext 3.2.1
		Ext.getCmp("treeview").doLayout();
}

/**
 * Show the variation splitter for the current/supplied annotation
 * @param {Record} rec (Optional)The annotation to show in the splitter window. Defaults to currently
 * selected annotation
 */
lore.anno.ui.showSplitter = function (rec) {
	if (!rec) {
		rec = lore.anno.ui.page.curSelAnno;
	} else if ( typeof(rec) == 'string') {
		rec = lore.anno.annoMan.findStoredRecById(rec);
	}
	var editor = lore.anno.ui.formpanel;
	lore.anno.ui.pageui.updateSplitter(rec, true, editor.updateSplitterContextField, editor);
}

/**
 * Update the annotation context in the editor panel
 */
lore.anno.ui.handleUpdateAnnotationContext = function () {
	lore.anno.ui.formpanel.handleUpdateAnnotationContext(lore.anno.ui.formpanel);
	lore.anno.ui.show();
	Ext.getCmp("treeview").doLayout();
}

/**
 * Update the variation annotation context in the editor panel
 */	
lore.anno.ui.handleUpdateVariationAnnotationContext = function () {
	lore.anno.ui.formpanel.handleUpdateVariationAnnotationContext(lore.anno.ui.formpanel);
	lore.anno.ui.show();
	Ext.getCmp("treeview").doLayout();
}


/* Form Editor Methods */

/**
 * Hide the annotation editor
 */
lore.anno.ui.hideAnnotationEditor = function() {
	if ( lore.anno.ui.formpanel.isVisible() ) {
		lore.anno.ui.formpanel.hide();
		Ext.getCmp("treeview").doLayout();
	}
	lore.anno.ui.formpanel.clearPanel();
}

/**
 * Update the annotation object to use the values from the
 * form and generate an unsaved tree node if the record has been 
 * modified.
 */
lore.anno.ui.updateAnnoFromForm = function(){
	var form = lore.anno.ui.formpanel.form;


	var unsavedRec = lore.anno.ui.formpanel.getRec();
	
	if (!unsavedRec) {
		return;
	}
	
	if (form.isDirty()) {
		if (unsavedRec.store === lore.anno.annoMan.annods) {
			lore.debug.anno("ERROR: Should never be trying to update Stored Recs!");
		}
	}
	
	if (unsavedRec)
		form.updateRecord(unsavedRec); // update from form
}

lore.anno.ui.updateAnnoForSave = function() {
	var unsavedRec = lore.anno.ui.formpanel.getRec();
	
	if (!unsavedRec) {
		return;
	}
	
	unsavedRec = lore.anno.annoMan.findStoredRecById(unsavedRec.data.id);
	
	if (unsavedRec)
		lore.anno.ui.formpanel.form.updateRecord(unsavedRec); // update from form
}
				
/*
 * Event Handlers
 */

/**
  * Update the enablement of the annotations when the preferences
  * change
  * @param {Object} args
  */
lore.anno.ui.handlePrefsChange = function (args ) {
	lore.anno.ui.disableUIFeatures({disable: args.disable});
    lore.global.util.setHighContrast(window, args.high_contrast);
}

/**
 * Attach context menu to a node and, attach events to menu items when tree node is added
 * @param {TreePanel} tree Parent Tree  
 * @param {TreeNode} parent Parent Node
 * @param {TreeNode} childNode The tree node to attach the events to
 * @param {Integer} index Index of Node in Tree
 */

lore.anno.ui.handleAttachAnnoCtxMenuEvents = function(tree, parent, childNode, index){
	childNode.on('append', lore.anno.ui.handleAttachAnnoCtxMenuEvents);
	 
	childNode.on('contextmenu', function(node, e){
		node.select();
		lore.anno.ui.page.setCurrentAnno();
		
		if (!node.contextmenu) {
			node.contextmenu = new Ext.menu.Menu({id: node.id + "-context-menu" });
	 
			var rec = lore.global.util.findRecordById(lore.anno.annoMan.annods, lore.anno.ui.nodeIdToRecId(node));
			var isNew = (rec === null || rec.data.isNew());
			if (!isNew) {
				// only saved annotations should be in timeline or able to be replied to
				node.contextmenu.add({
					text: "Show in Timeline",
					handler: function(evt){
						lore.anno.ui.timeline.showAnnoInTimeline(node.id);
					},
					id:'timelineshow_' + node.id
				});
				node.contextmenu.add({
					text: "Reply to annotation",
					handler: function(evt){
						lore.anno.ui.handleReplyToAnnotation(node.id);
					},
					id: 'reply_' + node.id
				});
			}
			
			node.contextmenu.add({
				text: "Edit annotation",
				handler: function(evt){
					lore.anno.ui.handleEditTreeNode(node);
				},
				id: 'edit_' + node.id
			});
			
			node.contextmenu.add({
				text: "Delete annotation",
				handler: function(evt){
					lore.anno.ui.handleDeleteAnnotation(node);
				},
				id: 'del_' + node.id
			});
	
			if (!isNew) {
				// only saved annotations should be able to be added as a compound object
				node.contextmenu.add({
					text: "Add as node in compound object editor",
					handler: function(evt){
						try {
				            var rec = lore.global.util.findRecordById(lore.anno.annoMan.annods, lore.anno.ui.nodeIdToRecId(node));
							lore.global.ui.compoundObjectView.get(window.instanceId).addResource(lore.anno.ui.nodeIdToRecId(node),
				                {"rdf:type_0":rec.data.type});
						} catch (e ){
							lore.debug.anno("Error adding node to compound editor:" + e, e);
						}
					}
				});
			    node.contextmenu.add({
                    text: "View annotation in browser",
                    handler: function(evt) {
                        lore.global.util.launchTab(node.id + "?danno_useStylesheet");
                    }
                });
				if (node.nodeType == lore.constants.NAMESPACES["vanno"] + "VariationAnnotation") {
					node.contextmenu.add({
						text: "Show Variation Window",
						handler: function(evt){
							lore.anno.ui.showSplitter(lore.anno.ui.nodeIdToRecId(node));
						}
					});
				}
			}
		}
		
		node.contextmenu.on('hide', function unselectNode() {
			node.getOwnerTree().getSelectionModel().clearSelections();
		});
		node.contextmenu.showAt(e.xy);
	});
}

/**
 * Attach links in the 'Views' column for a tree node
 * @param {TreePanel} tree Parent Tree  
 * @param {TreeNode} parent Parent Node
 * @param {TreeNode} n The tree node to attach the events to
 * @param {Integer} index Index of node in tree
 */
lore.anno.ui.handleAttachNodeLinks = function(tree, thus, n, index){ 
	try {
		var anno = lore.global.util.findRecordById(lore.anno.annoMan.annods, n.id).data;
		
		var nodeLinks = [{
			title: 'View annotation body in a new window',
			iconCls: 'anno-icon-launchWindow',
			jscript: "lore.global.util.launchWindow('" + anno.bodyURL + "',false, window);"
		}, {
			title: 'View annotation in the timeline',
			iconCls: 'anno-icon-timeline',
			jscript: "lore.anno.ui.timeline.showAnnoInTimeline('" + anno.id + "');"
		}];
		
		if (lore.global.util.splitTerm(anno.type).term == 'VariationAnnotation') {
			nodeLinks.push({
				title: 'Show Variation Window',
				iconCls: 'anno-icon-splitter',
				jscript: "lore.anno.ui.showSplitter('" + anno.id + "');"
			});
		}
		n.links = nodeLinks;
	} catch(e ) {
		lore.debug.anno('append: ' + e, e);
	}
}

/**
 * When an annotation is selected in the tree this function is called. The annotation
 * is loaded into the form. It is highlighted on the current content window's document and if
 * it's a variation annotation the splitter is shown
 * @param {Node} node The tree node that was selected
 * @param {Object} event Not Used
 */
lore.anno.ui.handleTreeNodeSelection = function(node, event){
	try {
		// retrieve record for node
		var unsavedNode = node.isAncestor(lore.anno.ui.treeunsaved);
		var store = unsavedNode ? lore.anno.annoMan.annodsunsaved : lore.anno.annoMan.annods;
		var rec = lore.global.util.findRecordById(store, lore.anno.ui.nodeIdToRecId(node));
		
		if ( rec == lore.anno.ui.page.curSelAnno )
			return;
		
		lore.anno.ui.updateAnnoFromForm();
		
		if (rec == null) { // if they select root element, if it's shown 
			lore.anno.ui.page.setCurrentAnno();
			return;
		}
	
		// set current anno and fire anno change event
		
		lore.anno.ui.page.setCurrentAnno(rec);
		 
		Ext.getCmp("treeview").doLayout();
	} 
	catch (e) {
		lore.debug.anno("Error occurred highlighting", e);
	}

}

/**
 * Notification function called when a change in location is detected in the currently
 * selected tab
 * @param {String} contextURL The url the currently selected browser tab is now pointing to    
 */
lore.anno.ui.handleLocationChange = function(contextURL) {
		var oldurl = lore.anno.ui.currentURL + '';
		lore.anno.ui.currentURL = contextURL;
		// only run when annotations are visibile and initialized
		if (!lore.anno.ui.initialized ||	!lore.anno.ui.lorevisible)
				return;
			
		var initialLoad = oldurl == lore.anno.ui.currentURL;
					
		lore.debug.anno("handleLocationChange: The uri is " + lore.anno.ui.currentURL);
		
		if ( !initialLoad ) {
		try{
			// store current page data, save current annotation data
			lore.anno.ui.page.store(oldurl);
			lore.anno.ui.updateAnnoFromForm();
			
			// tag any unsaved annotations
			lore.anno.annoMan.annodsunsaved.each(function(rec){
				try {
					var node = lore.anno.ui.findNode(rec.data.id + "-unsaved", lore.anno.ui.treeunsaved);
					if (!node) {
						lore.debug.anno("modified/new annotation not found in unsaved tree. This is incorrect. " + rec.data.id, rec.data);
						return;
					}
					
					var label = ' ';
					if (rec.data.resource != lore.anno.ui.currentURL) {
						label = "Unsaved annotation from " + rec.data.resource;
					}
					node.setText(rec.data.title, label, null, lore.anno.ui.genTreeNodeText(rec.data));
				} catch (e) {
					lore.debug.anno(e,e);
				}
			});
			
			// loaded a new page, no active annotation
			lore.anno.ui.page.setCurrentAnno();
			
			
			// load new URL's page info 
			lore.anno.ui.page.load(contextURL);
		} catch (e ) {
			lore.debug.anno(e,e);
		}
		
	} else {
		if (lore.anno.ui.page)
			lore.anno.ui.page.clear();
		else 
			lore.anno.ui.initPage(lore.anno.annoMan.annods);
	}
	
	try {
		// enable highlighting for the page
		lore.anno.ui.pageui.enableImageHighlighting();

		//  load annotations for the page
		lore.anno.ui.loreInfo("Loading annotations for " + contextURL);
		lore.anno.annoMan.updateAnnotationsSourceList(contextURL, 
			function(result, resultMsg){
				if (result == 'fail') {
					lore.anno.annoMan.annods.removeAll();
					lore.anno.ui.loreError("Failure loading annotations for page.");
				}
			}
		);
	} catch(e) {
		lore.debug.anno(e,e);
	}
	
	lore.anno.ui.tabpanel.activate('treeview');
	lore.anno.ui.loadedURL = contextURL;
}

/**
 * When the page is refreshed, clear page data, re-enable highlighting
 * and clear the currently selected annotation 
 */
lore.anno.ui.handleContentPageRefresh = function () {
	lore.debug.anno("page refreshed");
	
	try {
		if (lore.anno.ui.page) 
			lore.anno.ui.page.clear();
		else 
			lore.anno.ui.initPage(lore.anno.annoMan.annods);
		
		lore.anno.ui.pageui.enableImageHighlighting();
		lore.anno.ui.page.setCurrentAnno();
		Ext.getCmp("annosourcestree").getSelectionModel().clearSelections();
	} catch(e ){
		lore.debug.anno("refreshPage(): " + e, e);
	}
	 
	
}

	
/*
 * topView Toolbar Handlers
 */
	 
/*
 * Handlers
 */
	
	
	
/**
 * Retrieve the currently selected text and, create a new annotation in
 * the local store
 * @param {Record} rec (Optional) The parent annotation record. Defaults to null. A supplied record implies this annotation is a Reply annotation.
 */
lore.anno.ui.handleAddAnnotation = function(rec){
	try {
		var currentContext = "";
		
		lore.debug.anno('handleAddAnnotation()', {rec:rec});
		
		if (!rec) { // only get selected text for annotations that aren't replies
			try {
				// get text currently selected in the content window
				currentContext = lore.anno.ui.pageui.getCurrentSelection();
			} 
			catch (e) {
				lore.debug.anno("exception creating xpath for new annotation", e);
			}
		}
		
		// update the currently selected annotation before the focus is taken off it
		// for the newly created annotation
		lore.anno.ui.updateAnnoFromForm();

		// RESET THE FORM
		lore.anno.ui.formpanel.form.reset();
		
		// once the node for this new annotation is added, select it.
		var addSelectNodeHandler = function (anno) {
			try {
				lore.anno.ui.treeunsaved.on('append', function selectNode(tree, parent, node){
			 		
					if (lore.anno.ui.nodeIdToRecId(node) == anno.id) {
						window.setTimeout(function(){
							node.ensureVisible()
							node.select();
						}, 100);
					}
					lore.anno.ui.treeunsaved.un('append', selectNode);
				});
			}catch(e){
				lore.debug.anno(e,e);
			}
		}
		
		var newRec = lore.anno.annoMan.addAnnotation(currentContext,  lore.anno.ui.currentURL, addSelectNodeHandler, rec);
		
		lore.anno.ui.page.setCurrentAnno(newRec);
		lore.anno.ui.formpanel.show(newRec);
		Ext.getCmp("treeview").doLayout();

	} 
	catch (e) {
		lore.debug.anno(e, e);
	}
}

/**
 * Delete the currently selected annotation, requesting confirmation from user
 */
lore.anno.ui.handleDeleteAnnotation = function (node) {
	var rec, unsaved;
	
	// find rec, and work out if a saved or unsaved anno
	if (node && node.isAncestor) { // request comes from clicking on tree
		if (node.isAncestor(lore.anno.ui.treeunsaved)) {
			rec = lore.anno.annoMan.findUnsavedRecById(lore.anno.ui.nodeIdToRecId(node));
		} else {
			rec = lore.anno.annoMan.findStoredRecById(lore.anno.ui.nodeIdToRecId(node));
		}
	} else { // request comes from toolbar or editor delete button
		if (!lore.anno.ui.page.curSelAnno ){
			lore.debug.anno("Nothing selected to delete.");
			return;
		}
		rec = lore.anno.ui.page.curSelAnno;
	}
	
	// don't need to prompt, just delete, since it's an unsaved annotation
	if (rec.store == lore.anno.annoMan.annodsunsaved) {
		lore.anno.annoMan.annodsunsaved.remove(rec);
		lore.anno.ui.page.setCurrentAnno();
		lore.anno.ui.hideAnnotationEditor();
		return;
	}
	
 	// show confirmation pop-up
   	var msg = 'Are you sure you want to delete the "' + rec.data.title + '" annotation forever?';
   	if ( rec.data.hasChildren() ) {
   		//msg = "Are you sure you want to delete this annotation and its REPLIES forever?";
		lore.anno.ui.loreError("Delete the replies for this annotation first.");
		return;
   	}
   	Ext.MessageBox.show({
   	
   		title: 'Delete annotation',
   		msg: msg,
   		buttons: Ext.MessageBox.YESNO,
   		fn: function(btn){
   			if (btn == 'yes') 
   				lore.anno.ui.handleDeleteAnnotation2(rec);
   		},
   		icon: Ext.Msg.QUESTION
   	});
}

/**
 * Delete currently selected annotation
 */
lore.anno.ui.handleDeleteAnnotation2 = function(rec){
	try {
		lore.debug.anno("deleting " + rec);
		
		lore.anno.annoMan.deleteAnnotation(rec, function(result, resultMsg){
			if (result == 'success') {
				lore.debug.anno('Annotation deleted', resultMsg);
				lore.anno.ui.loreInfo('Annotation deleted');
			}
			else {
			
				lore.anno.ui.loreError('Unable to delete annotation');
			}
		});
		
		
		if (rec === lore.anno.ui.page.curSelAnno) {
			lore.anno.ui.page.setCurrentAnno();
			lore.anno.ui.hideAnnotationEditor();
		}
	} 
	catch (ex) {
		lore.debug.anno("Exception when deleting annotation", ex);
		lore.anno.ui.loreWarning("Unable to delete annotation");
	}
}
	
	
/**
 * Save all annotation changes
 * @param {Object} uri Not currently used
 */
lore.anno.ui.handleSaveAllAnnotationChanges = function(uri ){
	try {
		
		// update existing annotation if needed before saving occurs
		lore.anno.ui.updateAnnoForSave();
		
		if( lore.anno.ui.page.curSelAnno.data.isNew()) 
			lore.anno.ui.page.setCurrentAnno();		// if new, this will be saved and removed from unsaved tree, so set current anno to blank
			
		lore.anno.annoMan.updateAllAnnotations(lore.anno.ui.currentURL, function(action, result, resultMsg, anno){
			try {
				if (result == "success") {
					lore.anno.ui.loreInfo('Annotation ' + action + 'd.');
					lore.debug.anno(action + 'd ' + anno.data.title, anno);
				}
				else {
					lore.anno.ui.loreError('Unable to ' + action + ' annotation');
					lore.debug.anno('Unable to ' + action + ' annotation', resultMsg);
				}
			} 
			catch (e) {
				lore.debug.anno(e, e);
			}
		});
		
	} 
	catch (e) {
		lore.debug.anno(e, e);
	}
}
	
/**
 * Save the currently selected annotation
 */
lore.anno.ui.handleSaveAnnotationChanges = function(){

	try {
	
		lore.anno.ui.updateAnnoFromForm();
		
		var anno = lore.anno.ui.formpanel.getRec();
		
		if (!anno) {
			lore.anno.ui.loreError('No annotation selected to save! - SHOULD BE IMPOSSIBLE');
			return;
		}
		
		
		if (!anno.data.isNew() && !lore.anno.ui.formpanel.isDirty() && !anno.dirty ) {
			lore.anno.ui.loreWarning('Annotation content was not modified, save will not occur.');
			return;
		}
		
		lore.debug.anno('handleSaveAnnotationChanges', {tthis:this,lore:lore,anno:anno});
		if (!lore.anno.ui.formpanel.form.isValid()) {
			lore.anno.ui.loreError('Annotation title required.');
			return;
		}
		
		// update anno with properties from form
		lore.anno.ui.updateAnnoForSave();
		
		
		// if the record isn't found on the current page tree and it's a variation annotation
		// then need update to tree as it should appear once the save is complete 
		var refresh = anno.data.type == (lore.constants.NAMESPACES["vanno"] + "VariationAnnotation")
		&& 	(lore.anno.ui.findNode(anno.data.id, lore.anno.ui.treeroot) == null);
		
		
		lore.anno.annoMan.updateAnnotation(anno, lore.anno.ui.currentURL, refresh, function(action, result, resultMsg){
		
			if (result == "success") {
				lore.anno.ui.loreInfo('Annotation ' + action + 'd.');
				lore.debug.anno(action + 'd ' + anno.data.title, resultMsg);
				lore.anno.ui.hideAnnotationEditor();
			}
			else {
				lore.anno.ui.loreError('Unable to ' + action + ' annotation');
				lore.debug.anno('Unable to ' + action + ' annotation', resultMsg);
			}
		});
		lore.anno.ui.page.setCurrentAnno();
	} 
	catch (e) {
		lore.debug.anno("Error updating saving annotation: " + e, e);
	}
}
	
	
	
/**
 * Add the annotations for the selected search result rows to the compound object editor
 * @param {Object} evt Not Used
 */	
lore.anno.ui.handleAddResultsToCO = function(evt){
	try {
		var sels = lore.anno.ui.search.grid().getSelectionModel().getSelections();
            
        for (var i =0; i < sels.length; i++ ) {								
            var rec = sels[i];
			lore.global.ui.compoundObjectView.get(window.instanceId).addResource(rec.data.id,
            {"rdf:type_0":rec.data.type});
		}
		
	} catch (e ){
		lore.debug.anno("Error adding node/s to compound editor:" + e, e);
	}
}
lore.anno.ui.handleViewAnnotationInBrowser = function(evt){
    try {
		var sels = lore.anno.ui.search.grid().getSelectionModel().getSelections();
            
        for (var i =0; i < sels.length; i++ ) {								
            var rec = sels[i];
        	lore.global.util.launchTab(rec.data.id + "?danno_useStylesheet");
        }
    } catch (e) {
        lore.debug.anno("Error viewing node/s in browser",e);
    }
}
/**
 * Toggle on and off the annotation highlighting for all annotations
 */
lore.anno.ui.handleToggleAllAnnotations = function () {
	lore.anno.ui.pageui.toggleAllAnnotations();
}


/**
 * Reply to an annotation. Add the reply to the local store. 
 * @param {Object} arg (Optional) The parent annotation. A string containing the annotation id or if not supplied defaults
 * to the currently selected annotation
 */
lore.anno.ui.handleReplyToAnnotation = function(arg){
	try {
		var rec;
		if (!arg) { // request comes from toolbar
			rec = lore.anno.ui.page.curSelAnno;
			if (!rec)
				return;
		}
		else if (typeof(arg) == 'string') {   
			// user has come from an info bubble pop-up in timeline
			lore.anno.ui.timeline.timeline.getBand(0).closeBubble();
			rec = lore.anno.annoMan.findStoredRecById(arg);
			if (rec) 
				lore.anno.ui.page.setCurrentAnno(rec);
		}
			
		if (!rec) {
			lore.debug.anno("Couldn't find record to reply to: " + arg, arg);
			return;
		}
		
		if (rec.data.isNew()) {
			lore.anno.ui.loreError("Save the annotation first before replying to it.");
			return;
		}
		
		lore.anno.ui.tabpanel.activate('treeview');
		lore.anno.ui.handleAddAnnotation(rec);
	} 
	catch (e) {
		lore.debug.anno(e, e);
	}
}
	
	
/**
* When the edit link from the timeline popup is clicked, load the supplied annotation into the form editor and show it.
*
* @param {String} id The id of the annotation to load in the form editor
*/
lore.anno.ui.handleEditTimeline = function ( id ) {
	try {
		lore.anno.ui.updateAnnoFromForm();
		// the user has come here from an info bubble pop-up.
		lore.anno.ui.timeline.timeline.getBand(0).closeBubble();
		lore.anno.ui.tabpanel.activate('treeview');
		var rec =  lore.global.util.findRecordById(lore.anno.annoMan.annods, id);
		
		rec = lore.anno.annoMan.editRec(rec);
		lore.anno.ui.selectAndShowNode(rec);
	} catch (e) {
		lore.debug.anno(e,e);
	}
}
	
	
/**
* When the edit button from the toolbar is clicked, load the current annotation into the form editor and show it.
*/

lore.anno.ui.handleEdit = function ( ) {
	try {
		lore.anno.ui.updateAnnoFromForm();
		var rec = lore.anno.ui.page.curSelAnno
		if (!rec) 
			return;

		rec = lore.anno.annoMan.editRec(rec);
		lore.anno.ui.selectAndShowNode(rec);
	} catch (e) {
		lore.debug.anno(e,e);
	}
}
	
/**
* When the a node in the tree view is double clicked, load the annotation in the form editor and show the editor.
* @param {Object} node  The tree node 
*/
lore.anno.ui.handleEditTreeNode = function (node) {
	try {
		var rec;
		
		if (node.isAncestor(lore.anno.ui.treeunsaved)) {
			rec = lore.anno.annoMan.findUnsavedRecById(lore.anno.ui.nodeIdToRecId(node));
		} else {
			rec = lore.anno.annoMan.findStoredRecById(lore.anno.ui.nodeIdToRecId(node));
		}
		rec = lore.anno.annoMan.editRec(rec);
		
		
		lore.anno.ui.selectAndShowNode(rec);
	} catch (e) {
		lore.debug.anno(e,e);
	}
}
	
/**
 * Serialize the annotations on the page into the supplied format to a file.  Opens a save as
 * dialog to allow the user to select the file path.
 * @param {String} format The format to serialize the annotations into. 'rdf' or 'wordml'.
 */
lore.anno.ui.handleSerialize = function (format ) {
	 var fileExtensions = {
        "rdf": "xml",
        "wordml": "xml",
        "oac": "xml"
    }
	if ( !format) {
		format = "rdf";
	}
	try {
		lore.anno.ui.updateAnnoFromForm();
		var fobj = lore.global.util.writeFileWithSaveAs("Export Annotations (for current page) as", fileExtensions[format], 
											function(){
												return lore.anno.annoMan.serialize(format);
											},window);
		if ( fobj) lore.anno.ui.loreInfo("Annotations exported to " + fobj.fname);
	} catch (e ) {
		lore.debug.anno("Error exporting annotations: " + e, e );
		lore.anno.ui.loreError("Error exporting annotations: " + e);
	}
}

/**
 * When the 'Hide Editor' button is clicked, update the annotation from the form, then hide the editor.
 */
lore.anno.ui.handleHideAnnotationEditor = function () {
	lore.anno.ui.updateAnnoFromForm();
	lore.anno.ui.hideAnnotationEditor();
}

lore.anno.ui.handleCancelEditing = function() {
	var rec = lore.anno.ui.formpanel.getRec();
	lore.anno.annoMan.annodsunsaved.remove(rec);
	lore.anno.ui.page.setCurrentAnno();
	lore.anno.ui.hideAnnotationEditor();
	return;
}
