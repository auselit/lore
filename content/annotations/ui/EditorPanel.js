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

/*
 * @include  "/oaiorebuilder/content/annotations/annotations.js"
 * @include  "/oaiorebuilder/content/debug.js"
 * @include  "/oaiorebuilder/content/util.js"
 */
 
lore.anno.ui.EditorPanel = Ext.extend(Ext.form.FormPanel, {

	form: function () {
		return {
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
	},
	
	initComponent: function(){
	  	try {
			Ext.apply ( this, this.form()
			 );
			
			lore.anno.ui.EditorPanel.superclass.initComponent.apply(this, arguments);
		} catch(e){
			lore.debug.anno("EditorPanel:initComponent() - " + e, e);
		}
	}
});

Ext.reg("annoeditorpanel", lore.anno.ui.EditorPanel);
