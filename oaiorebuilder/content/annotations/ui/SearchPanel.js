lore.anno.ui.SearchPanel = Ext.extend(Ext.Panel, {
	
	searchform: function(){
		return {
			xtype: "form",
			keys: [{
				key: [10, 13],
				fn: function(){
					Ext.getCmp("search").fireEvent('click');
				}
			}],
			id: "annosearchform",
			trackResetOnLoad: true,
			split: true,
			items: [{
				xtype: 'fieldset',
				layout: 'form',
				autoScroll: true,
				id: 'searchfieldset',
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
					id: 'search',
					tooltip: 'Search the entire annotation repository'
				}, {
					text: 'Reset',
					id: 'resetSearch',
					tooltip: 'Reset search fields'
				}]
			}]
		};
	},	
	grid: function(){ return {
			xtype: "grid",
			title: 'Search Results',
			id: 'annosearchgrid',
			region: 'center',
			store: lore.anno.annosearchds,
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
		};},
		
	
	initComponent: function(){
      	  	try {
				Ext.apply ( this, {
						//	xtype:'panel',
							//layout:'border',
							title: "Search",
							items:[	{
										title: 		"Annotation Timeline",
										id: 		"annotimeline",
										region: 'north',
										id: "search",
										collapsible:true,
										title: 'Search Options',
										items: [this.searchform()]
										}, this.grid() ]
							});
				
				lore.anno.ui.SearchPanel.superclass.initComponent.apply(this, arguments);
			
				this.sformpanel = Ext.getCmp("annosearchform");
				this.sform = this.sformpanel.getForm();
				
				this.sgrid = Ext.getCmp("annosearchgrid");
				
				this.sgrid.contextmenu = new Ext.menu.Menu({
							id: this.sgrid.id + "-context-menu"
						});
						
				this.sgrid.contextmenu.add({
							text: "Add as node/s in compound object editor",
							handler: lore.anno.ui.handleAddResultsToCO
						});
				
				this.sgrid.on('contextmenu', function(e) {
					this.sgrid.contextmenu.showAt(e.xy);
		    	});
		
				Ext.getCmp("search").on('click', this.handleSearchAnnotations, this);
				Ext.getCmp("resetSearch").on('click', function () {
				this.sform.reset();
				}, this);
				
			} catch(e){
				lore.debug.anno("SearchPanel:initComponent() - " + e, e);
			}
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
				lore.debug.anno('argh: ' + this.sform, this.sform)
				var vals = this.sform.getValues();
				lore.debug.anno("vals: " + vals, vals);
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
				lore.anno.searchAnnotations(vals['url']!='' ? vals['url']:null, filters, function(result, resp){
	 				lore.debug.anno("result from search: " + result, resp);
					lore.anno.ui.loreInfo("Search Finished");
					t.sgrid.doLayout();
	 			});
			} catch (e) {
				lore.debug.anno("error occurring performing search annotations: " +e, e);
			}
			
		}
		
			
	});

Ext.reg("annosearchpanel",lore.anno.ui.SearchPanel)	;		