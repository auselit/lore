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
 * @include "/oaiorebuilder/content/constants.js" 
 * @include "/oaiorebuilder/content/uiglobal.js" 
 * @include "/oaiorebuilder/content/debug.js" 
 * @include "/oaiorebuilder/content/compound_objects/loregui.js"
 */

/**
 * Initialise the graphical view
 */
lore.ore.ui.initGraphicalView = function() {
	Ext.getCmp("loreviews").activate("drawingarea");
	/** Indicates whether the compound object has been edited since being loaded */
	lore.ore.ui.graph.modified = false;
    lore.ore.ui.graphicalEditor = Ext.getCmp("drawingarea");
    lore.ore.ui.graphicalEditor.initGraph();
	// clear the node properties
	if (lore.ore.ui.nodegrid) {
		lore.ore.ui.nodegrid.store.removeAll();
		lore.ore.ui.nodegrid.collapse();
        lore.ore.ui.relsgrid.store.removeAll();
        lore.ore.ui.relsgrid.collapse();
	}
}

/**
 * Initialise the Extjs UI components and listeners
 */
lore.ore.ui.initUIComponents = function() {
	Ext.Container.prototype.bufferResize = false;
    // make sure popup windows appear above everything else, particularly when over the graphical editor
    Ext.WindowMgr.zseed = 10000;
    
	lore.ore.ui.resselectcombo = new Ext.form.ComboBox({
				displayField : 'display',
				id : "resselectcombo",
				itemSelector : 'div.res-listing',
				emptyText : "Select resource to display... ",
				triggerAction : "all",
				mode : 'local',
				pageSize : 5,
				tpl : new Ext.XTemplate(
						'<tpl for="."><div class="x-combo-list-item res-listing">',
						'<h3>{title}</h3>', '<i>{uri}</i>', '</div></tpl>'),
				valueField : 'uri',
				typeAhead : false,
				store : lore.ore.resourceStore
	});

	try {
        Ext.MessageBox.show({
           msg: 'Loading LORE...',
           width:250,
           defaultTextHeight: 0,
           closable: false,
           cls: 'co-load-msg'
       });
        lore.ore.ui.main_window = new lore.ore.ui.Viewport();
		lore.ore.ui.main_window.show();
	} catch (e) {
		lore.debug.ore("Error creating Ext UI components from spec", e);
	}

	// set up glocal variable references to main UI components
	lore.ore.ui.grid = Ext.getCmp("remgrid");
	lore.ore.ui.nodegrid = Ext.getCmp("nodegrid");
    lore.ore.ui.relsgrid = Ext.getCmp("relsgrid");
	lore.ore.ui.status = Ext.getCmp("lorestatus");

	/** Tree used to display properties in resource details editor */
	lore.ore.ui.resproptreeroot = new Ext.tree.TreeNode({
				id : "resproptree",
				text : "Properties",
				qtip : "The resource's properties",
				iconCls : "tree-ore"
			});

	/** Tree used to display relationships in resource details editor */
	if (Ext.getCmp("remresedit")) {
		lore.ore.ui.resreltreeroot = new Ext.tree.TreeNode({
					id : "resreltree",
					text : "Relationships",
					qtip : "The resource's relationships",
					iconCls : "tree-ore"
				});
		var resdetailstree = Ext.getCmp("resdetailstree").getRootNode();
		resdetailstree.appendChild(lore.ore.ui.resproptreeroot);
		resdetailstree.appendChild(lore.ore.ui.resreltreeroot);
		lore.ore.ui.resproptreeroot.on("beforeclick", lore.ore.updateResDetails);
		lore.ore.ui.resreltreeroot.on("beforeclick", lore.ore.updateResDetails);
		// load resource details handler
		lore.ore.ui.resselectcombo.on("select", lore.ore.loadResourceDetails); 
	}
    
	// set up search handlers
	Ext.getCmp("advsearchbtn").on('click', lore.ore.advancedSearch);
	Ext.getCmp("kwsearchbtn").on('click', lore.ore.keywordSearch);
    Ext.getCmp("advsearchform").on('activate',function(){Ext.getCmp("searchforms").setSize({height: 165});Ext.getCmp("searchpanel").doLayout();});
    Ext.getCmp("kwsearchform").on('activate',function(){Ext.getCmp("searchforms").setSize({height: 60});Ext.getCmp("searchpanel").doLayout();});
    Ext.getCmp("searchforms").activate("kwsearchform");
    Ext.getCmp("searchforms").setSize({height: 30}); // for some reason this isn't happening
	// populate search combo with dublin core fields
	try {
		var searchproplist = [];
        var om = lore.ore.ontologyManager;
		for (var p = 0; p < om.METADATA_PROPS.length; p++) {
			var curie = om.METADATA_PROPS[p];
			var splitprop = curie.split(":");
			searchproplist.push([
				"" + lore.constants.NAMESPACES[splitprop[0]]
				+ splitprop[1], curie]);
		}

		Ext.getCmp("searchpred").getStore().loadData(searchproplist);
		// Ext.getCmp("searchpred").getStore().commitChanges();
	} catch (e) {
		lore.debug.ui("error setting up search combo", e);
	}

	var loreviews = Ext.getCmp("loreviews");
	// set up event handlers for tabs
	loreviews.on("beforeremove", lore.ore.closeView);
	// create a context menu to hide/show optional views
	loreviews.contextmenu = new Ext.menu.Menu({
				id : "co-context-menu"
	});
	/*loreviews.contextmenu.add({
				text : "Show Text Mining view",
				handler : function() {
					lore.ore.openView("remtmview", "Text Mining",
							lore.ore.textm.requestTextMiningMetadata);
				}
	});*/
	/* disable SMIL view for now
     * loreviews.contextmenu.add({
				text : "Show SMIL View",
				handler : function() {
					lore.ore.openView("remsmilview", "SMIL", lore.ore.showSMIL);
				}
	});*/
	loreviews.contextmenu.add({
				text : "Show RDF/XML",
				handler : function() {
					lore.ore.openView("remrdfview", "RDF/XML",
							lore.ore.updateRDFHTML);
				}
	});
	loreviews.contextmenu.add({
				text : "Show TriG",
				handler : function() {
					lore.ore.openView("remtrigview", "TriG", lore.ore.updateTriG);
				}
	});
	loreviews.contextmenu.add({
				text : "Show FOXML",
				handler : function() {
					lore.ore.openView("remfoxmlview", "FOXML",
							lore.ore.updateFOXML);
				}
	});

	loreviews.on("contextmenu", function(tabpanel, tab, e) {
				Ext.getCmp("loreviews").contextmenu.showAt(e.xy);
	});
	
	var rdftab = Ext.getCmp("remrdfview");
	if (rdftab) {
		rdftab.on("activate", lore.ore.updateRDFHTML);
	}
	var smiltab = Ext.getCmp("remsmilview");
	if (smiltab) {
		smiltab.on("activate", lore.ore.showSMIL);
	}
	
    Ext.getCmp("remslideview").on("activate",lore.ore.showSlideshow);
    
    var sidetabs = Ext.getCmp("propertytabs");
    // Fix collapsing
    sidetabs.on('beforecollapse', function(p) {
                lore.debug.ore("beforecollapse");
                try {
                    p.body.setStyle('display', 'none');
                } catch (e) {
                    lore.debug.ore("beforecollapse", e);
                }
    });
    sidetabs.on('beforeexpand', function(p){p.body.setStyle('display','block');});
    
    sidetabs.items.each(function(item){
        // force repaint on scroll for the sidetabs to avoid rendering issues if iframe previews are scrolled behind #209
        var tabEl = item.body;
        tabEl.on("scroll",function(e,t,o){this.repaint();},tabEl);
    });
    
    sidetabs.activate("browsePanel");
	Ext.QuickTips.interceptTitles = true;
	Ext.QuickTips.init();
    
    // set up drag and drop from browse/history/search dataviews to graphical editor
    var d1 = new lore.ore.ui.CompoundObjectDragZone(Ext.getCmp('cobview'));
    var d2 = new lore.ore.ui.CompoundObjectDragZone(Ext.getCmp('cohview'));
    var d3 = new lore.ore.ui.CompoundObjectDragZone(Ext.getCmp('cosview'));
}

/**
 * Initialise Compound Objects component of LORE
 */
lore.ore.ui.init = function() {
	try {
		/**
		 * Used to store options relating to parts of the UI that should be
		 * disabled
		 */
		lore.ore.ui.disabled = {};

		/** Reference to the Extension */
		lore.ore.ui.extension = Components.classes["@mozilla.org/extensions/manager;1"]
				.getService(Components.interfaces.nsIExtensionManager)
				.getInstallLocation(lore.constants.EXTENSION_ID)
				.getItemLocation(lore.constants.EXTENSION_ID);

		lore.ore.ui.topView = lore.global.ui.topWindowView.get(window.instanceId);
        window.addEventListener("dragover", lore.ore.ui.dragOver, true);
        window.addEventListener("dragdrop", lore.ore.ui.dragDrop, true);
        
		/** The url shown in the current browser tab */
		lore.ore.ui.currentURL = window.top.getBrowser().selectedBrowser.contentWindow.location.href;
		/** Indicates whether the Compound Object UI is visible */
		lore.ore.ui.lorevisible = lore.ore.ui.topView.compoundObjectsVisible();
        

		lore.global.ui.compoundObjectView.registerView(lore.ore,window.instanceId);
        lore.ore.ontologyManager = new lore.ore.model.OntologyManager();
        lore.ore.ui.topView.loadCompoundObjectPrefs();
        
        lore.ore.coListManager = new lore.ore.model.CompoundObjectListManager();
        lore.ore.historyManager = new lore.ore.model.HistoryManager(lore.ore.coListManager);
        lore.ore.cache = new lore.ore.model.CompoundObjectCache();
        
        // Temporary store for choosing resources: update to use model
            lore.ore.resourceStore = new Ext.ux.data.PagingArrayStore({
                storeId: "resourceStore",
                fields : ['title', 'uri', 'display'],
                data : [],
                lastOptions : {
                    params : {
                        start : 0,
                        limit : 5
                    }
                }
            });
            
		lore.ore.ui.initUIComponents();
	
		lore.ore.ui.loreInfo("Welcome to LORE");
		lore.ore.createCompoundObject();
        
		if (lore.ore.ui.currentURL && lore.ore.ui.currentURL != "about:blank"
				&& lore.ore.ui.currentURL != '' && lore.ore.ui.lorevisible) {
			lore.ore.updateCompoundObjectsBrowseList(lore.ore.ui.currentURL);
			/**
			 * The URL for which compound object search results have been loaded
			 * in the tree
			 */
			lore.ore.ui.loadedURL = lore.ore.ui.currentURL;
		}
		/** Indicates whether the compound objects UI has been initialized */
		lore.ore.ui.initialized = true;
		lore.debug.ui("LORE Compound Object init complete", lore);
        Ext.Msg.hide();
        Ext.getCmp("drawingarea").focus();
        
	} catch (e) {
		lore.debug.ui("Exception in Compound Object init", e);
	}
}
