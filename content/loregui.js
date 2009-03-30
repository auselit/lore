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
                        	view: new Ext.grid.GridView({
									forceFit: true,
									getRowClass: function(rec){
										if (!rec.data.id) {
											return "newanno";
										}
									}
							}),	
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
	                			singleSelect: true	
	            			})
                    	}, {
							region : "center",
            				xtype: 'fieldset',
							autoScroll: true,
							id: 'annotationsform',
            				labelWidth: 75,
            				title:'Annotation details:',
							defaultType: 'textfield',
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
								id: 'originalfield',
								readOnly: true,
								style: 'background:none;border:none',
								//hidden: true,
								//hideLabel: true
							},{
								fieldLabel: 'Revised',
								name: 'revised',
								id: 'revisedfield',
								readOnly: true,
								style: 'background:none;border:none',
								//hidden: true,
								//hideLabel: true
							},{
								fieldLabel: 'Original Context',
								name: 'originalcontext',
								readOnly: true,
								style: 'background:none;border:none',
								//hidden: true,
								//hideLabel: true
							},{
								fieldLabel: 'Revised Context',
								name: 'revisedcontext',
								readOnly: true,
								style: 'background:none;border:none',
								//hidden: true,
								//hideLabel: true
							},
							{
								xtype: "combo",
								id: "typecombo",
								fieldLabel: 'Type',
								name: 'type',
                        		hiddenName:'type',
                       			store: new Ext.data.SimpleStore({
                           		 	fields: ['typename', 'qtype'],
                            		data : [
       									 ['Comment',"http://www.w3.org/2000/10/annotationType#Comment"],
										 ['Explanation',"http://www.w3.org/2000/10/annotationType#Explanation"],
										 ['Revision',"http://austlit.edu.au/ontologies/2009/03/lit-annotation-ns#RevisionAnnotation"]
									]
                        		}),
                        		valueField:'qtype',
                        		displayField:'typename',
                        		typeAhead: true,
								mode: 'local',
								selectOnFocus: true                        		
							},
							{
                				fieldLabel: 'Title',
                				name: 'title'
            				},{
                				fieldLabel: 'Creator',
               					name: 'creator'
            				},{
								fieldLabel: 'Revision Agent',
								name: 'revisionagent',	
							},{
								fieldLabel: 'Revision Place',
								name: 'revisionplace',	
							},{
								fieldLabel: 'Revision Date',
								name: 'revisiondate',	
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
           						text: 'Save Annotation',
								id: 'updannobtn',
								tooltip: 'Save the annotation to the repository'
        					}, {
								text: 'Delete Annotation',
								id: 'delannobtn',
								tooltip: 'Delete teh annotation from the repository - CANNOT BE UNDONE!'
							},{
            					text: 'Cancel',
								id: 'cancelupdbtn'
        					},{
								text: 'Update context',
								id: 'updctxtbtn',
								tooltip: 'Update the (original) context from the current selection in the main browser window'
							}, {
								text: 'Update revised context',
								id: 'updrctxtbtn',
								tooltip: 'Update the revised context from the current selection in the main browser window'
							}
							]
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
                            id: "remrdfview",
							autoScroll: true
                        }],
                        activeTab: "drawingarea"
                     }, {
                        xtype: "panel",
                        title: "Revisions",
                        id: "revisionannotations",
                        // html: '<div id="window-test"></div>',
                        deferredRender: false,
                        layout: 'column',
                        items: [
											  {
												  xtype: "panel",
													id: "revisionsleftcolumn",
													columnWidth: 0.20,
													layout: 'border',
													items: [{
	                          xtype: "grid",
	                          id: "revisionannotationlisting",
	                          title: "Revisions",
														region: 'center',
														split: true,
	                          store: revisionStore,
	                          autoExpandColumn: 'revisionName',
	                          columns: [
	                            {id: 'revisionName', sortable: false, dataIndex: 'name'},
	                          ],
	                        }, {
                            xtype: "panel",
                            id: "revisiondetails",
														split: true,
                            region: 'south',
                            title: "Details",
														height: 300,
                            html: '<div style="font-family: arial, verdana, helvetica, sans-serif; font-size: smaller;" id="revisionsdetailstext"></div>',
                          }],
												},
                        {
                          xtype: "panel",
                          id: "revisionannotationsource",
                          title: "Revision Source",
                          html: '<div><div style="font-family: arial, verdana, helvetica, sans-serif; font-style: italic; color: grey; font-size: smaller; padding: 2px; " id="revisionSourceLabel">about:blank</div><iframe onload="console.debug(\'Source load.\');" id="revisionSourceFrame" height="350px" width="490px" src="http://www.austlit.edu.au/common/loredemo"></iframe></div>',
                          layout: "fit",
                          /*
                          floating: true,
                          draggable: lore.dragHandler,
                          width: 500,
                          height: 400,
                          x: 10,
                          y: 10,
                          */
                          columnWidth: .40,
                        },
                        {
                          xtype: "panel",
                          id: "revisionannotationtarget",
                          title: "Revision Target",
                          html: '<div><div style="font-family: arial, verdana, helvetica, sans-serif; font-style: italic; color: grey; font-size: smaller; padding: 2px; " id="revisionTargetLabel">about:blank</div><iframe onload="console.debug(\'Target load.\');" id="revisionTargetFrame" height="350px" width="490px" src="http://www.austlit.edu.au/common/loredemo"></iframe></div>', 
                          layout: "fit",
                          /*
                          floating: true,
                          draggable: lore.dragHandler,
                          width: 500,
                          height: 400,
                          x: 800,
                          y: 10,
                          */
                          columnWidth: .40,
                        }],
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
try {
	lore.main_window = new Ext.Viewport(lore.gui_spec);
	lore.main_window.show();
} catch (ex) {alert(ex.toString());}
