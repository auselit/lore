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

/**
 * @class
 */
lore.anno.ui.SearchPanel = Ext.extend(Ext.Panel, {

	/**
	 * @constructor
	 */	
	initComponent: function(){
			var t = this;
      	  	var formConfig = {
			xtype: "form",
			keys: [{
				key: [10, 13],
				fn: function(){
					t.getComponent("search").fireEvent('click');
				}
			}],
			id: this.genID( "annosearchform"),
			trackResetOnLoad: true,
			split: true,
			items: [{
				xtype: 'fieldset',
				layout: 'form',
				autoScroll: true,
				id: this.genID( 'searchfieldset'),
				labelWidth: 100,
				defaultType: 'textfield',
				labelAlign: 'right',
				buttonAlign: 'right',
				style: 'border:none; margin-left:10px;margin-top:10px;',
				defaults: {
					hideMode: 'display',
					anchor: '-30'
				},
				
				items: [{
					fieldLabel: 'URL',
					name: 'url'
				}, {
					fieldLabel: 'Creator',
					name: 'creator'
				}, {
					xtype: 'datefield',
					format: "Y-m-d",
					fieldLabel: 'Date Created(after)',
					name: 'datecreatedafter'
				}, {
					xtype: 'datefield',
					format: "Y-m-d",
					fieldLabel: 'Date Created(before)',
					name: 'datecreatedbefore'
				}, {
					xtype: 'datefield',
					format: "Y-m-d",
					fieldLabel: 'Date Modified(after)',
					name: 'datemodafter'
				}, {
					xtype: 'datefield',
					format: "Y-m-d",
					fieldLabel: 'Date Modified(before)',
					name: 'datemodbefore'
				}],
				buttons: [{
					text: 'Search',
					id: this.genID( 'search'),
					tooltip: 'Search the entire annotation repository'
				}, {
					text: 'Reset',
					id: this.genID( 'resetSearch'),
					tooltip: 'Reset search fields'
				}]
			}]
		 
	},
	gridConfig = { 
			xtype: "grid",
			title: 'Search Results',
			id: this.genID( 'annosearchgrid'),
			region: 'center',
			store: this.model,
			autoScroll: true,
			viewConfig: {
				forceFit: true
			},
			colModel: new Ext.grid.ColumnModel( {
			// grid columns
			defaults: {
				sortable: true
			},
			columns: [
		//	expander,
			{
				id: 'title', // id assigned so we can apply custom css (e.g. .x-grid-col-topic b { color:#333 })
				header: "title",
				dataIndex: 'title'
			}, 
			{
				header: "type",
				dataIndex: "type",
				width:32,
				renderer: function(val, p, rec) {
					p.css = lore.anno.ui.getAnnoTypeIcon(rec.data);
				}
			},
			{
				header: "creator",
				dataIndex: 'creator'
			}, 
			{
				header: "created",
				dataIndex: 'created'
			}, 
			{
				header: 'modified',
				dataIndex: 'modified',
				renderer: function (val, p, rec) {
					return val ? val: "<i>not yet modified</i>";
				}
			},
			{
				header: 'annotates',
				dataIndex: 'resource',
				renderer:  function(val, p, rec ) {
					return String.format("<a class='anno-search'onclick='lore.global.util.launchTab(\"{0}\");'>{1}</a>",rec.data.resource,val);
				}
			}]
			}),

			viewConfig: {
				forceFit: true,
				enableRowBody: true
			}
			
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
		 };
		 
			try {
				Ext.apply ( this, {
							title: "Search",
							items:[	{
										region: 'north',
										id: this.genID("search"),
										collapsible:true,
										title: 'Search Options',
										items: [formConfig]
										}, gridConfig ]
							});
				
				lore.anno.ui.SearchPanel.superclass.initComponent.apply(this, arguments);
			
				this.sformpanel = this.getComponent("annosearchform");
				this.sform = this.sformpanel.getForm();
				
				this.sgrid = this.getComponent("annosearchgrid");
				
				
		
				this.getComponent("search").on('click', this.handleSearchAnnotations, this);
				this.getComponent("resetSearch").on('click', function () {
				this.sform.reset();
				}, this);
				
			} catch(e){
				lore.debug.anno("SearchPanel:initComponent() - " + e, e);
			}
		},
	
		grid: function () {
			return this.sgrid;
		},
		
		form: function () {
			return this.sform;
		},
		
		/**
		 * Search the annotation respository for the given filters on the search
		 * forms and display results in grid
		 */
		 handleSearchAnnotations : function () {
			
			var searchParams = { 
							  'creator':  lore.constants.DANNO_RESTRICT_CREATOR,
		 					  'datecreatedafter': lore.constants.DANNO_RESTRICT_AFTER_CREATED,
							  'datecreatedbefore': lore.constants.DANNO_RESTRICT_BEFORE_CREATED,
							  'datemodafter': 	lore.constants.DANNO_RESTRICT_AFTER_MODIFIED,
							  'datemodbefore': 	lore.constants.DANNO_RESTRICT_BEFORE_MODIFIED};
							  
			try {

				var vals = this.sform.getValues();
				var filters = [];
				for (var e in vals) {
					var v = vals[e];
					
					if (v && e != 'url') {
						v = this.sform.findField(e).getValue()
						if (e.indexOf('date') == 0) {
							v = v.format("c");
						}
						filters.push({
							attribute: searchParams[e],
							filter: v
						});
					}
				}
				var t= this;
				lore.anno.ui.loreInfo("Searching...");
				this.annoManager.searchAnnotations(vals['url']!='' ? vals['url']:null, filters, function(result, resp){
	 				lore.debug.anno("result from search: " + result, resp);
					lore.anno.ui.loreInfo("Search Finished");
					t.sgrid.doLayout();
	 			});
			} catch (e) {
				lore.debug.anno("error occurring performing search annotations: " +e, e);
			}
			
		},
		
		genID: function ( id ) {
			return this.id + "_" + id;
		},
		
		getComponent: function ( id) {
			return Ext.getCmp(this.genID(id));
		}
		
			
	});

Ext.reg("annosearchpanel",lore.anno.ui.SearchPanel)	;		