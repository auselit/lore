
lore.ore.ui.Viewport = Ext.extend(Ext.Viewport, {
    layout : "border",
    border : false,
    initComponent : function() {
        this.items = [{
            region : "center",
            border : false,
            layout : "fit",
            id : "loreviews-container",
            items : [{
                xtype : "tabpanel",
                id : "loreviews",
                enableTabScroll : true,
                // Ext plugin to change hideMode to ensure tab contents are not reloaded
                plugins : new Ext.ux.plugin.VisibilityMode({
                            hideMode : 'nosize',
                            bubble : false
                }),
                deferredRender : false,
                autoScroll : true,
                items : [{
                            title : "Graphical Editor",
                            tabTip: "View or edit the current compound object",
                            id : "drawingarea",
                            xtype : "grapheditor"
                        }, {
                            title : "Resources",
                            tabTip: "View textual summary of current compound object contents",
                            xtype : "summarypanel",
                            id : "remlistview"
                        }, {
                            layout : 'fit',
                            id : "remslideview",
                            title : "Slideshow",
                            tabTip: "View current compound object contents as a slideshow",
                            items : [{
                                        id : 'newss',
                                        xtype : "slideshowpanel",
                                        autoScroll : true
                                    }]
                        },
                        /*
                         * { title: "Resource Details", xtype: "panel",
                         * autoScroll: true, id: "remresedit", layout: "border",
                         * items: [ { region: "north", xtype: "panel", layout:
                         * "border", id: "resselect", height: 23, items:[ {
                         * xtype: "panel", region:"center", layout: "fit",
                         * items:[ lore.ore.ui.resselectcombo ] },{ region:
                         * "east", width:20, xtype:"panel", html:"<div
                         * style='height:100%;width:100%;background-color:#d0d0d0'>" + "<a
                         * href='#'
                         * onclick='if(lore.ore.ui.resselectcombo.value){lore.global.util.launchTab(lore.ore.ui.resselectcombo.value,
                         * window);}'>" + "<img alt='go' title='Show in
                         * browser' style='padding-top:1px;padding-left:1px'" + "
                         * src='chrome://lore/skin/icons/page_go.png'>" + "</a></div>" } ]
                         *  }, { region: "west", split: true, layout: "fit",
                         * title: " ", //collapseMode:'mini', width: 150, xtype:
                         * "treepanel", id: "respreview", tools: [ { id:'plus',
                         * qtip: 'Add a property or relationship', handler:
                         * lore.ore.ui.addProperty }, { id:'minus', qtip:
                         * 'Remove the selected property or relationship',
                         * handler: lore.ore.ui.removeProperty } ], id:
                         * "resdetailstree", animate: false, autoScroll: true,
                         * fitToFrame: true, rootVisible: false,
                         * containerScroll: true, border: false, root: new
                         * Ext.tree.TreeNode({}) }, { xtype: "panel", title:
                         * "Property / Relationship Editor", id:
                         * "respropeditor", split: true, region: "center",
                         * layout: "fit",
                         * 
                         * tools:[ { id: 'refresh', qtip: 'Cancel editing this
                         * field and restore last saved value', handler:
                         * lore.ore.ui.restorePropValue } ], items: [ { xtype:
                         * "textarea", id: "detaileditor", anchor: "100% 100%" }] } ] } ,
                         *//*
                             * { title : "Slideshow", id : "remslideview",
                             * autoScroll : false, html : "<div
                             * id='trailcarousel'></div>" },
                             */{
                            title : "Explore",
                            tabTip: "Discover related resources from the repository",
                            id : "remexploreview",
                            xtype : "explorepanel"
                            /*
                             * forceLayout : true, autoScroll : true
                             */
                    }   , {
                            title : "Using Compound Objects",
                            tabTip: "View LORE documentation",
                            id : "welcome",
                            autoWidth : true,
                            autoScroll : true,
                            iconCls : "welcome-icon",
                            html : "<iframe style='border:none' height='100%' width='100%' src='chrome://lore/content/compound_objects/about_compound_objects.html'></iframe>"

                        }]
            }]
        }, {
            region : "south",
            height : 25,
            xtype : "statusbar",
            id : "lorestatus",
            defaultText : "",
            autoClear : 6000,
            items: [
                '-',
                {
                    xtype:'label',
                    id:'currentCOMsg', 
                    text: 'New compound object'
                },
                ' '
            ]
        }, {
            region : "west",
            width : 280,
            split : true,
            animCollapse : false,
            collapseMode : 'mini',
            id : "propertytabs",
            xtype : "tabpanel",
            deferredRender : false,
            enableTabScroll : true,
            defaults : {
                autoScroll : true
            },
            fitToFrame : true,
            items : [{
                        "xtype": "panel",
                        layout: "anchor",
                        "title": "Browse",
                        tabTip: "Browse related compound objects",
                        "id": "browsePanel",
                        autoScroll: true, 
                            "tbar": {
                                "xtype": "lore.paging",
                                "store": "browse",
                                "id": "bpager"
                            },
                        items: [
                            {
                                "xtype": "codataview",
                                "store": "browse",
                                "id": "cobview"
                            }
                        ]
                     },
                     {
                            title: "History",
                            tabTip: "List recently viewed compound objects",
                            id: "historyPanel",
                            xtype: "panel",
                            anchor: "100% 50%",
                            autoScroll: true,
                            "tbar": {
                                "xtype": "lore.paging",
                                "store": "history",
                                "id": "hpager"
                           
                            },
                        items: [{
                            "xtype": "codataview",
                            "store": "history",
                            "id": "cohview"
                        }]
                    },
                    {
                        xtype : "panel",
                        layout : "border",
                        title : "Search",
                        tabTip: "Find compound objects",
                        id : "searchpanel",
                        autoScroll : false,
                        items : [{
                            xtype : "tabpanel",
                            region : "north",
                            animCollapse : false,
                            collapseMode : 'mini',
                            autoHide : true,
                            split : true,
                            minHeight : 0,
                            id : "searchforms",
                            items : [{
                                xtype : "panel",
                                layout : "hbox",
                                title : "Keyword",
                                tabTip: "Search by keyword across all fields",
                                id : "kwsearchform",
                                padding : 3,
                                layoutConfig : {
                                    pack : 'start',
                                    align : 'stretchmax'
                                },
                                border : false,
                                autoHeight : true,
                                items : [{
                                    xtype : "textfield",
                                    id : "kwsearchval",
                                    flex : 1,
                                    listeners : {
                                        specialkey : function(field, el) {
                                            if (el.getKey() == Ext.EventObject.ENTER)
                                                Ext.getCmp("kwsearchbtn")
                                                        .fireEvent("click");
                                        }
                                    }
                                }, {
                                    xtype : "button",
                                    flex : 0,
                                    margins : '0 10 0 0',
                                    text : 'Search',
                                    id : 'kwsearchbtn',
                                    tooltip : 'Run the search'
                                }]
                            }, {
                                title : "Advanced",
                                tabTip: "Search specific fields",
                                autoHeight : true,
                                autoWidth : true,
                                xtype : "form",
                                id : "advsearchform",
                                border : false,
                                bodyStyle : "padding: 0 10px 4px 4px",
                                labelWidth : 75,
                                keys : [{
                                    key : [10, 13],
                                    fn : function() {
                                        Ext.getCmp("advsearchbtn")
                                                .fireEvent('click');
                                    }
                                }],
                                items : [{
                                    xtype : "label",
                                    id : "find-co-label",
                                    text : "Find Compound Objects",
                                    style : "font-family: arial, tahoma, helvetica, sans-serif; font-size:11px;line-height:2em"
                                }, {
                                    xtype : "textfield",
                                    anchor : "100%",
                                    fieldLabel : "containing",
                                    id : "searchuri",
                                    emptyText : "any resource URI"
                                }, {
                                    xtype : "combo",
                                    anchor : "100%",
                                    fieldLabel : "having",
                                    id : "searchpred",
                                    mode : 'local',
                                    typeAhead : true,
                                    displayField : 'curie',
                                    valueField : 'uri',
                                    emptyText : "any property or relationship",
                                    store : new Ext.data.ArrayStore({
                                                storeId: 'advancedSearchPredStore',
                                                fields : ['uri', 'curie'],
                                                data : []
                                            })
                                }, {
                                    xtype : "textfield",
                                    anchor : "100%",
                                    fieldLabel : "matching",
                                    id : "searchval",
                                    emptyText : ""
                                }, {
                                    xtype : 'button',
                                    text : 'Search',
                                    id : 'advsearchbtn',
                                    tooltip : 'Run the search'
                                }]
                            }]
                        }, 
                        {
                            region:"center",
                            minHeight: 0,
                            "xtype": "panel",
                            layout: "anchor",
                            "id": "searchResultPanel",
                            autoScroll: true, 
                                "tbar": {
                                    "xtype": "lore.paging",
                                    "store": "search",
                                    "id": "spager"
                                    
                                },
                            items: [
                                {
                                    "xtype": "codataview",
                                    "store": "search",
                                    "id": "cosview"
                                }
                            ]
                         }
                        ]
                    }, {
                        xtype : "panel",
                        layout : "anchor",
                        title : "Properties",
                        tabTip: "View or edit compound object properties",
                        id : "properties",
                        items : [{
                                    title : 'Compound Object',
                                    id : "remgrid",
                                    xtype : "propertyeditor"
                                }, {
                                    title : "Resource/Relationship",
                                    id : "nodegrid",
                                    xtype : "propertyeditor"
                                }]
                    }]
        }];
        
        lore.ore.ui.Viewport.superclass.initComponent.call(this);
    }
});