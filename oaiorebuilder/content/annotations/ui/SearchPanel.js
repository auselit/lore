/*
 * Copyright (C) 2008 - 2010 School of Information Technology and Electrical
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
            labelWidth: 80,
            defaultType: 'datefield',
            labelAlign: 'right',
            height: 210,
            bodyStyle : "padding: 0 10px 4px 4px",
            defaults: {anchor: '100%'},
            items: [{
                fieldLabel : 'URL',
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
                    },{
	                    xtype:'button',
	                    id:  'feedButton',
	                    ref: "../feedButton",
	                    icon: "chrome://lore/skin/icons/feed.png",
                        tooltip: "Show feed"
	                }]
            }]
        };
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        lore.anno.ui.SearchForm.superclass.initComponent.call(this);
    }
});
Ext.reg('annosearchform', lore.anno.ui.SearchForm);

/**
 * Object that encapsulates a search screen for annotations
 * @class lore.anno.ui.SearchPanel
 * @extends Ext.Panel
 */
lore.anno.ui.SearchPanel = Ext.extend(Ext.Container, {

    /**
     * Load configuration options and generate search GUI
     * @constructor
     */
    initComponent: function() {
        try {
            var config = {
                layout: "border",
                split: true,
                collapseMode: 'mini',
                items : [{
                	xtype: 'tabpanel',
                	region: 'center',
                	autoHeight: 'true',
            		items: [{
	                        xtype: 'solrsearchpanel',
	                        title: 'Keyword',
	                        ref: '../keySearchForm'
//	                    	autoHeight: 'true',
	            		}, {
	            			xtype: 'annosearchform',
	            			title: 'Advanced',
	            			itemId: 'mySearchForm',
	            			ref: '../advSearchForm'
//	                    	autoHeight: 'true',
	            		}]
                }
                ,{
                    xtype: 'annodataview',
                    id: 'search-view',
                    itemId: 'dataview',
                    ref: 'dataView',
                    region:'south',
                    store: this.model
                  }
                ]
            };
            Ext.apply(this, Ext.apply(this.initialConfig, config));
            lore.anno.ui.SearchPanel.superclass.initComponent.call(this);


            this.advSearchForm.searchButton.on('click', this.handleSearchAnnotations, this);
            
            this.keySearchForm.searchButton.on('click', function () {
            	this.dataView.bindStore(this.keySearchForm.ds);
            }, this);
            
//            this.searchForm.feedButton.on('click', this.annotationManager.getFeedURL, this.annotationManager);


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
        	this.dataView.bindStore(this.model);
        	
            var sform = this.searchForm.getForm();
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
