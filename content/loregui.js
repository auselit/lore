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
                            title: "Annotation Timeline",
                            xtype: "panel",
                            id: "annotimeline"
                        },{
							xtype: "form",
							id: "annotationslistform",
							title: "Annotation Editor",
							layout: 'border',
							items: [{
								region: "north",
								split: true,
								id: "annotationslist",
								xtype: "grid",
                                height:90,
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
                                layout: 'form',
								autoScroll: true,
								id: 'annotationsform',
								labelWidth: 100,
								title: 'Edit Annotation:',
								defaultType: 'textfield',
								border: false,
								labelAlign: 'right',
								buttonAlign: 'right',
								style: 'margin-left:10px;margin-top:10px;',
								defaults: {
									width: 600
								},
								items: [{
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
									fieldLabel: 'Variation Agent',
									name: 'variationagent'
								}, {
									fieldLabel: 'Variation Place',
									name: 'variationplace'
								}, {
									fieldLabel: 'Variation Date',
									name: 'variationdate'
								}, {
                                    fieldLabel: 'ID',
                                    name: 'id',
                                    hidden: true,
                                    hideLabel: true,
                                    style: {padding:0,margin:0}
                                }, {
                                    fieldLabel: 'Annotates',
                                    name: 'resource',
                                    readOnly: true,
                                    style: 'background:none;border:none;font-size:90%;',
                                    labelStyle: 'font-size:90%;'
                                    
                                }, {
                                    fieldLabel: 'Context',
                                    name: 'context',
                                    readOnly: true,
                                    hidden: true,
                                    hideLabel: true,
                                    style: 'background:none;border:none',
                                    style: {padding:0,margin:0}
                                }, {
                                    fieldLabel: 'Original resource',
                                    name: 'original',
                                    id: 'originalfield',
                                    readOnly: true,
                                    style: 'background:none;border:none;font-size:90%',
                                    labelStyle: 'font-size:90%'
                                }, {
                                    fieldLabel: 'Original Context Xpointer',
                                    name: 'originalcontext',
                                    readOnly: true,
                                    style: 'background:none;border:none',
                                    hidden: true,
                                    hideLabel: true,
                                    style: {padding:0,margin:0}
                                }, {
                                    fieldLabel: 'Selection',
                                    name: 'contextdisp',
                                    readOnly: true,
                                    style: 'background:none;border:none;font-size:90%',
                                    labelStyle: 'font-size:90%;'
                                }, {
                                    fieldLabel: 'Variant resource',
                                    name: 'variant',
                                    id: 'variantfield',
                                    readOnly: true,
                                    style: 'background:none;border:none;font-size:90%',
                                    labelStyle: 'font-size:90%'
                                }, {
                                    fieldLabel: 'Variant Context Xpointer',
                                    name: 'variantcontext',
                                    readOnly: true,
                                    style: 'background:none;border:none',
                                    hidden: true,
                                    hideLabel: true,
                                    style: {padding:0,margin:0}
                                }, {
                                    fieldLabel: 'Variant selection',
                                    name: 'rcontextdisp',
                                    readOnly: true,
                                    style: 'background:none;border:none;font-size:90%',
                                    labelStyle: 'font-size:90%'
                                }, {
									fieldLabel: 'Body',
									xtype: 'htmleditor',
									name: 'body'
                                    //enableSourceEdit: false    should really disable this but while debugging it is useful
								
								
								}		
								],
								buttons: [{
                                    text: 'Update selection',
                                    id: 'updctxtbtn',
                                    tooltip: 'Set the context of the annotation to be the current selection from the main browser window'
                                },  {
                                    text: 'Update variant selection',
                                    id: 'updrctxtbtn',
                                    hidden: true,
                                    tooltip: 'For Variation Annotations: set the context in the variant resource to be the current selection from the main browser window'
                                }, {
                                    text: 'Delete Annotation',
                                    id: 'delannobtn',
                                    tooltip: 'Delete the annotation - CANNOT BE UNDONE'
                                },{
									text: 'Save Annotation',
									id: 'updannobtn',
									tooltip: 'Save the annotation to the repository'
								}, {
                                    text: 'Cancel',
                                    id: 'cancelupdbtn',
                                    tooltip: 'Cancel - changes will be discarded'
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
                    }]
					}, {
                        xtype: "tabpanel",
                        title: "Compound Objects",
                        id: "compoundobjecteditor",
						deferredRender: false,
                        plugins : lore.ui.vismode,
						defaults : {plugins: lore.ui.vismode},
                        items: [{
                            title: "Editor",
                            xtype: "panel",
                            id: "drawingarea",
							autoScroll: true  
                        }, {
                            title: "Summary",
                            xtype: "panel",
                            id: "remlistview",
							autoScroll: true
        					
                        }, /*{
                            title: "SMIL",
                            xtype: "panel",
                            id: "remsmilview",
							autoScroll: true,
							closable: true
                        
                        },*//*{
                            title: "Explore",
                            id: "remexploreview",
                            autoScroll:true
                        }*/],
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
                deferredRender: false,
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
                        id: "maddbtn",
                        text: "Add property"
                    }), new Ext.Button({
                        id: "mrembtn",
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
    //lore.debug.ui("lore height is " + innerHeight);
	lore.ui.main_window = new Ext.Viewport(lore.ui.gui_spec);
	lore.ui.main_window.show();
} catch (ex) {
	lore.debug.ui("Exception creating lore UI", ex);
}
