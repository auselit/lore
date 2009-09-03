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

lore.ui.vismode = new Ext.ux.plugin.VisibilityMode({hideMode: 'nosize', bubble: false});
lore.ui.gui_spec = {
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
					plugins : lore.ui.vismode,
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
					title: "Text mining",
					id: "textmining",
					autoWidth: true,
					autoScroll:true
				},{
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
    }   
    , {
        region: "west",
        id: "loresidebar",
        title: "LORE Compound Objects",
        border: false,
        width: 250,
        minWidth: 100,
        split: true,
        collapsible: true,
        animCollapse: false, 
        layout: "fit",
        items: [{
            layout: "border",
            items: [{
                region: "center",
                xtype: "treepanel",
                id: "sourcestree",
                animate: true,
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
                region: "south",
                split: true,
                height: 150,
                xtype: "tabpanel",
                id: "propertytabs",
                deferredRender: false,
                enableTabScroll: true,
                defaults: {
                    autoScroll: true
                },
                fitToFrame: true,
                items: [{
                    xtype: 'propertygrid',
                    title: 'Compound Object',
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
                    title: "Resource/Relationship",
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
            }]
        }]
    }]
};
try {
	lore.ui.main_window = new Ext.Viewport(lore.ui.gui_spec);
	lore.ui.main_window.show();
	
} catch (ex) {
	lore.debug.ui("Exception creating lore UI", ex);
}

lore.ui.ore.disableUIFeatures = function(opts) {
    // TODO: should add UI elements back manually when re-enabling, but easier to reset via reload for now
    lore.debug.ui("LORE Compound Objects: disable ui features?", opts);
    lore.ui.disabled = opts;
    
    var tmtab = Ext.getCmp("textmining");
    if (opts.disable_textmining){
        if(tmtab){
            // remove text mining tab
            lore.ui.loreviews.remove(lore.ui.textminingtab);
        }
    } 
	
    if (opts.disable_compoundobjects){
		window.parent.loreoverlay.setCompoundObjectsVisibility(false);
    } else {
		// don't set visible on initial call
		if (!lore.ui.ore.disableUIFeatures.initialCall ) {
			lore.ui.ore.disableUIFeatures.initialCall=1;
		} else {
			window.parent.loreoverlay.setCompoundObjectsVisibility(true);
		}
	}
}