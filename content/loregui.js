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
Ext.namespace("lore");

lore.gui_spec = {
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
                    xtype: "ddtabpanel",
                    id: "loreviews",
					deferredRender: false,
                    items: [{
                        xtype: "panel",
                        title: "Welcome",
                        id: "welcome",
						autoWidth: true,
						autoScroll: true,
                        closable: true,
                        iconCls: "welcome-icon"
                    
                    }, {
						xtype: "form",
						id: "annotationslistform",
						title: "Annotations", 
						layout: 'border',
						items: [{
							region: "north",
							split:true,
                        	id: "annotationslist",
                        	xtype: "grid",
                        	autoWidth: true,
							autoScroll: true,
                        	stripeRows: true,
                        	viewConfig: {
                            	forceFit: true
                        	},
                        	ds: new Ext.data.JsonStore({
                           		fields: [{
                                	name: 'created'
                            	}, {
                                	name: 'creator'
                            	}, {
                                	name: 'title'
                            	}, {
									name: 'body'
								}, {
                                	name: 'modified'
                            	}, {
                                	name: 'type'
                            	}, {
                                	name: 'lang'
                            	}, {
									name: 'resource'
								}, { 
									name: 'id'
								}, {
									name: 'context'
								}, {
									name :'isReply'
								}, {
									name: 'bodyURL'
								}, {
									name: 'about'
								}, {
									name: 'original'
								}, {
									name: 'revised'
								}, {
									name: 'originalcontext'
								}, {
									name: 'revisedcontext'
								}, {
									name: 'revisionagent'
								}, {
									name: 'revisionplace'
								},{
									name: 'revisiondate'
								} 
								],
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
	                			singleSelect: true,
	                			listeners: {
	                    			rowselect: function(sm, row, rec) { 										Ext.getCmp("annotationslistform").getForm().loadRecord(rec);
	                    			}
	                			}
	            			})
                    	}, {
							region : "center",
            				xtype: 'fieldset',
							id: 'annotationsform',
            				labelWidth: 75,
            				title:'Update annotation:',
							defaultType: 'textfield',
            				autoHeight: true,
							border: false,
							labelAlign: 'right',
							buttonAlign: 'left',
							style: 'margin-left:10px;margin-top:10px;',
							defaults: {width: 600},
							items: [{
								fieldLabel: 'ID',
								name: 'id', 
								hidden: true,
								hideLabel: true
							},{
								fieldLabel: 'Annotates',
								name: 'resource', 
								readOnly: true, 
								style: 'background:none;border:none'
							},{
								fieldLabel: 'Context',
								name: 'context',
								readOnly: true,
								style: 'background:none;border:none'
							},{
								fieldLabel: 'Original',
								name: 'original',
								readOnly: true,
								style: 'background:none;border:none',
								hidden: true,
								hideLabel: true
							},{
								fieldLabel: 'Revised',
								name: 'revised',
								readOnly: true,
								style: 'background:none;border:none',
								hidden: true,
								hideLabel: true
							},{
								fieldLabel: 'Original Context',
								name: 'originalcontext',
								readOnly: true,
								style: 'background:none;border:none',
								hidden: true,
								hideLabel: true
							},{
								fieldLabel: 'Revised Context',
								name: 'revisedcontext',
								readOnly: true,
								style: 'background:none;border:none',
								hidden: true,
								hideLabel: true
							},
							{
								//xtype: "combobox",
								fieldLabel: 'Type',
								name: 'type'
                        		//hiddenName:'type',
                       			/*store: new Ext.data.SimpleStore({
                           		 	fields: ['abbrtype', 'qualifiedtype'],
                            		data : [
										['Comment','fullcomment'],
										['Explantation','fullexplanation']]
                        		}),
                        		valueField:'qualifiedtype',
                        		displayField:'abbrtype',*/
                        		//typeAhead: true                        		
							},
							{
                				fieldLabel: 'Title',
                				name: 'title'
            				},{
                				fieldLabel: 'Creator',
               					name: 'creator'
            				},{
                				fieldLabel: 'Body',
								xtype: 'htmleditor',
                				name: 'body'
								
								
            				}/*,{
                				//xtype: 'datefield',
                				fieldLabel: 'Created',
                				name: 'created'
            				}*/],
							buttons: [{
           						text: 'Update Annotation',
								id: 'updannobtn'
        					}, {
								text: 'Delete Annotation',
								id: 'delannobtn'
							},{
            					text: 'Cancel',
								id: 'cancelupdbtn'
        					}]
						}]
                    }, {
                        xtype: "tabpanel",
                        title: "Compound Object Editor",
                        id: "compoundobjecteditor",
						deferredRender: false,
                        autoScroll: true,
                        items: [{
                            title: "Graph",
                            xtype: "panel",
                            id: "drawingarea",
                            autoWidth: true
                        
                        }, {
                            title: "Summary",
                            xtype: "panel",
                            id: "remlistview"

                        
                        }, {
                            title: "SMIL",
                            xtype: "panel",
                            id: "remsmilview"

                        
                        },{
                            title: "RDF/XML",
                            xtype: "panel",
                            id: "remrdfview"
                        }],
                        activeTab: "drawingarea"
                    }
					],
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
        title: "Sources and Properties",
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
                
                items: [{
                    xtype: "treepanel",
                    id: "sourcestree",
                    animate: true,
                    autoScroll: true,
                    rootVisible: false,
                    containerScroll: true,
                    border: false,
                    root: new Ext.tree.TreeNode({}),
                    dropConfig: {
                        appendOnly: true
                    }
                
                }]
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
                },/* {
                    xtype: 'propertygrid',
                    title: 'Aggregation',
                    id: "aggregrid",
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
                
                },*/ {
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
                }                
                ]
            }]
        }]
    }]
};

lore.main_window = new Ext.Viewport(lore.gui_spec);
lore.main_window.show();
