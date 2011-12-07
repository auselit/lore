/**
 * @class lore.ore.ui.SearchPanel Panel that includes forms for advanced and keyword search and a dataview for displaying results
 * @extends Ext.Panel
 */
lore.ore.ui.SearchPanel = Ext.extend(Ext.Panel,{ 
   initComponent: function (){
    Ext.apply(this,{
        layout : "border",
        title : "Search",
        tabTip: "Find Resource Maps",
        autoScroll : false,
        items : [{
            xtype : "tabpanel",
            region : "north",
            animCollapse : false,
            collapseMode : 'mini',
            useSplitTips: true,
            autoHide : true,
            split : true,
            minHeight : 0,
            id : "searchforms",
            boxMinHeight: 0,
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
                            if (el.getKey() == Ext.EventObject.ENTER){
                                Ext.getCmp("kwsearchbtn").fireEvent("click");
                            }
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
                    text : "Find Resource Maps",
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
        });
        lore.ore.ui.SearchPanel.superclass.initComponent.call(this);
        
        // set up search handlers
        Ext.getCmp("advsearchbtn").on('click', this.advancedSearch);
        Ext.getCmp("kwsearchbtn").on('click', this.keywordSearch);
        
        // resize search form panel depending on if showing keyword or advanced
        Ext.getCmp("advsearchform").on('activate',function(){
            Ext.getCmp("searchforms").setSize({height: 165});
            Ext.getCmp("searchpanel").doLayout();
        });
        Ext.getCmp("kwsearchform").on('activate',function(){
            var p = Ext.getCmp("searchforms");
            p.setSize({height: (p.getFrameHeight() + 30)});
            Ext.getCmp("searchpanel").doLayout();
        });
        
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
             
        } catch (e) {
            lore.debug.ui("SearchPanel: error setting up search combo", e);
        }
        Ext.getCmp("searchforms").activate("kwsearchform");
    },
    /** Handle click of search button in keyword search panel */
    keywordSearch : function(){
        lore.ore.controller.search(null,null,Ext.getCmp("kwsearchval").getValue());
    },
    /** Handle advanced search */
    advancedSearch : function(){
        var searchform = Ext.getCmp("advsearchform").getForm();
        var searchuri = searchform.findField("searchuri").getValue();
        var searchpred = searchform.findField("searchpred").getValue();
        var searchval = searchform.findField("searchval").getValue();
        //var searchexact = searchform.findField("searchexact").getValue();
        lore.ore.controller.search(searchuri, searchpred, searchval);
    }

});
Ext.reg('searchpanel',lore.ore.ui.SearchPanel);