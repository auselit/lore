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
    lore.debug.ui("set up metadata menu",lore.ore.METADATA_PROPS);
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
	var addbtn = Ext.getCmp('maddbtn');
	var rembtn = Ext.getCmp('mrembtn');
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
	lore.ui.compoundobjecttab.activate("drawingarea");
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
				.getElementById("drawingarea");
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
	lore.anno.annotabsm = Ext.getCmp("annotationslist").getSelectionModel();
	lore.anno.annotabds = Ext.getCmp("annotationslist").getStore();
	lore.ui.annotationsform = Ext.getCmp("annotationslistform").getForm();
	lore.ui.loreviews = Ext.getCmp("loreviews");
	lore.ui.welcometab = Ext.getCmp("welcome");
	lore.ui.summarytab = Ext.getCmp("remlistview");
	var smiltab = Ext.getCmp("remsmilview");
    var rdftab = Ext.getCmp("remrdfview");
    lore.ui.exploretab = Ext.getCmp("remexploreview");
	lore.ui.compoundobjecttab = Ext.getCmp("compoundobjecteditor");
	lore.ui.textminingtab = Ext.getCmp("textmining");
	// set up the sources tree
	var sourcestreeroot = Ext.getCmp("sourcestree").getRootNode();
	lore.ui.clearTree(sourcestreeroot);
	lore.ui.annotationstreeroot = new Ext.tree.TreeNode({
				id : "annotationstree",
				text : "Annotations",
				draggable : false,
				iconCls : "tree-anno"
			});
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
	sourcestreeroot.appendChild(lore.ui.annotationstreeroot);
	sourcestreeroot.appendChild(lore.ui.remstreeroot);
	sourcestreeroot.appendChild(lore.ui.recenttreeroot);

	// set up event handlers
	lore.ui.compoundobjecttab.on("beforeremove", lore.ore.closeView);
	// create a context menu for the compound object tab to hide/show RDF/XML
	// Tab
	lore.ui.compoundobjecttab.contextmenu = new Ext.menu.Menu({
				id : "co-context-menu"
			});
	lore.ui.compoundobjecttab.contextmenu.add({
		text : "Show RDF/XML",
		handler : lore.ore.openRDFView
	});
    lore.ui.compoundobjecttab.contextmenu.add({
        text: "Show SMIL",
        handler : lore.ore.openSMILView
    });
	lore.ui.loreviews.on("contextmenu", function(tabpanel, panel, e) {
				if (panel.id == 'compoundobjecteditor') {
					lore.ui.compoundobjecttab.contextmenu.showAt(e.xy);
				}
			});
	lore.ui.summarytab.on("activate", lore.ore.showCompoundObjectSummary);
    if (rdftab) {
        rdftab.on("activate", lore.ore.updateRDFHTML);
    }
    if (smiltab){
	   smiltab.on("activate", lore.ore.showSMIL);
    }
    if (lore.ui.exploretab){
        lore.ui.exploretab.on("activate", lore.ore.showExploreUI);
    }
	lore.anno.annotabsm
			.on('rowdeselect', lore.anno.handleAnnotationDeselection);
	lore.anno.annotabsm.on('rowselect', lore.anno.handleAnnotationSelection);
	Ext.getCmp("cancelupdbtn")
			.on('click', lore.anno.handleCancelAnnotationEdit);
	Ext.getCmp("updannobtn").on('click', lore.anno.handleSaveAnnotationChanges);
	Ext.getCmp("delannobtn").on('click', function (){
       Ext.Msg.show({
        title:'Delete annotation',
        msg: 'Are you sure you want to delete this annotation forever?',
        buttons: Ext.Msg.YESNO,
        fn: function(btn) {if(btn == 'yes')lore.anno.handleDeleteAnnotation();},
        animEl: 'delannobtn',
        icon: Ext.Msg.QUESTION
       });
    
    });
	Ext.getCmp("updctxtbtn").on('click',
			lore.anno.handleUpdateAnnotationContext);
	Ext.getCmp("updrctxtbtn").on('click',
			lore.anno.handleUpdateAnnotationVariantContext);
	Ext.getCmp("variantfield").on('specialkey', lore.anno.launchFieldWindow);
	Ext.getCmp("originalfield").on('specialkey', lore.anno.launchFieldWindow);
	Ext.getCmp("typecombo").on('valid', lore.anno.handleAnnotationTypeChange);
	lore.anno.setAnnotationFormUI(false);

	// set up variation annotations panel
	var variationsPanel = Ext.getCmp("variationannotations");
	variationsPanel.on("render", lore.anno.onVariationsShow);
	variationsPanel.on("show", lore.anno.onVariationsShow);
	variationsPanel.on("resize", lore.anno.onVariationsShow);
	var variationsListing = Ext.getCmp("variationannotationlisting");
	variationsListing.on("rowclick", lore.anno.onVariationListingClick);
	lore.anno.onVariationsShow(variationsPanel);
	// listen for frame load events (used to do highlighting in revision frames)
	window.addEventListener("DOMFrameContentLoaded", lore.anno.handleFrameLoad,
			true);

	// set up welcome tab contents
	lore.ui.welcometab.body.update("<iframe height='100%' width='100%' "
			+ "src='chrome://lore/content/welcome.html'></iframe>");
            Ext.QuickTips.interceptTitles = true;
    Ext.QuickTips.init();
}

/**
 * Create a Timeline visualisation
 */
lore.ui.initTimeline = function() {
	var tl = Ext.getCmp("annotimeline");
	if (typeof Timeline !== "undefined") {
		lore.anno.annoEventSource = new Timeline.DefaultEventSource();
        var theme = Timeline.ClassicTheme.create();
        theme.event.bubble.width = 350;
		var bandConfig = [Timeline.createBandInfo({
							eventSource : lore.anno.annoEventSource,
                            theme: theme,
							width : "90%",
							intervalUnit : Timeline.DateTime.WEEK,
							intervalPixels : 80,
							timeZone : 10,
                            layout: "original"
						}), Timeline.createBandInfo({
							eventSource : lore.anno.annoEventSource,
                            theme: theme,
                            //showEventText:  false,
							width : "10%",
							intervalUnit : Timeline.DateTime.MONTH,
							intervalPixels : 345,
							timeZone : 10,
                            layout: "overview"
						})];
		bandConfig[1].syncWith = 0;
		bandConfig[1].highlight = true;
		lore.anno.annotimeline = Timeline.create(document
						.getElementById("annotimeline"), bandConfig, Timeline.HORIZONTAL);
		tl.on("resize", function() {
			lore.anno.annotimeline.layout();
		});
	}
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
    lore.ui.initTimeline();
	lore.ui.initGraphicalView();
	lore.ui.loreInfo("Welcome to LORE");
    
	if (lore.ui.currentURL && lore.ui.currentURL != 'about:blank'
			&& lore.ui.currentURL != '' && lore.ui.lorevisible) {          
		lore.ui.updateSourceLists(lore.ui.currentURL);
	}
	lore.debug.ui("LORE init complete", this);
    } catch (e) {
        lore.debug.ui("exception in init",e);
    }
}

Ext.EventManager.onDocumentReady(lore.ui.init);
