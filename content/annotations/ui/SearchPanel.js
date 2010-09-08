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
    initComponent: function() {
        var config = {
            keys: [{
                key: [10, 13],
                fn: function() {
                    this.searchButton.fireEvent('click');
                },
                scope: this
            }],
	        labelWidth: 80,
	        defaultType: 'datefield',
	        labelAlign: 'right',
	        height: 210,
            bodyStyle : "padding: 0 10px 4px 4px",
	        defaults: {anchor: '100%'}
	        ,items: [{
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
                text : 'Search',
                tooltip : 'Search the entire annotation repository',
                ref: "searchButton",
                xtype: 'button',
                anchor: '40%'
            }]
//	        , {
//            	text : 'Copy RSS',
//            	tooltip : 'Save this search as an RSS Feed',
//            	ref : 'rssButton',
//            	xtype : 'button',
//            	anchor: '40%'
//            }]
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
lore.anno.ui.SearchPanel = Ext.extend(Ext.Panel, {

	/**
	 * Load configuration options and generate search GUI
	 * @constructor
	 */
	initComponent: function(){
		// paging bar on the bottom
		/*bbar: new Ext.PagingToolbar({
		 pageSize: 25,
		 store: store,
		 displayInfo: true,
		 displayMsg: 'Displaying topics {0} - {1} of {2}',
		 emptyMsg: "No topics to display",
		 items:[
		 '-', {
		 pressed: true,
		 enableToggle:true,
		 text: 'Show Preview',
		 cls: 'x-btn-text-icon details',
		 toggleHandler: function(btn, pressed){
		 var view = grid.getView();
		 view.showPreview = pressed;
		 view.refresh();
		 }
		 }]
		 })*/


		try {
            var config = {
                        title : "Search",
                        layout: "border",
                        items : [{
                            xtype: 'annosearchform',
                            itemId: 'mySearchForm',
                            ref: 'searchForm',
                            region:'north',
						    split: true,
						    collapseMode: 'mini'
                          }
                          ,{
                            xtype: 'annodataview',
                            id: 'search-view',
                            itemId: 'dataview',
                            ref: 'dataView',
                            region:'center',
                            store: this.model
                          }
                        ]
                    };
			Ext.apply(this, Ext.apply(this.initialConfig, config));
			lore.anno.ui.SearchPanel.superclass.initComponent.call(this);


			this.searchForm.searchButton.on('click', this.handleSearchAnnotations, this);
//			this.searchForm.rssButton.on('click', this.handleCopyRSS, this);

            var dataview = this.getComponent('dataview');
			
            var contextmenu = new Ext.menu.Menu({
                items: [{
				    text: "Add as node/s in compound object editor",
				    handler: lore.anno.ui.handleAddResultsToCO,
				    scope: dataview
                }, {
				    text: "View annotation/s in browser",
				    handler: lore.anno.ui.handleViewAnnotationInBrowser,
				    scope: dataview
                }
            ]});
			dataview.on('contextmenu', function(scope, rowIndex, node, e) {
                e.preventDefault();
                this.select(node, true);
			    contextmenu.showAt(e.xy);
			}, dataview);
			dataview.on('click', function searchLaunchTab(dv, rowIndex, node, event) {
				if (!event.ctrlKey && !event.shiftKey) {
					var record = this.getRecord(node);
				
					lore.global.util.launchTab(record.data.resource);
				}
			}, dataview);

		} catch (e) {
			lore.debug.anno("SearchPanel:initComponent() - " + e, e);
		}
	},

	/**
	 * Search the annotation respository for the given filters on the search
	 * forms and display results in grid
	 */
	handleSearchAnnotations : function() {
		try {
            var sform = this.searchForm.getForm();
			var vals = sform.getFieldValues();

			lore.anno.ui.loreInfo("Searching...");
			// perform search
			this.annoManager.searchAnnotations(vals, function(result, resp) {
						// data store will be updated and grid will auto update, all have to do
						// recalc layout
						lore.debug.anno("result from search: " + result, resp);
						lore.anno.ui.loreInfo("Search Finished");
					});
		} catch (e) {
			lore.debug.anno("error occurring performing search annotations: " + e, e);
		}

	}

});

Ext.reg("annosearchpanel", lore.anno.ui.SearchPanel);