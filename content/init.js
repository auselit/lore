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

// Reference to the Extension
lore.ui.extension = Components.classes["@mozilla.org/extensions/manager;1"]
		.getService(Components.interfaces.nsIExtensionManager)
		.getInstallLocation(lore.constants.EXTENSION_ID)
		.getItemLocation(lore.constants.EXTENSION_ID);

/**
 * create menus to add/remove additional metadata properties
 * 
 * @param {Object}
 *            the_grid The property grid object on which to create the menus
 * @param {Object}
 *            gridname The display name of the property grid
 */
lore.ui.setUpMetadataMenu = function(the_grid, gridname) {
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
	if (gridname == "lore.ui.nodegrid") {
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
lore.ui.initGraphicalView = function() {
	lore.ui.loreviews.activate("drawingarea");
	
	lore.ore.graph.lookup = {};
	lore.ore.graph.modified = false;
	if (lore.ore.graph.Graph) {
		lore.ore.graph.Graph
				.getCommandStack()
				.removeCommandStackEventListener(lore.ore.graph.gCommandListener);
		lore.ore.graph.Graph
				.removeSelectionListener(lore.ore.graph.gSelectionListener);
		lore.ore.graph.Graph.clear();
	} else {
		lore.ore.graph.Graph = new draw2d.Workflow("drawingarea");
		lore.ore.graph.Graph.scrollArea = document
				.getElementById("drawingarea").parentNode;
	}
	lore.ore.graph.gSelectionListener = new lore.ore.graph.SelectionProperties(lore.ore.graph.Graph);
	lore.ore.graph.Graph
			.addSelectionListener(lore.ore.graph.gSelectionListener);
	lore.ore.graph.gCommandListener = new lore.ore.graph.CommandListener();
	lore.ore.graph.Graph.getCommandStack()
			.addCommandStackEventListener(lore.ore.graph.gCommandListener);
	// selectedFigure is last selected figure - updated by
	// SelectionProperties.js
	lore.ore.graph.selectedFigure = null;
	lore.ore.graph.dummylayoutx = lore.ore.NODE_SPACING;
	lore.ore.graph.dummylayouty = lore.ore.NODE_SPACING;
}
/**
 * Load domain ontology
 */
lore.ui.initOntologies = function() {
	lore.ore.ontrelationships = {};
    
    try{
	window.parent.loreoverlay.loadPrefs();
    } catch (ex){
        alert(ex.toString());
    }
	lore.ore.loadRelationshipsFromOntology();
    
}
/**
 * Initialise property grids and set up listeners
 */
lore.ui.initProperties = function() {
	var today = new Date();
	lore.ui.grid.setSource({
				"rdf:about" : lore.ore.generateID(),
				"ore:describes" : "#aggregation",
				"dc:creator" : "",
				"dcterms:modified" : today,
				"dcterms:created" : today,
				"rdf:type" : lore.constants.RESOURCE_MAP,
                "dc:title" : ""
	});
	lore.ui.nodegrid.on("propertychange", lore.ore.handleNodePropertyChange);
	lore.ui.grid.on("beforeedit", function(e) {
				// don't allow these fields to be edited
				if (e.record.id == "ore:describes" 
                    || e.record.id == "rdf:type" 
                    || e.record.id == 'rdf:about') {
					e.cancel = true;
				}
	});
    lore.ui.grid.on("afteredit",function(e){
        if (e.record.id == "dc:title"){
            var treenode = lore.ui.remstreeroot.findChild('id',lore.ore.currentREM);
            if (treenode){
                treenode.setText(e.value);
            }
            treenode = lore.ui.recenttreeroot.findChild('id',lore.ore.currentREM + "r");
            if (treenode){
                treenode.setText(e.value);
            }
        }
    });
	lore.ui.nodegrid.on("beforeedit", function(e) {
				// don't allow format field to be edited
				if (e.record.id == "dc:format") {
					e.cancel = true;
				}
			});
    
	lore.ui.setUpMetadataMenu(lore.ui.grid, "lore.ui.grid");
	lore.ui.setUpMetadataMenu(lore.ui.nodegrid, "lore.ui.nodegrid");
	lore.ui.propertytabs.activate("remgrid");
}
/**
 * Initialise the Extjs UI components and listeners
 */
lore.ui.initExtComponents = function() {
	// set up glocal variable references to main UI components
	lore.ui.propertytabs = Ext.getCmp("propertytabs");
	lore.ui.grid = Ext.getCmp("remgrid");
	lore.ui.nodegrid = Ext.getCmp('nodegrid');
	lore.ui.lorestatus = Ext.getCmp('lorestatus');
	lore.ui.loreviews = Ext.getCmp("loreviews");
	lore.ui.welcometab = Ext.getCmp("welcome");
	lore.ui.summarytab = Ext.getCmp("remlistview");
	
    lore.ui.exploretab = Ext.getCmp("remexploreview");
	
	lore.ui.textminingtab = Ext.getCmp("textmining");
	// set up the sources tree
	var sourcestreeroot = Ext.getCmp("sourcestree").getRootNode();
	lore.ui.clearTree(sourcestreeroot);
	
	lore.ui.remstreeroot = new Ext.tree.TreeNode({
				id : "remstree",
				text : "Compound Objects",
				draggable : false,
				iconCls : "tree-ore"
			});
	lore.ui.recenttreeroot = new Ext.tree.TreeNode({
				id : "recenttree",
				text : "Recently viewed Compound Objects",
				draggable : false,
				iconCls : "tree-ore"
			});
	
	sourcestreeroot.appendChild(lore.ui.remstreeroot);
	sourcestreeroot.appendChild(lore.ui.recenttreeroot);

	// set up event handlers
	lore.ui.loreviews.on("beforeremove", lore.ore.closeView);
	// create a context menu to hide/show optional views
	lore.ui.loreviews.contextmenu = new Ext.menu.Menu({
				id : "co-context-menu"
			});
	lore.ui.loreviews.contextmenu.add({
		text : "Show RDF/XML",
		handler : lore.ore.openRDFView
	});
    lore.ui.loreviews.contextmenu.add({
		text: "Show SMIL",
		handler: lore.ore.openSMILView
	});
	lore.ui.loreviews.on("contextmenu", function(tabpanel, tab, e){
        lore.ui.loreviews.contextmenu.showAt(e.xy);
    });
	lore.ui.summarytab.on("activate", lore.ore.showCompoundObjectSummary);
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
        lore.ui.carousel = new Ext.ux.Carousel('trailcarousel', {
            itemSelector: 'div.item',
            showPlayButton: true,
            transitionType: 'fade'
        });
    }
    if (lore.ui.exploretab){
        var contents = "<script type='text/javascript' src='chrome://lore/content/lib/jit.js'></script>"
        + "<script type='text/javascript' src='chrome://lore/content/graphs/lore_explore.js'></script>"
        + "<a id='explorereset' style='z-index:999;position:absolute;bottom:10px;left:10px;font-size:x-small;color:#51666b' href='#' onclick='lore.ore.explore.showInExploreView(lore.ore.currentREM,\"Current Compound Object\");'>RESET VISUALISATION</a>"
        + "<div style='vertical-align:middle;height:1.5em;width:100%;text-align:right;overflow:hidden;font-size:smaller;color:#51666b;background-color:white;' id='history'></div>"
        + "<div id='infovis'></div>";
        lore.ui.exploretab.body.update(contents,true);
        lore.ui.exploretab.on("activate", lore.ore.showExploreUI);
    }
	
	// set up welcome tab contents
	lore.ui.welcometab.body.update("<iframe height='100%' width='100%' "
			+ "src='chrome://lore/content/welcome.html'></iframe>");
            Ext.QuickTips.interceptTitles = true;
    Ext.QuickTips.init();
}


/**
 * Initialise LORE
 */
lore.ui.init = function() {
    lore.ui.disabled = {};
    
    lore.ui.vars=[]; for(var v in this){lore.ui.vars.push(v);} lore.ui.vars.sort();

    lore.debug.ui("vars (" + lore.ui.vars.length + ")", lore.ui.vars);
    
    try{
	lore.m_xps = new XPointerService();
	lore.ui.currentURL = window.top.getBrowser().selectedBrowser.contentWindow.location.href;
	lore.ore.resource_metadata_props = [];
	lore.ore.all_props = lore.ore.METADATA_PROPS;
	if (window.parent.document.getElementById('oobContentBox')
			.getAttribute("collapsed") == "true") {
		lore.ui.lorevisible = false;
	} else {
		lore.ui.lorevisible = true;
	}
	lore.ui.initExtComponents();
    lore.ui.initProperties();
    lore.ui.initOntologies();
	lore.ui.initGraphicalView();
	lore.ui.loreInfo("Welcome to LORE");
    
	if (lore.ui.currentURL && lore.ui.currentURL != 'about:blank'
			&& lore.ui.currentURL != '' && lore.ui.lorevisible) {          
		lore.ore.updateCompoundObjectsSourceList(lore.ui.currentURL);
		lore.ui.loadedURL = lore.ui.currentURL;
	}
	lore.debug.ui("LORE Compound Object init complete", this);
    } catch (e) {
        lore.debug.ui("exception in init",e);
    }
}

Ext.EventManager.onDocumentReady(lore.ui.init);
