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


/**  Replaces default function for generating contents of timeline bubbles
	 * @param {Object} elmt  dom node that the timeline bubble will be inserted into
	 * @param {Object} theme See timeline documentation
	 * @param {Object} labeller See timeline documentation
	 */
if (typeof Timeline !== "undefined") {
		Timeline.DefaultEventSource.Event.prototype.fillInfoBubble = function(elmt, theme, labeller){
			var doc = elmt.ownerDocument;
			var title = this.getText();
			var link = this.getLink();
			var image = this.getImage();
			
			if (image != null) {
				var img = doc.createElement("img");
				img.src = image;
				
				theme.event.bubble.imageStyler(img);
				elmt.appendChild(img);
			}
			
			var divTitle = doc.createElement("div");
			var textTitle = doc.createTextNode(title);
			if (link != null) {
				var a = doc.createElement("a");
				a.href = link;
				a.appendChild(textTitle);
				divTitle.appendChild(a);
			}
			else {
				divTitle.appendChild(textTitle);
			}
			theme.event.bubble.titleStyler(divTitle);
			elmt.appendChild(divTitle);
			
			var divBody = doc.createElement("div");
			this.fillDescription(divBody);
			theme.event.bubble.bodyStyler(divBody);
			elmt.appendChild(divBody);
			
			var divTime = doc.createElement("div");
			this.fillTime(divTime, labeller);
			divTime.style.fontSize = 'smaller';
			divTime.style.color = '#aaa';
			elmt.appendChild(divTime);
			
			var divOps = doc.createElement("div");
			divOps.style.paddingTop = '5px';
			//TODO: fix
			var divOpsInner = "<a style='color:orange;font-size:smaller' href='#' " +
			"onclick='try{lore.anno.ui.timeline.timeline.getBand(0).closeBubble();lore.anno.ui.handleEditTimeline(\"" +
			this._eventID +
			"\")} catch(e){lore.debug.anno(\"e:\"+e,e);}'>EDIT</a> | " +
			"<a style='color:orange;font-size:smaller' href='#' " +
			"onclick='lore.anno.ui.timeline.timeline.getBand(0).closeBubble();lore.anno.ui.handleReplyToAnnotation(\"" +
			this._eventID +
			"\")'>REPLY</a>";
			divOps.innerHTML = divOpsInner;
			elmt.appendChild(divOps);
			
			var annoid = this._eventID;
			var node = lore.global.util.findChildRecursively(lore.anno.ui.treeroot, 'id', annoid);
			if ( node) {
				node.select();
			} else {
				lore.debug.anno("Could not select node for :" + annoid, annoid); 
			}
									
		};
};


	
	
	/**
	 * Initialize the annotations model and view. Registering the view and loading
	 * the annotations for the current page if the annotations view is visible
	 */
	lore.anno.ui.init = function(){
		try 
		{
			lore.anno.ui.topView = lore.global.ui.topWindowView.get(window.instanceId);
			
			lore.anno.prefs = new lore.anno.Preferences({
				prefsObj: lore.anno.ui.topView,
				creator: 'Anonymous',
				server: '',
				cacheTimeout: '1',
				disable: false
			});
			
			lore.anno.prefs.on('prefs_changed', lore.anno.ui.handlePrefsChange);
			lore.anno.prefs.load();
			
			lore.anno.ui.currentURL = lore.global.util.getContentWindow(window).location.href;
			lore.anno.annoMan = new lore.anno.AnnotationManager({
				url: lore.anno.ui.currentURL,
				prefs: lore.anno.prefs
			});
			lore.anno.ui.initView(lore.anno.annoMan.annods);
			
			lore.anno.ui.topView.on('location_changed', lore.anno.ui.handleLocationChange, this);
			lore.anno.ui.topView.on('location_refresh', lore.anno.ui.refreshPage, this);
			
			lore.anno.ui.lorevisible = lore.anno.ui.topView.annotationsVisible();
			
 			
			
			lore.global.ui.annotationView.registerView(lore.anno.ui, window.instanceId);
			
			
			
			lore.anno.ui.initialized = true;
			if (lore.anno.ui.currentURL && lore.anno.ui.currentURL != '' &&
				lore.anno.ui.currentURL != 'about:blank' &&
				lore.anno.ui.lorevisible) {
				lore.debug.anno("anno init: updating sources");
				lore.anno.ui.handleLocationChange(lore.anno.ui.currentURL);
			}

			lore.debug.anno("Annotation init");
		} catch (e ) {
			lore.debug.ui("Except in anno init ! " + e, e);
		}
	}
	
	lore.anno.ui.initView = function ( model) {
		lore.anno.ui.initPage(model);
		lore.anno.ui.initGUIConfig({ annods: lore.anno.annods, annodsunsaved: lore.anno.annodsunsaved,
		annosearchds: lore.anno.annosearchds, annousermetads: lore.anno.annousermetads});

				
	}
	
	lore.anno.ui.initPage = function(model){
		if (!lore.anno.ui.page) 
			lore.anno.ui.page = new lore.anno.ui.PageData({
				model: model
			});
		if (!lore.anno.ui.rdfaMan) 
			lore.anno.ui.rdfaMan = new lore.anno.ui.RDFaManager({
				page: lore.anno.ui.page
			});
		if (!lore.anno.ui.pageui) 
			lore.anno.ui.pageui = new lore.anno.ui.PageView({
				page: lore.anno.ui.page,
				rdfaManager: lore.anno.ui.rdfaMan,
				model: model
			});
		
	}
	
	
	
	/**
	 * Destroy any objects and undo any changes made to the current content window
	 */
	lore.anno.ui.uninit = function () {
		lore.anno.ui.pageui.hideCurrentAnnotation();
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
		pageView: lore.anno.ui.pageui,
		rdfaManager: lore.anno.ui.rdfaMan,
		model: store.annodsunsaved,
		metaModel: store.annousermetads,
		id: "annotationslistform",
		annomode: lore.constants.ANNOMODE_NORMAL, 
		buttonsConfig: [{
			text: 'Hide Editor',
			id: 'hideeditbtn',
			tooltip: 'Hides the annotation editor from view'
		},{
			text: 'Save Annotation',
			id: 'updannobtn',
			tooltip: 'Save the annotation to the repository'
		},{
			text: 'Delete Annotation',
			id: 'delannobtn',
			tooltip: 'Delete the annotation - CANNOT BE UNDONE'
		},  {
			text: 'Reset',
			id: 'resetannobtn',
			tooltip: 'Reset - changes will be discarded'
		}]
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
					model: store.annods,
					animate: false
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
		id: 'searchpanel',
		model: store.annosearchds
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
					},
					{
                region: "south",
                xtype: "statusbar",
                id: "status",
                defaultText: "",
                autoClear: 6000
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


lore.anno.ui.initGlobals = function (store) {

		lore.anno.ui.views = Ext.getCmp("curpage");
		
		lore.anno.ui.treerealroot = Ext.getCmp("annosourcestree").getRootNode(); 
		
		lore.anno.ui.treeroot = new lore.anno.ui.AnnoPageTreeNode({	text:'Current Page',
																	model: store.annods });
		lore.anno.ui.treeunsaved = new lore.anno.ui.AnnoModifiedPageTreeNode({	text:'Unsaved Changes',
																				model: store.annodsunsaved,
																				postfix: "-unsaved"
																			});
																			
		lore.anno.ui.treerealroot.appendChild([ lore.anno.ui.treeroot, lore.anno.ui.treeunsaved]);
		lore.anno.ui.treeroot.expand();
		
		// Auto expand child nodes
		Ext.getCmp("annosourcestree").on("expandnode", function (node) {
			if ( node != lore.anno.ui.treeroot) {
				node.expandChildNodes(false);
			}	
		});
		
		
		lore.anno.ui.formpanel = Ext.getCmp("annotationslistform");
		lore.anno.ui.formpanel.hide();
		
		lore.anno.ui.timeline = Ext.getCmp("annotimeline");
		lore.anno.ui.search = Ext.getCmp("searchpanel");

}

lore.anno.ui.attachContextMenus = function (store) {

	// Context Menu for Top-Level Tab
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
		
		// Context Menu for Tree Nodes
		lore.anno.ui.treeroot.on('append', lore.anno.ui.attachAnnoCtxMenuEvents);
		
		// serach grid context menu
		var grid = lore.anno.ui.search.grid();
		grid.contextmenu = new Ext.menu.Menu({
							id: grid.id + "-context-menu"
		});
		
		grid.contextmenu.add({
			text: "Add as node/s in compound object editor",
			handler: lore.anno.ui.handleAddResultsToCO
		});
				
		grid.on('contextmenu', function(e) {
			grid.contextmenu.showAt(e.xy);
		});
}

/**
 * 
 * @param {Object} store
 */
lore.anno.ui.attachHandlers = function (store) {
		// Add default behaviour when a new annotation is added
		lore.anno.ui.treeunsaved.on('append', lore.anno.ui.handleNewAnnotation);
		lore.anno.ui.treeroot.on('append', lore.anno.ui.handleAttachNodeLinks);
		
		// Tree node is clicked/double clicked
		Ext.getCmp("annosourcestree").on("click", lore.anno.ui.handleTreeNodeSelection);
		Ext.getCmp("annosourcestree").on("dblclick", lore.anno.ui.handleEditTreeNode);
		
		// editor handlers
		Ext.getCmp("resetannobtn")
				.on('click', function () { lore.anno.ui.rejectChanges()});
		Ext.getCmp("hideeditbtn").on('click', lore.anno.ui.hideAnnotation);
		Ext.getCmp("updannobtn").on('click', lore.anno.ui.handleSaveAnnotationChanges);
		Ext.getCmp("delannobtn").on('click', lore.anno.ui.handleDeleteAnnotation);
		
		lore.anno.ui.formpanel.getComponent("variantfield").on('specialkey', lore.anno.ui.launchFieldWindow);
		lore.anno.ui.formpanel.getComponent("originalfield").on('specialkey', lore.anno.ui.launchFieldWindow);
}



/**
 * Initialize the Ext Components. Sets globals, visibility of fields
 * and initialize handlers
 * @param {Object} store
 */
lore.anno.ui.initExtComponents = function(store){
	try {
		
		lore.anno.ui.initGlobals(store);
		lore.anno.ui.attachContextMenus(store);
		lore.anno.ui.attachHandlers(store);
			
		lore.anno.ui.formpanel.setAnnotationFormUI(false, false );
		
		Ext.getCmp("about").body.update("<iframe height='100%' width='100%' "
			+ "src='chrome://lore/content/annotations/about_annotations.html'></iframe>");
			
	    Ext.QuickTips.interceptTitles = true;
	    Ext.QuickTips.init();
        Ext.apply(Ext.QuickTips.getQuickTip(),{
            dismissDelay: 0
        });
		
		lore.anno.ui.timeline.initTimeline();
		lore.anno.ui.formpanel.setPreferences(lore.anno.prefs);
		
	} catch (e ) {
		lore.debug.ui("Errors during initExtComponents: " + e, e);
	}
}