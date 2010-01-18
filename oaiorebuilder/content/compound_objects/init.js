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



/**
 * Initialise the graphical view
 */
lore.ore.ui.initGraphicalView = function() {
	lore.ore.ui.oreviews.activate("drawingarea");
	/** Used to lookup figures by their URIs in the graphical editor */
	lore.ore.graph.lookup = {};
    /** Triple store representing the compound object last loaded from the repository */
    lore.ore.loadedRDF = {};
    /** Indicates whether the compound object has been edited since being loaded */
	lore.ore.graph.modified = false;
	if (lore.ore.graph.coGraph) {
		lore.ore.graph.coGraph.getCommandStack()
				.removeCommandStackEventListener(lore.ore.graph.gCommandListener);
		lore.ore.graph.coGraph.removeSelectionListener(lore.ore.graph.gSelectionListener);
		lore.ore.graph.coGraph.clear();
	} else {
		lore.ore.graph.coGraph = new lore.ore.graph.COGraph("drawingarea");
		lore.ore.graph.coGraph.scrollArea = document.getElementById("drawingarea").parentNode;
	}
	lore.ore.graph.gSelectionListener = new lore.ore.graph.SelectionProperties(lore.ore.graph.coGraph);
	lore.ore.graph.coGraph.addSelectionListener(lore.ore.graph.gSelectionListener);
	lore.ore.graph.gCommandListener = new lore.ore.graph.CommandListener();
	lore.ore.graph.coGraph.getCommandStack().addCommandStackEventListener(lore.ore.graph.gCommandListener);

    // create drop target for dropping new nodes onto editor from the sources and search trees
    var droptarget = new Ext.dd.DropTarget("drawingarea",{'ddGroup':'TreeDD', 'copy':false});
    droptarget.notifyDrop = function (dd, e, data){
        lore.debug.ore("notifydrop",data);
        lore.ore.graph.addFigureWithOpts({
            url: data.node.attributes.uri, 
            x: (e.xy[0] - lore.ore.graph.coGraph.getAbsoluteX() + lore.ore.graph.coGraph.getScrollLeft()),
            y: (e.xy[1] - lore.ore.graph.coGraph.getAbsoluteY() + lore.ore.graph.coGraph.getScrollTop()),
            props: {"rdf:type_0":lore.constants.RESOURCE_MAP, "dc:title_0": data.node.text}
        });
        return true;
    };
    
	/** Most recently selected figure - updated in SelectionProperties.js */
	lore.ore.graph.selectedFigure = null;
    /** Used for layout of new nodes */
	lore.ore.graph.dummylayoutx = lore.ore.NODE_SPACING;
    /** Used for layout of new nodes */
	lore.ore.graph.dummylayouty = lore.ore.NODE_SPACING;
    // clear the node properties
    if (lore.ore.ui.nodegrid){
        lore.ore.ui.nodegrid.store.removeAll();
        lore.ore.ui.nodegrid.collapse();
    }
}

/**
 * Load the preferences (which will init domain ontology)
 */
lore.ore.ui.loadPreferences = function() {
    try{
	  lore.ore.ui.topView.loadCompoundObjectPrefs();
    } catch (ex){
        //alert(ex + " " + ex.stack);
        lore.debug.ore("error loading preferences",ex);
    }
}

/**
 * Initialise property grids and set up listeners
 */
lore.ore.ui.initProperties = function() {
	var dateString = lore.ore.getToday();
    lore.ore.currentREM = lore.ore.generateID();
    lore.ore.ui.nodegrid.on("afteredit", lore.ore.handleNodePropertyChange);
    lore.ore.ui.nodegrid.store.on("remove", lore.ore.handleNodePropertyRemove);
    
    lore.ore.ui.nodegrid.on("beforeedit", function(e) {
                // don't allow autocreated format or type field to be edited
                if (e.record.id == "dc:format_0" || e.record.id == "rdf:type_0") {
                    e.cancel = true;
                }
    });
    // TODO: is it possible to listen for deletion from property grid to remove from node?
    
	lore.ore.ui.grid.on("beforeedit", function(e) {
				// don't allow these fields to be edited
				if (//e.record.data.name == "ore:describes" 
                    //|| e.record.data.name == "rdf:type" 
                    //|| 
                    e.record.id == "dcterms:modified_0" || e.record.id == "dcterms:created_0" ||
                    e.record.id == "rdf:about_0") {
					e.cancel = true;
				}
	});
    // update the CO title in the tree if it is changed in the properties
    lore.ore.ui.grid.on("afteredit",function(e){
        if (e.record.id == "dc:title_0"){
            var treenode = lore.ore.ui.remstreeroot.findChild("id",lore.ore.currentREM);
            if (treenode){
                treenode.setText(e.value);
            }
            treenode = lore.ore.ui.recenttreeroot.findChild("id",lore.ore.currentREM + "r");
            if (treenode){
                treenode.setText(e.value);
            }
        }
        // commit the change to the datastore
        lore.ore.ui.grid.store.commitChanges();
    });
    // Fix collapsing so that the grids are hidden properly
    lore.ore.ui.grid.on('beforecollapse', lore.ore.ui.hideProps);
    lore.ore.ui.nodegrid.on('beforecollapse',lore.ore.ui.hideProps);
    
    lore.ore.ui.grid.on('beforeexpand', lore.ore.ui.showProps);
    lore.ore.ui.nodegrid.on('beforeexpand',lore.ore.ui.showProps);

	lore.ore.ui.propertytabs.activate("sourcestree");
}
    
/**
 * Initialise the Extjs UI components and listeners
 */
lore.ore.ui.initUIComponents = function() {
    
  /** Ext plugin to change hideMode to ensure tab contents are not destroyed/reloaded */
  lore.ore.ui.vismode = new Ext.ux.plugin.VisibilityMode({hideMode: 'nosize', bubble: false});
  
	lore.ore.resourceStore = new Ext.ux.data.PagingArrayStore({
	        fields: ['title', 'uri','display'], 
	        data: [],
	        lastOptions: {params: {start:0,limit:5}}
	});
	lore.ore.ui.resselectcombo = new Ext.form.ComboBox({
	    displayField:'display',
	    id: "resselectcombo",
	    itemSelector: 'div.res-listing',
	    emptyText: "Select resource to display... ",
	    triggerAction: "all",
	    mode: 'local',
	    pageSize: 5,
	    tpl: new Ext.XTemplate('<tpl for="."><div class="x-combo-list-item res-listing">',
	        '<h3>{title}</h3>',
	        '<i>{uri}</i>',
	        '</div></tpl>'),
	    valueField: 'uri',
	    typeAhead: false,
	    store: lore.ore.resourceStore
	});
	lore.ore.ui.propedittrigger = new Ext.form.TriggerField({
	    id: "propedittrigger",
	    'triggerClass': 'x-form-ellipsis-trigger',
	    'onTriggerClick': function(ev) {
	        lore.debug.ore("triggered for ",[this,ev]);
	        
	    }
	});
  /** Ext specification of compound objects UI */
  lore.ore.ui.gui_spec = {
    layout: "border",
    items: [{region:"north", layout: "fit"},{
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
                items: [{
                    xtype: "tabpanel",
                    id: "loreviews",
                    enableTabScroll: true,
                    plugins : lore.ore.ui.vismode,
                    deferredRender: false,
                    autoScroll: true,
                    items: [
                        {
                            title: "Graphical Editor",
                            xtype: "panel",
                            id: "drawingarea",
                            autoScroll: true  
                        },
                        {
                            title: "Summary",
                            xtype: "panel",
                            id: "remlistview",
                            autoScroll: true
                            
                        }, {
                            title: "Resource Details",
                            xtype: "panel",
                            autoScroll: true,
                            id: "remresedit",
                            layout: "border",
                            items: [
                                {
                                    region: "north",
                                    xtype: "panel",
                                    layout: "border",
                                    id: "resselect",
                                    height: 23,
                                    items:[
                                        {
                                            xtype: "panel",
                                            region:"center",
                                            layout: "fit",
                                            items:[
                                                lore.ore.ui.resselectcombo
                                            ]
                                        },{
                                            region: "east",
                                            width:20,
                                            xtype:"panel",
                                            html:"<div style='height:100%;width:100%;background-color:#d0d0d0'>"
                                            + "<a href='#' onclick='if(lore.ore.ui.resselectcombo.value){lore.global.util.launchTab(lore.ore.ui.resselectcombo.value, window);}'>"
                                            + "<img alt='go' title='Show in browser' style='padding-top:1px;padding-left:1px'"
                                            + " src='chrome://lore/skin/icons/page_go.png'>"
                                            + "</a></div>"
                                        }
                                    ]
                                    
                                    
                                },
                                {
                                    region: "west",
                                    split: true,
                                    layout: "fit",
                                    title: " ",
                                    //collapseMode:'mini',
                                    width: 150,
                                    xtype: "treepanel",
                                    id: "respreview",
                                    tools: [
                                    {
                                        id:'plus',
                                        qtip: 'Add a property or relationship',
                                        handler: lore.ore.ui.addProperty
                                    },
                                    {
                                        id:'minus',
                                        qtip: 'Remove the selected property or relationship',
                                        handler: lore.ore.ui.removeProperty
                                    }
                                    ],
                                    id: "resdetailstree",
                                    animate: false,
                                    autoScroll: true,
                                    fitToFrame: true,
                                    rootVisible: false,
                                    containerScroll: true,
                                    border: false,
                                    root: new Ext.tree.TreeNode({})
                                    },
                                {
                                    xtype: "panel",
                                    title: "Property / Relationship Editor",
                                    id: "respropeditor",
                                    disabled: true,
                                    split: true,
                                    region: "center",
                                    layout: "fit",
                                    
                                    tools:[
                                        
                                        {
                                            id: 'refresh',
                                            qtip: 'Cancel edits and restore original value',
                                            handler: lore.ore.ui.restorePropValue
                                        }
                                    ]
                                    /*,
                                    labelAlign: "top",
                                    items:[
                                        {
                                            xtype: "textarea",
                                            //fieldLabel: "Title",
                                            anchor: "100%",
                                            grow: true
                                        },
                                        {
                                            xtype: "textarea",
                                            fieldLabel: "Description",
                                            anchor: "100%",
                                            grow: true
                                        }
                                    ]*/
                                }
                            ]
                        }
                        ,{
                            title: "Slideshow",
                            id: "remslideview",
                            autoScroll: false,
                            html: "<div id='trailcarousel'></div>"
                        } ,{
                            title: "Explore",
                            id: "remexploreview",
                            forceLayout:true,
                            autoScroll:true
                        }
                ,{
                        title: "Using Compound Objects",
                        id: "welcome",
                        autoWidth: true,
                        autoScroll: true,
                        iconCls: "welcome-icon",
                        html: "<iframe height='100%' width='100%' src='chrome://lore/content/compound_objects/about_compound_objects.html'></iframe>"
                    
                    }]
                }
                ]
            }, {
                region: "south",
                xtype: "statusbar",
                id: "lorestatus",
                defaultText: "",
                autoClear: 6000
            }]
        }]
    }, {
        region: "west",       
        width: 280,
        
        split: true,
        collapseMode:'mini',
            id:"propertytabs",
            xtype:"tabpanel",
            deferredRender: false,
            enableTabScroll: true,
            defaults: {
            autoScroll: true
            },
            fitToFrame: true,
            items:[
            { 
                xtype: "cotree",
                title: "Browse",
                id: "sourcestree"
            }, {
                xtype: "panel",
                layout: "anchor",
                title: "Search",
                id: "searchpanel",
                items:[{
                    xtype: "tabpanel",
                    anchor: "100%",
                    id: "searchforms",
                    items: [
                    {
                      xtype: "panel",
                      layout: "hbox",
                      title: "Keyword",
                      id: "kwsearchform",
                      border: false,
                      autoHeight: true,
                      padding: 5,
                      items: [
                        {
                            xtype:"textfield",
                            id: "kwsearchval", 
                            listeners: {
                                specialkey: function(field,el){
                                    if (el.getKey() == Ext.EventObject.ENTER)
                                        Ext.getCmp("kwsearchbtn").fireEvent("click");
                                }
                            }
                        },
                        {
                            xtype: "button",
                            text: 'Search',
                            id: 'kwsearchbtn',
                            tooltip: 'Run the search'
                        }
                     ]
                    },
                    {
                        title: "Advanced",
                        xtype: "form",
                        id: "advsearchform",
                        border: false,
                        buttons: [{
                            text: 'Search',
                            id: 'advsearchbtn',
                            tooltip: 'Run the search'
                        }
                        ],
                        keys: [{ key: [10, 13], fn: function() {
                                Ext.getCmp("advsearchbtn").fireEvent('click');
                            }
                        }],
                        items: [
                        {
                            xtype: "label",
                            text: "Find Compound Objects",
                            style: "font-family: arial, tahoma, helvetica, sans-serif; font-size:11px;line-height:2em"
                        },
                        {
                            xtype:"textfield",
                            fieldLabel: "containing",
                            id: "searchuri",
                            emptyText: "any resource"
                        },
                        {
                            xtype: "combo",
                            fieldLabel: "having",
                            id: "searchpred",
                            mode: 'local',
                            typeAhead: true,
                            displayField: 'curie',
                            valueField: 'uri',
                            emptyText: "any property or relationship",
                            store: new Ext.data.ArrayStore({
                                fields: ['uri','curie'],
                                data: []
                            })
                        },
                        {
                            xtype: "textfield",
                            fieldLabel: "matching",
                            id: "searchval",
                            emptyText: ""
                        }/*,
                        {
                            xtype: "checkbox",
                            id: "searchexact",
                            boxLabel: "exactly"
                        }*/
                        ]
                    }]
                }, {
                    anchor: "100%",
                    xtype: "cotree",
                    title: "Search Results",
                    id: "searchtree" 
                }]
            }, {
                xtype: "panel",
                layout: "anchor",
                title: "Properties",
                id: "properties",
                items: [{
                        xtype: "editorgrid",
                        clicksToEdit: 1,
                        columnLines: true,
                        store: new Ext.data.JsonStore({
                            idProperty: 'id',
                            fields: [{name: 'id',type:'string'},{name: 'name',type:'string'},{name: 'value', type:'string'}]
                        }),
                        colModel: new Ext.grid.ColumnModel({
                            columns: [
                            {id: 'name', header: 'Property Name', sortable: true, dataIndex: 'name',menuDisabled:true},
                            {id: 'value',header: 'Value', dataIndex: 'value', menuDisabled:true, 
                            editor:  lore.ore.ui.propedittrigger
                            }
                            ]
                        }),
                        sm: new Ext.grid.RowSelectionModel({singleSelect: true}),
                        title: 'Compound Object Properties',
                        tools: [
                            {
                                id:'plus',
                                qtip: 'Add a property',
                                handler: lore.ore.ui.addProperty
                            },
                            {
                                id:'minus',
                                qtip: 'Remove the selected property',
                                handler: lore.ore.ui.removeProperty
                            }, {
                                id: 'help',
                                qtip: 'Display information about the selected property',
                                handler: lore.ore.ui.helpProperty
                            }
                        ],
                        collapsible: true,
                        animCollapse: false,
                        id: "remgrid",
                        autoHeight: true,
                        anchor: "100%",
                        viewConfig: {
                            forceFit: true,
                            scrollOffset: 0
                        }
                     }, {
                            xtype: "editorgrid",
                            clicksToEdit: 1,
                            columnLines: true,
                            store: new Ext.data.JsonStore({
                                idProperty: 'id',
                                fields: [{name: 'id',type:'string'},{name: 'name',type:'string'},{name: 'value', type:'string'}]
                            }),
                            colModel: new Ext.grid.ColumnModel({
                                columns: [
                                {id: 'name', header: 'Property Name', sortable: true, dataIndex: 'name',menuDisabled:true},
                                {id: 'value',header: 'Value', dataIndex: 'value', menuDisabled:true, 
                                editor:  lore.ore.ui.propedittrigger
                                }
                                
                                
                                ]
                            }),
                            sm: new Ext.grid.RowSelectionModel({singleSelect: true}),
                            title: "Resource/Relationship Properties",
                            id: "nodegrid",
                            autoHeight:true,
                            anchor: "100%",
                            collapsed: true,
                            viewConfig: {
                                forceFit: true,
                                scrollOffset: 0
                            },
                            collapsible: true,
                            animCollapse: false,
                            tools: [
                            {
                                id:'plus',
                                qtip: 'Add a property',
                                handler: lore.ore.ui.addProperty
                            },
                            {
                                id:'minus',
                                qtip: 'Remove the selected property',
                                handler: lore.ore.ui.removeProperty
                            }, {
                                id: 'help',
                                qtip: 'Display information about the selected property',
                                handler: lore.ore.ui.helpProperty
                            }
                            ]
                      }
              ]}
         ]
    }
    ]};
    try {
        lore.ore.ui.main_window = new Ext.Viewport(lore.ore.ui.gui_spec);
        lore.ore.ui.main_window.show();    
    } catch (e){
        lore.debug.ore("Error creating Ext UI components",e);
    }
    
    
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
	/** The root of the tree used to display compound objects related to the resource loaded in the browser */
	lore.ore.ui.remstreeroot = new lore.ore.ui.CompoundObjectGroupNode({
		id : "remstree",
		text : "Related Compound Objects",
        qtip: "Compound Objects that refer to the page displayed in the web browser"
	});
    lore.ore.ui.remstreeroot.addModel(lore.ore.coListManager.getList("browse"));
    // display browse tree if nodes are added
    lore.ore.ui.remstreeroot.on("append",function(){
       lore.ore.ui.propertytabs.activate("sourcestree"); 
    });
    /** The root of the tree used to display compound objects from history */
	lore.ore.ui.recenttreeroot = new lore.ore.ui.CompoundObjectGroupNode({
		id : "recenttree",
		text : "Recently Viewed Compound Objects",
        qtip: "Compound Objects that have been viewed during this browsing session",
        reverse: true
	});
    lore.ore.ui.recenttreeroot.addModel(lore.ore.coListManager.getList("history"));

	sourcestreeroot.appendChild(lore.ore.ui.remstreeroot);
	sourcestreeroot.appendChild(lore.ore.ui.recenttreeroot);
    
    /** Tree used to display search results */
    lore.ore.ui.searchtreeroot = new lore.ore.ui.CompoundObjectGroupNode({
        id: "searchtree",
        text: "Search Results"
    });
    lore.ore.ui.searchtreeroot.addModel(lore.ore.coListManager.getList("search"));
    Ext.getCmp("searchtree").getRootNode().appendChild(lore.ore.ui.searchtreeroot);
    
    
    /** Tree used to display properties in resource details editor */
    lore.ore.ui.resproptreeroot = new Ext.tree.TreeNode({
        id: "resproptree",
        text: "Properties",
        qtip: "The resource's properties",
        iconCls: "tree-ore"
    });
    
    
    /** Tree used to display relationships in resource details editor */
    lore.ore.ui.resreltreeroot = new Ext.tree.TreeNode({
        id: "resreltree",
        text: "Relationships",
        qtip: "The resource's relationships",
        iconCls: "tree-ore"
    });
    var resdetailstree = Ext.getCmp("resdetailstree").getRootNode();
    resdetailstree.appendChild(lore.ore.ui.resproptreeroot);
    resdetailstree.appendChild(lore.ore.ui.resreltreeroot);
    lore.ore.ui.resproptreeroot.on("beforeclick",lore.ore.updateResDetails);
    lore.ore.ui.resreltreeroot.on("beforeclick",lore.ore.updateResDetails);
    
    // set up search handlers
    Ext.getCmp("advsearchbtn").on('click', lore.ore.advancedSearch);
    Ext.getCmp("kwsearchbtn").on('click', lore.ore.keywordSearch);
    Ext.getCmp("searchforms").activate("kwsearchform");
    // populate search combo with dublin core fields
    try {
    var searchproplist = [];
    for (var p = 0; p < lore.ore.METADATA_PROPS.length; p++){
        var curie = lore.ore.METADATA_PROPS[p];
        var splitprop = curie.split(":");
        searchproplist.push(["" + lore.constants.NAMESPACES[splitprop[0]] + splitprop[1],curie]);
    }

    Ext.getCmp("searchpred").getStore().loadData(searchproplist);
    //Ext.getCmp("searchpred").getStore().commitChanges();
    //lore.debug.ore("store is",Ext.getCmp("searchpred").getStore());
    } catch (e){
        lore.debug.ui("error setting up search combo",e);
    }

    // load resource details handler
    lore.ore.ui.resselectcombo.on("select",lore.ore.loadResourceDetails);
    
    // set up event handlers for tabs
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
    
	lore.ore.ui.oreviews.on("contextmenu", function(tabpanel, tab, e){
        lore.ore.ui.oreviews.contextmenu.showAt(e.xy);
    });
    // summary tab
    Ext.getCmp("remlistview").on("activate", lore.ore.showCompoundObjectSummary);
    var rdftab = Ext.getCmp("remrdfview");
    if (rdftab) {
        rdftab.on("activate", lore.ore.updateRDFHTML);
    }
    var smiltab = Ext.getCmp("remsmilview");
    if (smiltab){
	   smiltab.on("activate", lore.ore.showSMIL);
    }
    var slidetab = Ext.getCmp("remslideview");
    try {
        lore.ore.ui.carousel = new Ext.ux.Carousel("trailcarousel", {
            itemSelector: "div.item",
            showPlayButton: true,
            transitionType: "fade",
            interval: 7
        });
    } catch (e){
        lore.debug.ore("error setting up carousel",e);
    }
    
    slidetab.on("activate",lore.ore.showSlideshow);
    slidetab.on("resize",lore.ore.resizeSlideshow);

    var exploretab = Ext.getCmp("remexploreview");
	var contents = "<script type='text/javascript' src='chrome://lore/content/lib/jit.js'></script>"
	        + "<script type='text/javascript' src='chrome://lore/content/compound_objects/lore_explore.js'></script>"
	        + "<a id='explorereset' style='z-index:999;position:absolute;bottom:10px;left:10px;font-size:x-small;color:#51666b' href='#' onclick='lore.ore.explore.showInExploreView(lore.ore.currentREM,\"Current Compound Object\");'>RESET VISUALISATION</a>"
	        + "<div style='vertical-align:middle;height:1.5em;width:100%;text-align:right;overflow:hidden;font-size:smaller;color:#51666b;background-color:white;' id='history'></div>"
	        + "<div id='infovis'></div>";
	exploretab.body.update(contents,true);
    exploretab.on("activate", lore.ore.showExploreUI);
    Ext.QuickTips.interceptTitles = true;
    Ext.QuickTips.init();
}

lore.ore.ui.initHistory = function (){
    lore.ore.historyService = Components.classes["@mozilla.org/browser/nav-history-service;1"]
              .getService(Components.interfaces.nsINavHistoryService);
    var observer = {
	  onBeginUpdateBatch: function() {
	  },
	  onEndUpdateBatch: function() {
        lore.global.ui.clearTree(lore.ore.ui.recenttreeroot);
        lore.ore.displayHistory();
	  },
	  onVisit: function(aURI, aVisitID, aTime, aSessionID, aReferringID, aTransitionType) {
	  },
	  onTitleChanged: function(aURI, aPageTitle) {
	  },
	  onDeleteURI: function(aURI) {
        var thenode = lore.ore.ui.recenttreeroot.findChild('id',aURI.spec + "r");
        if (thenode){
            lore.ore.ui.recenttreeroot.removeChild(thenode);
        }
	  },
	  onClearHistory: function() {
        lore.global.ui.clearTree(lore.ore.ui.recenttreeroot);
	  },
	  onPageChanged: function(aURI, aWhat, aValue) {
	  },
	  onPageExpired: function(aURI, aVisitTime, aWholeEntry) {
	  },
	  QueryInterface: function(iid) {
	    if (iid.equals(Components.interfaces.nsINavHistoryObserver) ||
	        iid.equals(Components.interfaces.nsISupports)) {
	      return this;
	    }
	    throw Components.results.NS_ERROR_NO_INTERFACE;
      }
    };
    lore.ore.historyService.addObserver(observer,false);
    lore.ore.displayHistory();
}

lore.ore.initModel = function (){
    lore.ore.coListManager = new lore.ore.model.CompoundObjectListManager();    
}

lore.ore.ui.initVars = function (){
    lore.ui.vars=[]; 
    for(var v in this){
        lore.ui.vars.push(v);
    } 
    lore.ui.vars.sort();
}

/**
 * Initialise Compound Objects component of LORE
 */
lore.ore.ui.init = function() {
    try{
        /** Used to store options relating to parts of the UI that should be disabled */
        lore.ore.ui.disabled = {};
        lore.ore.ui.initVars();
        //lore.debug.ui("vars (" + lore.ui.vars.length + ")", lore.ui.vars);
    
        /** Reference to the Extension */
        lore.ore.ui.extension = Components.classes["@mozilla.org/extensions/manager;1"]
            .getService(Components.interfaces.nsIExtensionManager)
            .getInstallLocation(lore.constants.EXTENSION_ID)
            .getItemLocation(lore.constants.EXTENSION_ID);

    
		lore.ore.ui.topView =  lore.global.ui.topWindowView.get(window.instanceId);
        
	    /** The url shown in the current browser tab */
		lore.ore.ui.currentURL = window.top.getBrowser().selectedBrowser.contentWindow.location.href;
		lore.ore.resource_metadata_props = [];
		lore.ore.all_props = lore.ore.METADATA_PROPS;

        /** Indicates whether the ore UI is visible */
	    lore.ore.ui.lorevisible = lore.ore.ui.topView.compoundObjectsVisible();
           
	    
        lore.ore.initModel();
        
		lore.ore.ui.initUIComponents();
	    lore.ore.ui.initProperties();
		lore.ore.ui.initHistory();
	    lore.ore.ui.loreInfo("Welcome to LORE");
	 
		lore.global.ui.compoundObjectView.registerView(lore.ore, window.instanceId);  
		lore.ore.ui.loadPreferences();  
        
		lore.ore.createCompoundObject();
		if (lore.ore.ui.currentURL && lore.ore.ui.currentURL != "about:blank"
				&& lore.ore.ui.currentURL != '' && lore.ore.ui.lorevisible) {          
			lore.ore.updateCompoundObjectsBrowseList(lore.ore.ui.currentURL);
	        /** The URL for which compound object search results have been loaded in the tree */
			lore.ore.ui.loadedURL = lore.ore.ui.currentURL;
		}
	    /** Indicates whether the compound objects UI has been initialized */
		lore.ore.ui.initialized = true;
		lore.debug.ui("LORE Compound Object init complete", lore);
    } catch (e) {
        lore.debug.ui("exception in ORE init",e);
    }
}

