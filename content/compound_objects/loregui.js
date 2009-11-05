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
 * @include  "/oaiorebuilder/content/lib/ext/ux/uxvismode.js"
 * @include  "/oaiorebuilder/content/lib/ext/ux/StatusBar.js"
 */
/** Ext plugin to change hideMode to ensure tab contents are not destroyed/reloaded */
lore.ore.ui.vismode = new Ext.ux.plugin.VisibilityMode({hideMode: 'nosize', bubble: false});
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
                            title: "Editor",
                            xtype: "panel",
                            id: "drawingarea",
							autoScroll: true  
                        }, {
                            title: "Summary",
                            xtype: "panel",
                            id: "remlistview",
							autoScroll: true
        					
                        },{
                            title: "Slideshow",
                            id: "remslideview",
                            autoScroll: false
                        } /*,{
                            title: "SMIL",
                            xtype: "panel",
                            id: "remsmilview",
							autoScroll: true,
							closable: true
                        
                        }*/,{
                            title: "Explore",
                            id: "remexploreview",
                            autoScroll:true
                        }
                        //],
                       //.. activeTab: "drawingarea"
                    // }, {
				,{
                        title: "Using Compound Objects",
                        id: "welcome",
                        autoWidth: true,
                        autoScroll: true,
                        iconCls: "welcome-icon"
                    
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
        width: 300,
        minWidth: 3,
        split: true,
        
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
                xtype: "treepanel",
                title: "Browse",
                id: "sourcestree",
                animate: false,
                autoScroll: true,
                fitToFrame: true,
                rootVisible: false,
                containerScroll: true,
                border: false,
                enableDrag: true,
                enableDrop: false,
                ddGroup: "TreeDD",
                root: new Ext.tree.TreeNode({})
  
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
                    xtype: "treepanel",
                    title: "Search Results",
                    id: "searchtree",
                    animate: false,
                    autoScroll: true,
                    fitToFrame: true,
                    rootVisible: false,
                    border: false,
                    enableDrag: true,
                    enableDrop: false,
                    ddGroup: "TreeDD",
                    root: new Ext.tree.TreeNode({})  
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
                            {id: 'value',header: 'Value', dataIndex: 'value', menuDisabled:true, editor: new Ext.form.TextField({})}
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
		                    //xtype: "propertygrid",
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
	                            {id: 'value',header: 'Value', dataIndex: 'value', menuDisabled:true, editor: new Ext.form.TextField({})}
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
	
} catch (ex) {
	lore.debug.ui("Exception creating lore UI", ex);
}

lore.ore.disableUIFeatures = function(opts) {
    // TODO: should add UI elements back manually when re-enabling, but easier to reset via reload for now
    lore.debug.ui("LORE Compound Objects: disable ui features?", opts);
    lore.ore.ui.disabled = opts;
    
	if (!lore.ore.disableUIFeatures.initialCall) {
		lore.ore.disableUIFeatures.initialCall = 1;
	}
	else {
		if (opts.disable_compoundobjects) {
			lore.ore.ui.topView.setCompoundObjectsVisibility(false);
		}
		else {
			lore.ore.ui.topView.setCompoundObjectsVisibility(true);
		}
	}
}