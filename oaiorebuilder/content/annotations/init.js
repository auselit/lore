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
 * @include  "/oaiorebuilder/content/annotations.js"
 * @include  "/oaiorebuilder/content/uiglobal.js"
 * @include  "/oaiorebuilder/content/debug.js"
 * @include  "/oaiorebuilder/content/annotations/annotations_view_init.js"
 */

/**
 * Annotations View
 * @singleton
 * @class lore.anno.ui
 */
/**
 * @property extension 
 * Reference to the Extension
 */
lore.anno.ui.extension = Components.classes["@mozilla.org/extensions/manager;1"]
		.getService(Components.interfaces.nsIExtensionManager)
		.getInstallLocation(lore.constants.EXTENSION_ID)
		.getItemLocation(lore.constants.EXTENSION_ID);



	/**
	 * Initialize the annotations model and view. Registering the view and loading
	 * the annotations for the current page if the annotations view is visible
	 */
	lore.anno.ui.init = function(){
		try {
			
			lore.anno.ui.topView = lore.global.ui.topWindowView.get(window.instanceId);
			lore.anno.ui.currentURL = lore.global.util.getContentWindow(window).location.href;
			lore.anno.initModel(lore.anno.ui.currentURL);
			lore.anno.ui.initGUI({ annods: lore.anno.annods});
			lore.anno.ui.initModelHandlers();
			
			lore.anno.ui.lorevisible = lore.anno.ui.topView.annotationsVisible();
			
 			lore.anno.ui.initTimeline();

			lore.global.ui.annotationView.registerView(lore.anno.ui, window.instanceId);
			
			try{
				lore.anno.ui.topView.loadAnnotationPrefs();
    		} catch (ex){
        		lore.debug.anno("Error loading annotation preferences: " + ex, ex);
    		}
			
			lore.anno.ui.initialized = true;
			if (lore.anno.ui.currentURL && lore.anno.ui.currentURL != '' &&
				lore.anno.ui.currentURL != 'about:blank' &&
				lore.anno.ui.lorevisible) {
				lore.debug.anno("anno init: updating sources");
				lore.anno.ui.handleLocationChange(lore.anno.ui.currentURL);
				//lore.anno.ui.loadedURL = lore.anno.ui.currentURL; //TODO: this could be shared code
			}

			lore.debug.anno("Annotation init");
		} catch (e ) {
			lore.debug.ui("Except in anno init ! " + e, e);
		}
	}
	
	/**
	 * Destroy any objects and undo any changes made to the current content window
	 */
	lore.anno.ui.uninit = function () {
		lore.anno.ui.hideMarker(); 
	}
	
/**
 * Helper function for construction the "Using Annotations" tab
 * @private
 */
loreuiannoabout = function () { 
	return {
				title: "Using Annotations",
				id: "about",
				autoWidth: true,
				autoScroll: true,
				iconCls: "welcome-icon"};
}

/**
 * Helper function for construting 'Annotationg Editor' panel
 * @private
 * @param {Object} store The datastore for the store
 */
loreuieditor = function (store ) {
	
	return {
			 	region: "south",
			 	split: true,
				height: 300,
			 	xtype: "form",
			 	
				id: "annotationslistform",
				trackResetOnLoad: true,
			 	title: "Editor",
			 	layout: 'border',
				items: [{
			 		region: "center",
		 			xtype: 'fieldset',
		 			layout: 'form',
		 			autoScroll: true,
		 			id: 'annotationsform',
		 			labelWidth: 85,
		 			
						defaultType: 'textfield',
						labelAlign: 'right',
						buttonAlign: 'right',
						style: 'border:none; margin-left:10px;margin-top:10px;',
						defaults: {
							hideMode: 'display',
							anchor: '-30'
						},
						
						items: [{
							xtype: "combo",
							id: "typecombo",
							fieldLabel: 'Type',
							name: 'type',
							hiddenName: 'type',
							store: new Ext.data.SimpleStore({
								fields: ['typename', 'qtype'],
								data: [['Comment', "http://www.w3.org/2000/10/annotationType#Comment"], ['Explanation', "http://www.w3.org/2000/10/annotationType#Explanation"],['Question','http://www.w3.org/2000/10/annotationType#Question' ], 
								['Variation', "http://austlit.edu.au/ontologies/2009/03/lit-annotation-ns#VariationAnnotation"],
								['Semantic',"http://austlit.edu.au/ontologies/2009/03/lit-annotation-ns#SemanticAnnotation" ]]
							}),
							valueField: 'qtype',
							displayField: 'typename',
							typeAhead: true,
							triggerAction: 'all',
							forceSelection: true,
							mode: 'local',
							selectOnFocus: true
						}, {
							fieldLabel: 'Title',
							name: 'title'
							
						}, {
							fieldLabel: 'Creator',
							name: 'creator'
							
						}, {
							fieldLabel: 'References',
							name: 'references'
						},
						{
							xtype: "combo",
							id: "importance",
							fieldLabel: 'Importance',
							name: 'importance',
							hiddenName: 'importance',
							store: new Ext.data.SimpleStore({
								fields: ['impname', 'qimpname'],
								data: [['Very Important', "VeryImportant"], ['Important', "Important"],['Trivial','Trivial' ]]
							}),
							valueField: 'qimpname',
							displayField: 'impname',
							typeAhead: true,
							triggerAction: 'all',
							forceSelection: true,
							mode: 'local',
							selectOnFocus: true
						},
						{
							fieldLabel: 'Variation Agent',
							name: 'variationagent',
							
							hideParent: true
						}, {
							fieldLabel: 'Variation Place',
							name: 'variationplace',
							
							hideParent: true
						}, {
							fieldLabel: 'Variation Date',
							name: 'variationdate',
							
							hideParent: true
						}, {
							fieldLabel: 'ID',
							name: 'id',
							hidden: true,
							hideLabel: true,
							style: {
								padding: 0,
								margin: 0,
								display: 'none'
							}
						}, {
							fieldLabel: 'Annotates',
							name: 'res',
							readOnly: true,
							hideParent: true,
							style: {
								background: 'none',
								border: 'none',
								'font-size': '90%'
							}
							//labelStyle: 'font-size:90%;'
						
						}, {
							fieldLabel: 'Context',
							name: 'context',
							readOnly: true,
							hidden: true,
							hideLabel: true,
							style: {
								background: 'none',
								border: 'none',
								padding: 0,
								margin: 0
							}
						},  
						 {
							fieldLabel: 'Original resource',
							name: 'original',
							id: 'originalfield',
							readOnly: true,
							style: {
								background: 'none',
								border: 'none',
								'font-size': '90%'
							},
							labelStyle: 'font-size:90%'
						}, {
							fieldLabel: 'Original Context Xpointer',
							name: 'originalcontext',
							readOnly: true,
							style: {
								background: 'none',
								border: 'none',
								padding: 0,
								margin: 0
							},
							hidden: true,
							hideLabel: true
						}, {
                            
							fieldLabel: 'Selection',
							name: 'contextdisp',
							readOnly: true,
							style: {
								background: 'none',
								'border-top': 'none',
                                'border-bottom': 'none',
                                'border-left': 'none',
								'font-size': '90%'
                               
                           
							},
							//labelStyle: 'font-size:90%;'
                             xtype: "trigger",
                            'triggerClass': 'x-form-set-trigger',
                            'onTriggerClick': lore.anno.ui.handleUpdateAnnotationContext
                            
                        
						}/*, {
                            
							xtype:"button",
							text: 'Update Selection',
							fieldLabel: '',
							id: 'updctxtbtn',
							tooltip: 'Set the context of the annotation to be the current selection from the main browser window'
						}*/,
						{
							fieldLabel: 'Variant resource',
							name: 'variant',
							id: 'variantfield',
							readOnly: true,
							style: {
								background: 'none',
								border: 'none',
								'font-size': '90%'
							}
                            
							//labelStyle: 'font-size:90%'
						}, {
							fieldLabel: 'Variant Context Xpointer',
							name: 'variantcontext',
							readOnly: true,
							style: {
								background: 'none',
								border: 'none',
								padding: 0,
								margin: 0
							},
							hidden: true,
							hideLabel: true
						}, {
							fieldLabel: 'Variant Selection',
							name: 'rcontextdisp',
							readOnly: true,
							style: {
								background: 'none',
                                'border-top': 'none',
                                'border-bottom': 'none',
                                'border-left': 'none',
								'font-size': '90%'
							},
                            xtype: "trigger",
                            'triggerClass': 'x-form-set-trigger',
                            'onTriggerClick': lore.anno.ui.handleUpdateAnnotationVariantContext
						//	labelStyle: 'font-size:90%'
						},/*{
							xtype:"button",
							text: 'Update Variant Selection',
							fieldLabel: '',
							id: 'updrctxtbtn',
							hidden: true,
							tooltip: 'For Variation Annotations: set the context in the variant resource to be the current selection from the main browser window'
						},*/
									{
									fieldLabel : 'Semantic selection',
									name: 'metares',
									id: 'metares',
									readOnly: true,
									hideParent: true,
									style: {
										background: 'none',
										border: 'none',
										'font-size':'90%'
									}
									//labelStyle: 'font-size:90%;'
								},
								{
									xtype: "button",
									text: 'Choose semantic selection',
									fieldLabel: '',
									id: 'chgmetactxbtn',
									tooltip: 'Select the item or relationship to annotate',
									handler: lore.anno.ui.handleChangeMetaSelection
								},
								/*{
									fieldLabel : 'Metadata',
									name: '',
									id: '',
								},*/
								{
									xtype: "editorgrid",
									
									id: 'metausergrid',
									name: 'metausergrid',
									store: lore.anno.annousermetads,
									//deferRowRender: false,
									height: 100,
									viewConfig: {
									forceFit: true
								},
									//forceFit: true,
							
							 		colModel: new Ext.grid.ColumnModel( {
									// grid columns
									defaults: {
										sortable: true
									},
									columns: [
										{
											id: 'type', // id assigned so we can apply custom css (e.g. .x-grid-col-topic b { color:#333 })
											header: 'Type',
											dataIndex: 'type',
											width:50,
											editor: {
												xtype: 'combo',
												store: new Ext.data.ArrayStore( {
													id: '',
													fields: ['type', 'displayType'],
													data: [
													['http://austlit.edu.au/owl/austlit.owl#Agent', 'Agent'], 
													['http://austlit.edu.au/owl/austlit.owl#Work','Work'],
													['http://austlit.edu.au/owl/austlit.owl#Manifestation','Manifestation']]
												}),
												mode: 'local', 
												valueField: 'type',
												displayField: 'displayType',
												triggerAction: 'all'
											},
											renderer: function (value) {
												return value.indexOf("#")!=-1 ? value.substring(value.indexOf("#")+1):value; 
											}
										}, 
										{
											header: "Property",
											dataIndex: 'prop',
											editor:{
												xtype: 'combo',
												store: new Ext.data.ArrayStore( {
													id: '',
													fields: ['prop', 'property'],
													data: [['displayName','displayName'], ['influencedWork','influencedWork'],
													['hasReprint','hasReprint'],
													['alternateTitle', 'alternateTitle'],
													 ['biography','biography']]
												}),
												mode: 'local', 
												valueField: 'prop',
												displayField: 'property',
												triggerAction: 'all'
											}
										}, 
										{
											header: "value",
											dataIndex: 'value',
											editor: new Ext.form.TextField({ allowBlank:false})
										}, 
									]
									})
								},
									{
							xtype:"button",
							text: 'Add',
							fieldLabel: '',
							id: 'addmetabtn',
							tooltip: 'Add metadata about this page to the annotation',
							
						},
						{
							xtype:"button",
							text: 'Remove',
							id: 'remmetabtn',
							tooltip: 'Remove user created metadata about this page from the annotation',
							
						},
						{
							id: 'tagselector',
							xtype: 'superboxselect',
							allowBlank: true,
							msgTarget: 'under',
							allowAddNewData: true,
							fieldLabel: 'Tags',
							emptyText: 'Type or select tags',
							resizable: true,
							name: 'tags',
                            pageSize: 10,
							store: new Ext.ux.data.PagingArrayStore({
								fields: ['id', 'name'],
								data: lore.anno.thesaurus,
                                lastOptions: {params: {start:0,limit:10}}
							}),
							mode: 'local',
							displayField: 'name',
							valueField: 'id',
							extraItemCls: 'x-tag',
							listeners: {
								newitem: function(bs, v){
									v = v.slice(0, 1).toUpperCase() + v.slice(1).toLowerCase();
									var newObj = {
										id: v,
										name: v
									};
									bs.addItem(newObj);
								}
							}
						}, {
							fieldLabel: 'Body',
							xtype: 'htmleditor',
							plugins: [new Ext.ux.form.HtmlEditor.Img()],
							name: 'body',
							enableFont: false,
							enableColors: false,
							enableSourceEdit: false,
							anchor: '-30 100%'
						},
						{
							fieldLabel: 'Alt Body',
							xtype: 'htmleditor',
							plugins: [new Ext.ux.form.HtmlEditor.Img()],
							name: 'altbody',
							enableFont: false,
							enableColors: false,
							enableSourceEdit: false,
							anchor: '-30 100%'
						}
						
						],
						buttons: [{
							text: 'Hide Editor',
							id: 'hideeditbtn',
							tooltip: 'Hides the annotation editor from view'
						},{
							text: 'Save Annotation',
							id: 'updannobtn',
							tooltip: 'Save the annotation to the repository'
						},{
							text: 'Delete Annotation',
							id: 'delannobtn',
							tooltip: 'Delete the annotation - CANNOT BE UNDONE'
						},  {
							text: 'Reset',
							id: 'resetannobtn',
							tooltip: 'Reset - changes will be discarded'
						}]
					}]
					
				};
}

/**
 * Helper function for constructing the panel that contains the annotation tree view and editor
 * @private
 * @param {Object} store The datastore for the store
 */
loreuiannotreeandeditor = function (store) {
	return {
			title: "Annotation List",
			xtype: "panel",
			id: "treeview",
			layout: "border",
			items: [{
				region: "center",
				layout: "border",
				items: [{
					region: "center",
					xtype: "annocolumntreepanel",
					id: "annosourcestree",
					}]
			}, 
				loreuieditor(store)]
			};
}

/**
 * 
 * Helper function that constructs the 'Timeline' panel
 * @private
 * @param {Object} store The datastore for the store
 */
loreuiannotimeline = function (store)
{
	return {
		title: "Annotation Timeline",
		xtype: "panel",
		id: "annotimeline"
	}
}

loreuiannocurpage = function (store) {

	/*bbar: new Ext.PagingToolbar({
			            pageSize: 25,
			            store: store,
			            displayInfo: true,
			            displayMsg: 'Displaying annotations {0} - {1} of {2}',
			            emptyMsg: "No annotations to display",
			            items:[
			                '-', {
			                pressed: true,
			                enableToggle:true,
			                text: 'Show Preview',
			                cls: 'x-btn-text-icon details',
			                toggleHandler: function(btn, pressed){
			                    //var view = grid.getView();
			                    //view.showPreview = pressed;
			                   // view.refresh();
			                }}]})*/
	return {
			xtype: "tabpanel",
			title: "Browse",
			id: "curpage",
			deferredRender: false,
			activeTab: "treeview",
			items: [loreuiannotreeandeditor(store), loreuiannotimeline(store)]
		};
}

loreuiannosearchform = function (store ) {
	return { 
			xtype: "form",
		    keys: [{ key: [10, 13], fn: function() {
                      Ext.getCmp("search").fireEvent('click');
                   }
            }],
			id: "annosearchform",
				trackResetOnLoad: true,
				split:true,
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
					
					items: [
						{
							fieldLabel: 'URL',
							name:'url'
						},
					    {
							fieldLabel: 'Creator',
							name: 'creator'
						},
						{
							xtype:'datefield',
							format: "Y-m-d",
							fieldLabel: 'Date Created(after)',
							name: 'datecreatedafter'	
						},
						{
							xtype:'datefield',
							format: "Y-m-d",
							fieldLabel: 'Date Created(before)',
							name: 'datecreatedbefore'
						},
						{
							xtype:'datefield',
							format: "Y-m-d",
							fieldLabel: 'Date Modified(after)',
							name: 'datemodafter'	
						},
						{
							xtype:'datefield',
							format: "Y-m-d",
							fieldLabel: 'Date Modified(before)',
							name: 'datemodbefore'
						}],
						buttons: [{
							text: 'Search',
							id: 'search',
							tooltip: 'Search the entire annotation repository'
						},  {
							text: 'Reset',
							id: 'resetSearch',
							tooltip: 'Reset search fields'
						}]
					}]
	}
}

loreuiannogrid = function (store ) {
	/*var expander = new Ext.ux.grid.RowExpander({
        tpl : new Ext.Template(
            '<p><b>Annotates:</b> resource</p><br>',
            '<p><b>Description:</b> body</p>' 
        )
    });*/

	return {
		
			xtype: "grid",
			title: 'Search Results',
			id: 'annosearchgrid',
			region:'center',
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
					//return "<div style=\"min-width:16,min-height:16,width:16,height:16\" class=\"" + lore.anno.ui.getAnnoTypeIcon(rec.data) + "\" />";
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
		//	plugin:expander,
			
			// customize view config
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
		}
	
}

loreuiannosearch = function (store ) {
	 
	return {
		xtype:'panel',
		layout:'border',
		title: "Search",
		items:[
		{
		xtype: "panel",
		region: 'north',
		id: "search",
		collapsible:true,
		title: 'Search Options',
		items: [loreuiannosearchform(store)]
		}, loreuiannogrid(store)
		
		]
	}
}

loreuiannonavtabs = function (store) {
	return {
				xtype: "tabpanel",
				title: "Navigation",
				id: "navigationtabs",
				deferredRender: false,
				activeTab: "curpage",
				items: [loreuiannocurpage(store), loreuiannosearch(store), loreuiannoabout(store) ]
			};
}

/**
 * Construct the Ext based GUI and initialize and show the components
 * @param {Object} store The datastore for the store
 */	
lore.anno.ui.initGUI = function(store){
	lore.debug.ui("initGUI: store " + store, store);
	if (!store) {
		lore.debug.ui("No store found for view");
		return;
	}
	
	try {
		lore.anno.ui.gui_spec = {
			layout: "border",
			items: [{
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
						items: [ loreuiannonavtabs(store)]
					}]
				}]
			}]
		};
		
		lore.anno.ui.main_window = new Ext.Viewport(lore.anno.ui.gui_spec);
		lore.anno.ui.main_window.show();
		lore.anno.ui.initExtComponents();
	} 
	catch (ex) {
		lore.debug.ui("Exception creating anno UI", ex);
	}
}

/**
 * Initialize the Ext Components. Sets globals, visibility of fields
 * and initialize handlers
 */
lore.anno.ui.initExtComponents = function(){
	try {
		
		lore.anno.ui.abouttab = Ext.getCmp("about");
		lore.anno.ui.views = Ext.getCmp("curpage");
		lore.anno.ui.views.contextmenu = new Ext.menu.Menu({
				id : "anno-context-menu"
		});
		lore.anno.ui.views.contextmenu.add({
		        text : "Show RDF/XML",
        		handler : function (){try {
            		lore.anno.ui.openView("remrdfview","RDF/XML",
					function(){
							Ext.getCmp("remrdfview").body.update(lore.global.util.escapeHTML(lore.anno.serialize("rdf")));
						
					}	);
					} 
						catch (e) {
							lore.debug.anno("Error generating RDF view: " + e, e);	
						}
        	}
    	});
	 
		
		lore.anno.ui.views.on("contextmenu", function(tabpanel, tab, e){
        	lore.anno.ui.views.contextmenu.showAt(e.xy);
    	});

		lore.anno.ui.treerealroot = Ext.getCmp("annosourcestree").getRootNode(); 
		lore.anno.ui.treeroot =  new Ext.tree.TreeNode({text:'Current Page'});
		lore.anno.ui.treeunsaved = new Ext.tree.TreeNode({text:'Unsaved Changes'});
		
		lore.anno.ui.treerealroot.appendChild([ lore.anno.ui.treeroot, lore.anno.ui.treeunsaved]);

		lore.anno.ui.treeroot.expand();
		lore.anno.ui.addTreeSorter('created', 'asc');
		Ext.getCmp("annosourcestree").on("expandnode", function (node) {
			if ( node != lore.anno.ui.treeroot) {
				node.expandChildNodes(false);
			}	
		});
		
		Ext.getCmp("annosourcestree").on("click", lore.anno.ui.handleAnnotationSelection);
		Ext.getCmp("annosourcestree").on("dblclick", lore.anno.ui.handleEditAnnotation);
		Ext.getCmp("sorttypecombo").on("select", lore.anno.ui.handleSortTypeChange);
		
		lore.anno.ui.formpanel = Ext.getCmp("annotationslistform")
		lore.anno.ui.form = lore.anno.ui.formpanel.getForm();
		lore.anno.ui.formpanel.hide();
		lore.anno.ui.sformpanel = Ext.getCmp("annosearchform");
		lore.anno.ui.sform = lore.anno.ui.sformpanel.getForm();
		
		
		lore.anno.ui.sgrid = Ext.getCmp("annosearchgrid");
		
		lore.anno.ui.sgrid.contextmenu = new Ext.menu.Menu({
					id: lore.anno.ui.sgrid.id + "-context-menu"
				});
				
		lore.anno.ui.sgrid.contextmenu.add({
					text: "Add as node/s in compound object editor",
					handler: lore.anno.ui.handleAddResultsToCO
				});
		
		lore.anno.ui.sgrid.on('contextmenu', function(e) {
			lore.anno.ui.sgrid.contextmenu.showAt(e.xy);
    	});
				
		// set up the sources tree
		
		Ext.getCmp("search").on('click', lore.anno.ui.handleSearchAnnotations);
		Ext.getCmp("resetSearch").on('click', function () {
			lore.anno.ui.sform.reset();
		});
		
		Ext.getCmp("resetannobtn")
				.on('click', function () { lore.anno.ui.rejectChanges()});
		Ext.getCmp("hideeditbtn").on('click', lore.anno.ui.hideAnnotation);
		Ext.getCmp("updannobtn").on('click', lore.anno.ui.handleSaveAnnotationChanges);
		Ext.getCmp("delannobtn").on('click', lore.anno.ui.handleDeleteAnnotation);
		/*Ext.getCmp("updctxtbtn").on('click',
				lore.anno.ui.handleUpdateAnnotationContext);
		Ext.getCmp("updrctxtbtn").on('click',
				lore.anno.ui.handleUpdateAnnotationVariantContext);*/
		Ext.getCmp("variantfield").on('specialkey', lore.anno.ui.launchFieldWindow);
		Ext.getCmp("originalfield").on('specialkey', lore.anno.ui.launchFieldWindow);
		Ext.getCmp("typecombo").on('valid', lore.anno.ui.handleAnnotationTypeChange);
		Ext.getCmp("addmetabtn").on('click', lore.anno.ui.handleAddMeta);
		Ext.getCmp("remmetabtn").on('click', lore.anno.ui.handleRemMeta);
		
		//Ext.getCmp("addmetabtn").on('click', lore.anno.ui.handleAddMeta );
		//Ext.getCmp("remmetabtn").on('click', lore.anno.ui.handelRemMeta);
		
		lore.anno.ui.form.findField("body").on("push", function(field, html) {
			// this is hack to stop this field being flagged as dirty because
			// originalValue is XML and the value field is converted to HTML
			field.originalValue = field.getValue();
			
		});
		
		lore.anno.ui.setAnnotationFormUI(false, false );
		
		lore.anno.ui.abouttab.body.update("<iframe height='100%' width='100%' "
			+ "src='chrome://lore/content/annotations/about_annotations.html'></iframe>");
			
	    Ext.QuickTips.interceptTitles = true;
	    Ext.QuickTips.init();
        Ext.apply(Ext.QuickTips.getQuickTip(),{
            dismissDelay: 0
        });
		
	} catch (e ) {
		lore.debug.ui("Errors during initExtComponents: " + e, e);
	}
}