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
 * @include  "/oaiorebuilder/content/annotations.js"
 * @include  "/oaiorebuilder/content/uiglobal.js"
 * @include  "/oaiorebuilder/content/debug.js"
 * @include  "/oaiorebuilder/content/annotations/annotations_view_init.js"
 */

/**
 * Annotations View
 * @singleton
 * @class lore.anno.ui
 */

/**
 * @property extension 
 * Reference to the Extension
 */
lore.anno.ui.extension = Components.classes["@mozilla.org/extensions/manager;1"]
		.getService(Components.interfaces.nsIExtensionManager)
		.getInstallLocation(lore.constants.EXTENSION_ID)
		.getItemLocation(lore.constants.EXTENSION_ID);

	/**
	 * Initialize the annotations model and view. Registering the view and loading
	 * the annotations for the current page if the annotations view is visible
	 */
	lore.anno.ui.init = function(){
		try {
			
			lore.anno.ui.topView = lore.global.ui.topWindowView.get(window.instanceId);
			lore.anno.ui.currentURL = lore.global.util.getContentWindow(window).location.href;
			lore.anno.initModel(lore.anno.ui.currentURL);
			lore.anno.ui.initView();
			
			lore.anno.ui.lorevisible = lore.anno.ui.topView.annotationsVisible();
			
 			
			lore.anno.ui.timeline.initTimeline();
			lore.global.ui.annotationView.registerView(lore.anno.ui, window.instanceId);
			
			try{
				lore.anno.ui.topView.loadAnnotationPrefs();
    		} catch (ex){
        		lore.debug.anno("Error loading annotation preferences: " + ex, ex);
    		}
			
			lore.anno.ui.initialized = true;
			if (lore.anno.ui.currentURL && lore.anno.ui.currentURL != '' &&
				lore.anno.ui.currentURL != 'about:blank' &&
				lore.anno.ui.lorevisible) {
				lore.debug.anno("anno init: updating sources");
				lore.anno.ui.handleLocationChange(lore.anno.ui.currentURL);
				//lore.anno.ui.loadedURL = lore.anno.ui.currentURL; //TODO: this could be shared code
			}

			lore.debug.anno("Annotation init");
		} catch (e ) {
			lore.debug.ui("Except in anno init ! " + e, e);
		}
	}
	
	/**
	 * Destroy any objects and undo any changes made to the current content window
	 */
	lore.anno.ui.uninit = function () {
		lore.anno.ui.hideMarker(); 
	}
	
/**
 * Helper function for construction the "Using Annotations" tab
 * @private
 */
loreuiannoabout = function () { 
	return {
				title: "Using Annotations",
				id: "about",
				autoWidth: true,
				autoScroll: true,
				iconCls: "welcome-icon"};
}

/**
 * Helper function for construting 'Annotationg Editor' panel
 * @private
 * @param {Object} store The datastore for the store
 */
loreuieditor = function (store ) {
	
	return {
		xtype: 'annoeditorpanel',
	 	region: "south",
	 	split: true,
		height: 300,
		trackResetOnLoad: true,
		id: "annotationslistform"
	}
}

/**
 * Helper function for constructing the panel that contains the annotation tree view and editor
 * @private
 * @param {Object} store The datastore for the store
 */
loreuiannotreeandeditor = function (store) {
	return {
			title: "Annotation List",
			xtype: "panel",
			id: "treeview",
			layout: "border",
			items: [{
				region: "center",
				layout: "border",
				items: [{
					region: "center",
					xtype: "annocolumntreepanel",
					id: "annosourcestree",
					model: store.annods
					}]
			}, 
				loreuieditor(store)]
			};
}

/**
 * 
 * Helper function that constructs the 'Timeline' panel
 * @private
 * @param {Object} store The datastore for the store
 */
loreuiannotimeline = function (store)
{
	return {
		title: "Annotation Timeline",
		xtype: "annotimelinepanel",
		id: "annotimeline",
		model: store.annods
	}
}

loreuiannocurpage = function (store) {
	return {
			xtype: "tabpanel",
			title: "Browse",
			id: "curpage",
			deferredRender: false,
			activeTab: "treeview",
			items: [loreuiannotreeandeditor(store), loreuiannotimeline(store)]
		};
}

loreuiannosearch = function (store ) {
	 
	return {
		xtype: 'annosearchpanel',
		layout:'border',
		id: 'searchpanel'
	}
}

loreuiannonavtabs = function (store) {
	return {
				xtype: "tabpanel",
				title: "Navigation",
				id: "navigationtabs",
				deferredRender: false,
				activeTab: "curpage",
				items: [loreuiannocurpage(store), loreuiannosearch(store), loreuiannoabout(store) ]
			};
}

/**
 * Construct the Ext based GUI and initialize and show the components
 * @param {Object} store The datastore for the store
 */	
lore.anno.ui.initGUIConfig = function(store){
	lore.debug.ui("initGUI: store " + store, store);
	if (!store) {
		lore.debug.ui("No store found for view");
		return;
	}
	
	try {
		lore.anno.ui.gui_spec = {
			layout: "border",
			items: [{
				region: "center",
				layout: "fit",
				border: false,
				items: [{
					layout: "border",
					border: false,
					items: [{
						region: "center",
						border: false,
						layout: "fit",
						items: [ loreuiannonavtabs(store)]
					}]
				}]
			}]
		};
		
		lore.anno.ui.main_window = new Ext.Viewport(lore.anno.ui.gui_spec);
		lore.anno.ui.main_window.show();
		lore.anno.ui.initExtComponents(store);
	} 
	catch (ex) {
		lore.debug.ui("Exception creating anno UI", ex);
	}
}

/**
 * Initialize the Ext Components. Sets globals, visibility of fields
 * and initialize handlers
 */
lore.anno.ui.initExtComponents = function(store){
	try {
		
		
		lore.anno.ui.views = Ext.getCmp("curpage");
		lore.anno.ui.views.contextmenu = new Ext.menu.Menu({
				id : "anno-context-menu"
		});
		lore.anno.ui.views.contextmenu.add({
		        text : "Show RDF/XML",
        		handler : function (){try {
            		lore.anno.ui.openView("remrdfview","RDF/XML",
					function(){
							Ext.getCmp("remrdfview").body.update(lore.global.util.escapeHTML(lore.anno.serialize("rdf")));
						
					}	);
					} 
						catch (e) {
							lore.debug.anno("Error generating RDF view: " + e, e);	
						}
        	}
    	});
	 
		
		lore.anno.ui.views.on("contextmenu", function(tabpanel, tab, e){
        	lore.anno.ui.views.contextmenu.showAt(e.xy);
    	});

		lore.anno.ui.treerealroot = Ext.getCmp("annosourcestree").getRootNode(); 
		//lore.anno.ui.treeroot =  new Ext.tree.TreeNode({text:'Current Page'});
		lore.anno.ui.treeroot = new lore.anno.ui.AnnoPageTreeNode({	text:'Current Page',
																	model: store.annods });
																	
		lore.anno.ui.treeroot.on('append', lore.anno.ui.attachAnnoCtxMenuEvents);
																	
		lore.anno.ui.treeunsaved = new lore.anno.ui.AnnoModifiedPageTreeNode({	text:'Unsaved Changes',
																				model: store.annodsunsaved,
																				postfix: "-unsaved"
																			});
		lore.anno.ui.treeunsaved.on('append', function(tree, thus, childNode, index){
			var rec = lore.global.util.findRecordById(lore.anno.annodsunsaved, lore.anno.ui.recIdForNode(childNode));

			// update the currently selected annotation before the focus is taken off it
			// for the newly created annotation
			if (lore.anno.ui.page.curSelAnno &&
			((lore.anno.ui.form.isDirty() ||
			lore.anno.isNewAnnotation(lore.anno.ui.page.curSelAnno)) &&
			lore.anno.ui.form.findField('id').getValue() == lore.anno.ui.page.curSelAnno.data.id)) {
			
				lore.anno.ui.updateAnnoFromRecord(lore.anno.ui.page.curSelAnno);
			}
			
			if (!lore.anno.ui.formpanel.isVisible()) {
			
				lore.anno.ui.formpanel.show();
			}
			
			lore.anno.ui.showAnnotation(rec);
			lore.anno.ui.setCurrentAnno(rec, lore.anno.annodsunsaved);
		})
		
		
		lore.anno.ui.treerealroot.appendChild([ lore.anno.ui.treeroot, lore.anno.ui.treeunsaved]);
		lore.anno.ui.treeroot.expand();
		
		Ext.getCmp("annosourcestree").on("expandnode", function (node) {
			if ( node != lore.anno.ui.treeroot) {
				node.expandChildNodes(false);
			}	
		});
		
		Ext.getCmp("annosourcestree").on("click", lore.anno.ui.handleAnnotationSelection);
		Ext.getCmp("annosourcestree").on("dblclick", lore.anno.ui.handleEditAnnotation);
				
		lore.anno.ui.formpanel = Ext.getCmp("annotationslistform");
		lore.anno.ui.form = lore.anno.ui.formpanel.getForm();
		lore.anno.ui.formpanel.hide();
		
		Ext.getCmp("resetannobtn")
				.on('click', function () { lore.anno.ui.rejectChanges()});
		Ext.getCmp("hideeditbtn").on('click', lore.anno.ui.hideAnnotation);
		Ext.getCmp("updannobtn").on('click', lore.anno.ui.handleSaveAnnotationChanges);
		Ext.getCmp("delannobtn").on('click', lore.anno.ui.handleDeleteAnnotation);
		/*Ext.getCmp("updctxtbtn").on('click',
				lore.anno.ui.handleUpdateAnnotationContext);
		Ext.getCmp("updrctxtbtn").on('click',
				lore.anno.ui.handleUpdateAnnotationVariantContext);*/
		Ext.getCmp("variantfield").on('specialkey', lore.anno.ui.launchFieldWindow);
		Ext.getCmp("originalfield").on('specialkey', lore.anno.ui.launchFieldWindow);
		Ext.getCmp("typecombo").on('valid', lore.anno.ui.handleAnnotationTypeChange);
		Ext.getCmp("addmetabtn").on('click', lore.anno.ui.handleAddMeta);
		Ext.getCmp("remmetabtn").on('click', lore.anno.ui.handleRemMeta);
		
		//Ext.getCmp("addmetabtn").on('click', lore.anno.ui.handleAddMeta);
		//Ext.getCmp("remmetabtn").on('click', lore.anno.ui.handleRemMeta);
		
		lore.anno.ui.form.findField("body").on("push", function(field, html) {
			// this is hack to stop this field being flagged as dirty because
			// originalValue is XML and the value field is converted to HTML
			field.originalValue = field.getValue();
			
		});
		
		lore.anno.ui.timeline = Ext.getCmp("annotimeline");
		lore.anno.ui.search = Ext.getCmp("annosearchpanel");
		 
		
		lore.anno.ui.setAnnotationFormUI(false, false );
		
		
		Ext.getCmp("about").body.update("<iframe height='100%' width='100%' "
			+ "src='chrome://lore/content/annotations/about_annotations.html'></iframe>");
			
	    Ext.QuickTips.interceptTitles = true;
	    Ext.QuickTips.init();
        Ext.apply(Ext.QuickTips.getQuickTip(),{
            dismissDelay: 0
        });
		
	} catch (e ) {
		lore.debug.ui("Errors during initExtComponents: " + e, e);
	}
}