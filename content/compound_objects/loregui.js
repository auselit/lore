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

lore.ore.ui.vismode = new Ext.ux.plugin.VisibilityMode({hideMode: 'nosize', bubble: false});
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
        id: "loresidebar",
        title: "LORE Compound Objects",         
        width: 300,
        minWidth: 100,
        split: true,
        collapsible: true,
        animCollapse: false, 
        layout: "fit",
        items: [{
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
                title: "Compound Objects",
                id: "sourcestree",
                animate: false,
                autoScroll: true,
                fitToFrame: true,
                rootVisible: false,
                containerScroll: true,
                border: false,
                root: new Ext.tree.TreeNode({}),
                dropConfig: {
                    appendOnly: true
                }    
            }, {
                xtype: 'propertygrid',
                title: 'Compound Object Properties',
                id: "remgrid",
                autoWidth: true,
                viewConfig: {
                    forceFit: true,
                    scrollOffset: 0
                },
                tbar: [new Ext.Button({
                    id: "maddbtn",
                    text: "Add property"
                }), new Ext.Button({
                    id: "mrembtn",
                    text: "Remove property"
                })]
             }, {
                    xtype: "propertygrid",
                    title: "Resource/Relationship Properties",
                    id: "nodegrid",
                    autoWidth: true,
                    viewConfig: {
                        forceFit: true,
                        scrollOffset: 0
                    },
                    tbar: [new Ext.Button({
                        text: "Add property"
                    }), new Ext.Button({
                        text: "Remove property"
                    })]
              }
         ]
            }
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