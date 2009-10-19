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
 
/*
 * @include  "/oaiorebuilder/content/constants.js"
 * @include  "/oaiorebuilder/content/uiglobal.js"
 * @include  "/oaiorebuilder/content/debug.js"
 * @include  "/oaiorebuilder/content/compound_objects/loregui.js"
 */


/** Reference to the Extension */
lore.ore.ui.extension = Components.classes["@mozilla.org/extensions/manager;1"]
		.getService(Components.interfaces.nsIExtensionManager)
		.getInstallLocation(lore.constants.EXTENSION_ID)
		.getItemLocation(lore.constants.EXTENSION_ID);

/**
 * Create menus for adding/removing additional metadata properties
 * @param {Ext.grid.GridPanel} the_grid The property grid object on which to create the menus
 * @param {String} gridname The display name of the property grid
 */
lore.ore.ui.setUpMetadataMenu = function(the_grid, gridname) {
	var make_menu_entry = function(menu, gridname, propname, op) {
		var funcstr = "";
		funcstr += "var props = " + gridname + ".getSource();";
		if (op == "add") {
			funcstr += "if (props && !props[\"" + propname + "\"]){";
			funcstr += "props[\"" + propname + "\"] = \"\";";
		} else {
			funcstr += "if (props && typeof props[\"" + propname
					+ "\"] != \"undefined\"){";
			funcstr += "delete props[\"" + propname + "\"];";
		}
		funcstr += gridname + ".setSource(props);}";
		menu.add({
					id : menu.id + "-" + op + "-" + propname,
					text : propname,
					handler : new Function(funcstr)
				});
	};
	var addMetadataMenu = new Ext.menu.Menu({
				id : gridname + "-add-metadata-menu"
			});
	var remMetadataMenu = new Ext.menu.Menu({
				id : gridname + "-rem-metadata-menu"
			});
	for (var i = 0; i < lore.ore.METADATA_PROPS.length; i++) {
		make_menu_entry(addMetadataMenu, gridname, lore.ore.METADATA_PROPS[i],
				"add");
		make_menu_entry(remMetadataMenu, gridname, lore.ore.METADATA_PROPS[i],
				"rem");
	}
	if (gridname == "lore.ore.ui.nodegrid") {
		for (var i = 0; i < lore.ore.resource_metadata_props.length; i++) {
			make_menu_entry(addMetadataMenu, gridname,
					lore.ore.resource_metadata_props[i], "add");
			make_menu_entry(remMetadataMenu, gridname,
					lore.ore.resource_metadata_props[i], "rem");
		}
	}
    var tbar = the_grid.getTopToolbar(); 
    var addbtn = tbar.items.itemAt(0); 
    var rembtn = tbar.items.itemAt(1); 
	if (addbtn) {
		addbtn.menu = addMetadataMenu;
	}
	if (rembtn) {
		rembtn.menu = remMetadataMenu;
	}
}

/**
 * Initialise the graphical view
 */
lore.ore.ui.initGraphicalView = function() {
	lore.ore.ui.oreviews.activate("drawingarea");
	
	lore.ore.graph.lookup = {};
    lore.ore.loadedRDF = {};
	lore.ore.graph.modified = false;
	if (lore.ore.graph.Graph) {
		lore.ore.graph.Graph.getCommandStack()
				.removeCommandStackEventListener(lore.ore.graph.gCommandListener);
		lore.ore.graph.Graph.removeSelectionListener(lore.ore.graph.gSelectionListener);
		lore.ore.graph.Graph.clear();
	} else {
		lore.ore.graph.Graph = new draw2d.Workflow("drawingarea");
		lore.ore.graph.Graph.scrollArea = document.getElementById("drawingarea").parentNode;
	}
	lore.ore.graph.gSelectionListener = new lore.ore.graph.SelectionProperties(lore.ore.graph.Graph);
	lore.ore.graph.Graph.addSelectionListener(lore.ore.graph.gSelectionListener);
	lore.ore.graph.gCommandListener = new lore.ore.graph.CommandListener();
	lore.ore.graph.Graph.getCommandStack().addCommandStackEventListener(lore.ore.graph.gCommandListener);
	// selectedFigure is last selected figure - updated by
	// SelectionProperties.js
	lore.ore.graph.selectedFigure = null;
	lore.ore.graph.dummylayoutx = lore.ore.NODE_SPACING;
	lore.ore.graph.dummylayouty = lore.ore.NODE_SPACING;
}

/**
 * Load the preferences (which will init domain ontology)
 */
lore.ore.ui.loadPreferences = function() {
    try{
	  lore.ore.ui.topView.loadCompoundObjectPrefs();
    } catch (ex){
        alert(ex + " " + ex.stack);
    }
}

/**
 * Initialise property grids and set up listeners
 */
lore.ore.ui.initProperties = function() {
	var today = new Date();
	lore.ore.ui.grid.setSource({
				"rdf:about" : lore.ore.generateID(),
				"ore:describes" : "#aggregation",
				"dc:creator" : "",
				"dcterms:modified" : today,
				"dcterms:created" : today,
				"rdf:type" : lore.constants.RESOURCE_MAP,
                "dc:title" : ""
	});
	lore.ore.ui.nodegrid.on("propertychange", lore.ore.handleNodePropertyChange);
	lore.ore.ui.grid.on("beforeedit", function(e) {
				// don't allow these fields to be edited
				if (e.record.id == "ore:describes" 
                    || e.record.id == "rdf:type" 
                    || e.record.id == "rdf:about") {
					e.cancel = true;
				}
	});
    lore.ore.ui.grid.on("afteredit",function(e){
        if (e.record.id == "dc:title"){
            var treenode = lore.ore.ui.remstreeroot.findChild("id",lore.ore.currentREM);
            if (treenode){
                treenode.setText(e.value);
            }
            treenode = lore.ore.ui.recenttreeroot.findChild("id",lore.ore.currentREM + "r");
            if (treenode){
                treenode.setText(e.value);
            }
        }
    });
	lore.ore.ui.nodegrid.on("beforeedit", function(e) {
				// don't allow format field to be edited
				if (e.record.id == "dc:format") {
					e.cancel = true;
				}
			});
    
	lore.ore.ui.setUpMetadataMenu(lore.ore.ui.grid, "lore.ore.ui.grid");
	lore.ore.ui.setUpMetadataMenu(lore.ore.ui.nodegrid, "lore.ore.ui.nodegrid");
	lore.ore.ui.propertytabs.activate("sourcestree");
}
/**
 * Initialise the Extjs UI components and listeners
 */
lore.ore.ui.initExtComponents = function() {
	// set up glocal variable references to main UI components
	lore.ore.ui.propertytabs = Ext.getCmp("propertytabs");
	lore.ore.ui.grid = Ext.getCmp("remgrid");
	lore.ore.ui.nodegrid = Ext.getCmp("nodegrid");
	lore.ore.ui.status = Ext.getCmp("lorestatus");
	lore.ore.ui.oreviews = Ext.getCmp("loreviews");
	lore.ore.ui.textminingtab = Ext.getCmp("textmining");
    
	// set up the sources tree
	var sourcestreeroot = Ext.getCmp("sourcestree").getRootNode();
	lore.global.ui.clearTree(sourcestreeroot);
	
	lore.ore.ui.remstreeroot = new Ext.tree.TreeNode({
				id : "remstree",
				text : "Compound Objects",
				draggable : false,
				iconCls : "tree-ore"
			});
	lore.ore.ui.recenttreeroot = new Ext.tree.TreeNode({
				id : "recenttree",
				text : "Recently viewed Compound Objects",
				draggable : false,
				iconCls : "tree-ore"
			});
	
	sourcestreeroot.appendChild(lore.ore.ui.remstreeroot);
	sourcestreeroot.appendChild(lore.ore.ui.recenttreeroot);

	// set up event handlers
	lore.ore.ui.oreviews.on("beforeremove", lore.ore.closeView);
	// create a context menu to hide/show optional views
	lore.ore.ui.oreviews.contextmenu = new Ext.menu.Menu({
				id : "co-context-menu"
	});
	lore.ore.ui.oreviews.contextmenu.add({
        text: "Show Text Mining view",
        handler: function (){
            lore.ore.openView("remtmview","Text Mining",lore.ore.textm.requestTextMiningMetadata);
        }
    });
    lore.ore.ui.oreviews.contextmenu.add({
		text: "Show SMIL View",
		handler: function(){
            lore.ore.openView("remsmilview", "SMIL", lore.ore.showSMIL);
        }
	});
    lore.ore.ui.oreviews.contextmenu.add({
        text : "Show RDF/XML",
        handler : function (){
            lore.ore.openView("remrdfview","RDF/XML",lore.ore.updateRDFHTML);
        }
    });
    lore.ore.ui.oreviews.contextmenu.add({
       text: "Show TriG",
       handler: function (){
            lore.ore.openView("remtrigview","TriG",lore.ore.updateTriG);
       }
    });
    lore.ore.ui.oreviews.contextmenu.add({
       text: "Show FOXML",
       handler: function(){
            lore.ore.openView("remfoxmlview","FOXML",lore.ore.updateFOXML);
       }
    });
    lore.ore.ui.oreviews.contextmenu.add({
       text: "Show Tabular editor",
       handler: function (){
            lore.ore.openView("remgrideditor","Tabular Editor",lore.ore.refreshTabularEditor);
       }
    });
	lore.ore.ui.oreviews.on("contextmenu", function(tabpanel, tab, e){
        lore.ore.ui.oreviews.contextmenu.showAt(e.xy);
    });
    // summary tab
    Ext.getCmp("remlistview").on("activate", lore.ore.showCompoundObjectSummary);
    var smiltab = Ext.getCmp("remsmilview");
    var rdftab = Ext.getCmp("remrdfview");
    var slidetab = Ext.getCmp("remslideview");
    if (rdftab) {
        rdftab.on("activate", lore.ore.updateRDFHTML);
    }
    if (smiltab){
	   smiltab.on("activate", lore.ore.showSMIL);
    }
    if (slidetab){
        slidetab.on("activate",lore.ore.showSlideshow);
        slidetab.body.update("<div id='trailcarousel'></div>");
        lore.ore.ui.carousel = new Ext.ux.Carousel("trailcarousel", {
            itemSelector: "div.item",
            showPlayButton: true,
            transitionType: "fade"
        });
    }
    var exploretab = Ext.getCmp("remexploreview");
    var contents = "<script type='text/javascript' src='chrome://lore/content/lib/jit.js'></script>"
        + "<script type='text/javascript' src='chrome://lore/content/compound_objects/lore_explore.js'></script>"
        + "<a id='explorereset' style='z-index:999;position:absolute;bottom:10px;left:10px;font-size:x-small;color:#51666b' href='#' onclick='lore.ore.explore.showInExploreView(lore.ore.currentREM,\"Current Compound Object\");'>RESET VISUALISATION</a>"
        + "<div style='vertical-align:middle;height:1.5em;width:100%;text-align:right;overflow:hidden;font-size:smaller;color:#51666b;background-color:white;' id='history'></div>"
        + "<div id='infovis'></div>";
    exploretab.body.update(contents,true);
    exploretab.on("activate", lore.ore.showExploreUI);

	// set up welcome tab contents
	Ext.getCmp("welcome").body.update("<iframe height='100%' width='100%' "
			+ "src='chrome://lore/content/compound_objects/about_compound_objects.html'></iframe>");
            Ext.QuickTips.interceptTitles = true;
    Ext.QuickTips.init();
}


/**
 * Initialise Compound Objects component of LORE
 */
lore.ore.ui.init = function() {
    lore.ore.ui.disabled = {};
    
    lore.ui.vars=[]; for(var v in this){lore.ui.vars.push(v);} lore.ui.vars.sort();

    lore.debug.ui("vars (" + lore.ui.vars.length + ")", lore.ui.vars);
    try{
	
	lore.ore.ui.topView =  lore.global.ui.topWindowView.get(window.instanceId);
	lore.ore.ui.currentURL = window.top.getBrowser().selectedBrowser.contentWindow.location.href;
	lore.ore.resource_metadata_props = [];
	lore.ore.all_props = lore.ore.METADATA_PROPS;

	lore.ore.ui.lorevisible = lore.ore.ui.topView.compoundObjectsVisible();
	lore.ore.ui.initExtComponents();
    lore.ore.ui.initProperties();
	lore.ore.ui.initGraphicalView();
	lore.ore.ui.loreInfo("Welcome to LORE");
 
	lore.global.ui.compoundObjectView.registerView(lore.ore, window.instanceId);  
	lore.ore.ui.loadPreferences();  
	
	if (lore.ore.ui.currentURL && lore.ore.ui.currentURL != "about:blank"
			&& lore.ore.ui.currentURL != '' && lore.ore.ui.lorevisible) {          
		lore.ore.updateCompoundObjectsSourceList(lore.ore.ui.currentURL);
		lore.ore.ui.loadedURL = lore.ore.ui.currentURL;
	}
	lore.ore.ui.initialized = true;
	lore.debug.ui("LORE Compound Object init complete", lore);
    } catch (e) {
        lore.debug.ui("exception in ORE init",e);
    }
}

Ext.EventManager.onDocumentReady(lore.ore.ui.init);
