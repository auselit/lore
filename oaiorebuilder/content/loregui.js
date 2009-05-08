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
                items: [{
                    xtype: "tabpanel",
                    id: "loreviews",
					plugins : lore.ui.vismode,
					deferredRender: false,
                    items: [{
                        title: "Welcome",
                        id: "welcome",
						autoWidth: true,
						autoScroll: true,
                        iconCls: "welcome-icon"
                    
                    }, {
						xtype: "tabpanel",
						title: "Annotations",
						id: "annotationstab",
						deferredRender: false,
						activeTab: "annotationslistform",
						items: [{
							xtype: "form",
							id: "annotationslistform",
							title: "Annotation List",
							layout: 'border',
							items: [{
								region: "north",
								split: true,
								id: "annotationslist",
								xtype: "grid",
								autoWidth: true,
								autoScroll: true,
								stripeRows: true,
								view: new Ext.grid.GridView({
									forceFit: true,
									getRowClass: function(rec){
										if (!rec.data.id) {
											return "newanno";
										}
									}
								}),
								ds: new Ext.data.JsonStore({
									fields: [
										{name: 'created'}, 
										{name: 'creator'}, 
										{name: 'title'}, 
										{name: 'body'}, 
										{name: 'modified'}, 
										{name: 'type'}, 
										{name: 'lang'}, {
										name: 'resource'
									}, {
										name: 'id'
									}, {
										name: 'context'
									}, {
										name: 'isReply'
									}, {
										name: 'bodyURL'
									}, {
										name: 'about'
									}, {
										name: 'original'
									}, {
										name: 'variant'
									}, {
										name: 'originalcontext'
									}, {
										name: 'variantcontext'
									}, {
										name: 'variationagent'
									}, {
										name: 'variationplace'
									}, {
										name: 'variationdate'
									}],
									data: {}
								}),
								cm: new Ext.grid.ColumnModel([{
									header: 'Date created',
									sortable: true,
									dataIndex: 'created'
								}, { 
									header: 'Creator',
									sortable: true,
									dataIndex: 'creator'
								
								}, {
									header: 'Title',
									sortable: true,
									dataIndex: 'title'
								}, {
									header: 'Body',
									dataIndex: 'body',
									hidden: false
								}, {
									header: 'Date Modified',
									dataIndex: 'modified',
									hidden: true
								}, {
									header: 'Type',
									dataIndex: 'type',
									hidden: true
								}, {
									header: 'Lang',
									dataIndex: 'lang',
									hidden: true,
									width: 40
								
								}]),
								sm: new Ext.grid.RowSelectionModel({
									singleSelect: true
								})
							}, {
								region: "center",
								xtype: 'fieldset',
								autoScroll: true,
								id: 'annotationsform',
								labelWidth: 100,
								title: 'Annotation details:',
								defaultType: 'textfield',
								border: false,
								labelAlign: 'right',
								buttonAlign: 'left',
								style: 'margin-left:10px;margin-top:10px;',
								defaults: {
									width: 600
								},
								items: [{
									fieldLabel: 'ID',
									name: 'id',
									hidden: true,
									hideLabel: true
								}, {
									fieldLabel: 'Annotates',
									name: 'resource',
									readOnly: true,
									style: 'background:none;border:none'
								}, {
									fieldLabel: 'Context',
									name: 'context',
									readOnly: true,
									style: 'background:none;border:none'
								}, {
									fieldLabel: 'Original resource',
									name: 'original',
									id: 'originalfield',
									readOnly: true,
									style: 'background:none;border:none'
								}, {
									fieldLabel: 'Original Context Xpointer',
									name: 'originalcontext',
									readOnly: true,
									style: 'background:none;border:none',
									hidden: true,
									hideLabel: true
								}, {
									fieldLabel: 'Original selection',
									name: 'ocontextdisp',
									readOnly: true,
									style: 'background:none;border:none'
								}, {
									fieldLabel: 'Variant resource',
									name: 'variant',
									id: 'variantfield',
									readOnly: true,
									style: 'background:none;border:none'
								}, {
									fieldLabel: 'Variant Context Xpointer',
									name: 'variantcontext',
									readOnly: true,
									style: 'background:none;border:none',
									hidden: true,
									hideLabel: true
								}, {
									fieldLabel: 'Variant selection',
									name: 'rcontextdisp',
									readOnly: true,
									style: 'background:none;border:none'
								}, {
									xtype: "combo",
									id: "typecombo",
									fieldLabel: 'Type',
									name: 'type',
									hiddenName: 'type',
									store: new Ext.data.SimpleStore({
										fields: ['typename', 'qtype'],
										data: [['Comment', "http://www.w3.org/2000/10/annotationType#Comment"], ['Explanation', "http://www.w3.org/2000/10/annotationType#Explanation"], ['Variation', "http://austlit.edu.au/ontologies/2009/03/lit-annotation-ns#VariationAnnotation"]]
									}),
									valueField: 'qtype',
									displayField: 'typename',
									typeAhead: true,
									mode: 'local',
									selectOnFocus: true
								}, {
									fieldLabel: 'Title',
									name: 'title'
								}, {
									fieldLabel: 'Creator',
									name: 'creator'
								}, {
									fieldLabel: 'Variation Agent',
									name: 'variationagent'
								}, {
									fieldLabel: 'Variation Place',
									name: 'variationplace'
								}, {
									fieldLabel: 'Variation Date',
									name: 'variationdate'
								}, {
									fieldLabel: 'Body',
									xtype: 'htmleditor',
									name: 'body'
								
								
								}		
								],
								buttons: [{
									text: 'Save Annotation',
									id: 'updannobtn',
									tooltip: 'Save the annotation to the repository'
								}, {
									text: 'Delete Annotation',
									id: 'delannobtn',
									tooltip: 'Delete the annotation from the repository - CANNOT BE UNDONE!'
								}, {
									text: 'Cancel',
									id: 'cancelupdbtn'
								}, {
									text: 'Update context',
									id: 'updctxtbtn',
									tooltip: 'Update the (original) context from the current selection in the main browser window'
								}, {
									text: 'Update variant context',
									id: 'updrctxtbtn',
									tooltip: 'Update the variant context from the current selection in the main browser window'
								}]
							}]
						}, {
                        xtype: "panel",
                        title: "Variations",
                        id: "variationannotations",
                        // html: '<div id="window-test"></div>',
                        deferredRender: false,
                        layout: 'column',
                        items: [
											  {
												  xtype: "panel",
													id: "variationsleftcolumn",
													columnWidth: 0.20,
													layout: 'border',
													items: [{
	                          xtype: "grid",
	                          id: "variationannotationlisting",
	                          title: "Variation Annotations",
														region: 'center',
														split: true,
	                          store: lore.anno.variationStore,
	                          autoExpandColumn: 'variationName',
	                          columns: [
	                            {id: 'variationName', sortable: false, dataIndex: 'name'}
	                          ]
	                        }]
												},
                        {
                          xtype: "panel",
                          id: "variationannotationsource",
                          title: "Original Resource",
                          html: '<div><div style="font-family: arial, verdana, helvetica, sans-serif; font-style: italic; color: grey; font-size: smaller; padding: 2px; " id="variationSourceLabel">about:blank</div><iframe onload="lore.debug.anno(\'Source load.\',this);" id="variationSourceFrame" name="variationsource" height="350px" width="490px" src="about:blank"></iframe></div>',
                          layout: "fit",
						  autoScroll: true,
                         
                          columnWidth: .40
                        },
                        {
                          xtype: "panel",
                          id: "variationannotationtarget",
                          title: "Variant Resource",
                          html: '<div><div style="font-family: arial, verdana, helvetica, sans-serif; font-style: italic; color: grey; font-size: smaller; padding: 2px; " id="variationTargetLabel">about:blank</div><iframe onload="console.debug(\'Target load.\');" id="variationTargetFrame" height="350px" width="490px" src="about:blank"></iframe></div>', 
                          layout: "fit",
						  autoScroll: true,
                          /*
                          floating: true,
                          draggable: lore.dragHandler,
                          width: 500,
                          height: 400,
                          x: 800,
                          y: 10,
                          */
                          columnWidth: .40
                        }]
                    }, {
							title: "Annotation Timeline",
							xtype: "panel",
							id: "annotimeline"
						}]
					}, {
                        xtype: "tabpanel",
                        title: "Compound Object",
                        id: "compoundobjecteditor",
						deferredRender: false,
                        plugins : lore.ui.vismode,
						defaults : {plugins: lore.ui.vismode},
                        items: [{
                            title: "Graph Editor",
                            xtype: "panel",
                            id: "drawingarea",
							autoScroll: true  
                        }, {
                            title: "Summary",
                            xtype: "panel",
                            id: "remlistview",
							autoScroll: true
        					
                        }, {
                            title: "SMIL",
                            xtype: "panel",
                            id: "remsmilview",
							autoScroll: true
							
                        
                        }],
                        activeTab: "drawingarea"
                     }, {
					
					title: "Text mining",
					id: "textmining",
					autoWidth: true,
					autoScroll:true
				}],
                    activeTab: "compoundobjecteditor"
					
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
        title: "LORE",
        id: "loresidebar",
        border: false,
        width: 250,
        minWidth: 100,
        split: true,
        collapsible: true,
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
                height: 200,
                xtype: "tabpanel",
                id: "propertytabs",
                enableTabScroll: true,
                defaults: {
                    autoScroll: true
                },
                
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
                        text: "Add property"
                    }), new Ext.Button({
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
                },
				{
					xtype: "panel",
					title: "Annotation summary",
					id: "annotationsummary",
					autoWidth: true,
					viewConfig: {
						forceFit: true
					}
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
