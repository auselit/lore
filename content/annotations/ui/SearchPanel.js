lore.anno.ui.SearchForm = Ext.extend(Ext.form.FormPanel, {
    initComponent: function () {
        var config = {
            keys: [{
                key: [10, 13],
                fn: function () {
                    this.searchButton.fireEvent('click');
                },
                scope: this
            }],
            labelWidth: 90,
            defaultType: 'datefield',
            labelAlign: 'right',
            height: 200,
            bodyStyle : "padding: 0 10px 4px 4px",
            defaults: {anchor: '100%'},
            items: [{
                fieldLabel : 'Target URL',
                name : 'url',
                xtype: 'textfield'
            }, {
                fieldLabel : 'Creator',
                name : 'creator',
                xtype: 'textfield'
            }, {
                format : "Y-m-d",
                fieldLabel : 'Created after',
                name : 'datecreatedafter'
            }, {
                format : "Y-m-d",
                fieldLabel : 'Created before',
                name : 'datecreatedbefore'
            }, {
                format : "Y-m-d",
                fieldLabel : 'Modified after',
                name : 'datemodafter'
            }, {
                format : "Y-m-d",
                fieldLabel : 'Modified before',
                name : 'datemodbefore'
            }, {
                xtype: 'container',
                layout: 'hbox', // or maybe column
                layoutConfig : { padding: "0 5" },
                items: [{
                        text : 'Search',
                        tooltip : 'Search the entire annotation repository',
                        ref: "../searchButton",
                        xtype: 'button',
                        flex: 1
                    }]
            }]
        };
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        lore.anno.ui.SearchForm.superclass.initComponent.call(this);
    }
});
Ext.reg('annosearchform', lore.anno.ui.SearchForm);
//Ext.reg('annosearchform', 'lore.anno.ui.SearchForm');

/**
 * Object that encapsulates a search screen for annotations
 * @class lore.anno.ui.SearchPanel
 * @extends Ext.Panel
 */
lore.anno.ui.SearchPanel = Ext.extend(Ext.Container, {
    constructor: function(config){
        this.model = config.model;
        this.annotationManager = config.annotationManager;
        lore.anno.ui.SearchPanel.superclass.constructor.call(this, config);
    },
    /**
     * Load configuration options and generate search GUI
     * @constructor
     */
    initComponent: function() {
        try {
            
            var config = {
                layout: "border",
                split:true,
                collapseMode: 'mini',
                items : [{
                	xtype: 'tabpanel',
                    region: 'north',
                    split: true,
                    collapseMode: 'mini',
                    animCollapse: false,
                    useSplitTips: true,
                    id: 'searchtabs',
                    activeTab: 'solrsearch',
                    boxMinHeight: 0,
                    minHeight : 0,
                	height: 200,
            		items: [{
	                        xtype: 'solrsearchpanel',
                            id: 'solrsearch',
	                        title: 'Keyword',
	                        ref: '../keySearchForm'
	            		}, {
	            			xtype: 'annosearchform',
	            			title: 'Advanced',
	            			itemId: 'mySearchForm',
	            			ref: '../advSearchForm'
	            		}]
                }
                ,{
                    region:"center",
                    minHeight: 0,
                    "xtype": "panel",
                    layout: "anchor",
                    "id": "annoSearchResultPanel",
                    autoScroll: true, 
                        "tbar": {
                            "xtype": "lore.anno.paging",
                            displayInfo : true,
                            "store": this.model,
                            "id": "annospager"
                            
                        },
                    items: [
                        {
                            "xtype": "annodataview",
                            "store": this.model,
                            "id": "search-view",
                            itemId: 'dataview',
                            ref: '../dataView'
                        }
                    ]
                 } 
                ]
            };
            Ext.apply(this, Ext.apply(this.initialConfig, config));
            lore.anno.ui.SearchPanel.superclass.initComponent.call(this);
            
            this.advSearchForm.searchButton.on('click', this.handleSearchAnnotations, this);
            
            // resize search panel and hide or show feed button depending on active tab
            this.advSearchForm.on("activate",function(){
                Ext.getCmp('feedButton').show();
                Ext.getCmp("searchtabs").setSize({height: 200});
                Ext.getCmp("searchpanel").doLayout();
            });
            this.keySearchForm.on("activate", function(){
                var p = Ext.getCmp("searchtabs");
                p.setSize({height: (p.getFrameHeight() + 30)});
                Ext.getCmp("searchpanel").doLayout();
            });
            this.advSearchForm.on("deactivate", function(){
               Ext.getCmp('feedButton').hide(); 
            });
            this.on("deactivate", function(){
               Ext.getCmp('feedButton').hide(); 
            });
            this.on("activate",function(){
                var tabs = Ext.getCmp('searchtabs');
                if (tabs.activeTab == this.advSearchForm){
                    Ext.getCmp('feedButton').show();
                }
            });
            
            this.keySearchForm.searchButton.on('click', function () {
                // make sure any old results don't display by removing them from the store
                this.keySearchForm.ds.removeAll(true);
            	this.dataView.bindStore(this.keySearchForm.ds);
                Ext.getCmp("annospager").bindStore(this.keySearchForm.ds);
            }, this);
            

        } catch (e) {
            lore.debug.anno("SearchPanel:initComponent" , e);
        }
    },

    /**
     * Search the annotation respository for the given filters on the search
     * forms and display results in grid
     */
    handleSearchAnnotations : function() {
        try {
            // make sure any old results don't display
            this.model.removeAll(true);
        	this.dataView.bindStore(this.model);
        	Ext.getCmp("annospager").bindStore(this.model);
            var sform = this.advSearchForm.getForm();
            var vals = sform.getFieldValues();

            lore.anno.ui.loreInfo("Searching...");
            // perform search
            this.annotationManager.searchAnnotations(vals, function(result, resp) {
                    // data store will be updated and grid will auto update, all have to do
                    // recalc layout
                    lore.debug.anno("result from search: " + result, resp);
                    lore.anno.ui.loreInfo("Search Finished");
            });
        } catch (e) {
                lore.debug.anno("error occurring performing search annotations", e);
        }
    }

});
Ext.reg("annosearchpanel", lore.anno.ui.SearchPanel);
//Ext.reg("annosearchpanel", 'lore.anno.ui.SearchPanel');
