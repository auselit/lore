/*
 * Copyright (C) 2008 - 2009 School of Information Technology and Electrical
 * Engineering, University of Queensland (www.itee.uq.edu.au).
 *  
 * This file is part of LORE. LORE was developed as part of the Aus-e-Lit project.
 *
 * LORE is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * LORE is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with LORE.  If not, see <http://www.gnu.org/licenses/>.
 */
Ext.namespace("lore");
Ext.reg('propertygrid', Ext.grid.PropertyGrid);

lore.gui_spec = {
	layout : "border",
	items : [{
				region : "center",
				layout : "fit",
				border: false,
				items : [{
							layout : "border",
							border: false,
							items : [{
										region : "center",
										border : false,
										layout: "fit",
										items : [        {
          									xtype : "ddtabpanel",
											id : "loreviews",
          									items : [            {
              									xtype : "panel",
              									title : "Welcome",
												id: "welcome",
												html: "<div><h1>LORE: Literature Object Reuse and Exchange</h1><ul ><li>Create a new compound object</li><li>Annotate current resource</li></ul></div>",
												closable: true,
												iconCls: "welcome-icon"
												
          									},        {
												id: "annotationslist",
              									title : "Annotations",	
												xtype : "grid",
												border : false,
												stripeRows: true,
												viewConfig : {
													forceFit : true
												},
												ds : new Ext.data.Store({
														reader : new Ext.data.ArrayReader(
														{}, [{name : 'created'}, {name: 'creator'},
														{name : 'title'}
													]),
													data : [['16/03/2009','Anna Gerber','Test Annotation'],['17/03/2009', 'Anna Gerber', 'Another test annotation']]
													}),
												cm : new Ext.grid.ColumnModel([
													{
													header : 'Date created',
													sortable : true,
													dataIndex : 'created'
													}, {
													header : 'Creator',
													sortable : true,
													dataIndex : 'creator'},
													{
													header: 'Title',
													sortable: true,
													dataIndex : 'title'
													}
												])
												
												
          									}, {
              									xtype : "tabpanel",
              									title : "Compound Object Editor",
												id : "compoundobjecteditor",
												autoScroll: true,
												items: [{
														title: "Graph View",
														xtype: "panel",
														id: "drawingarea",
														autoWidth: true
															
													}, {
														title: "Table of Contents",
														xtype: "panel",
														id: "remlistview"														
														
													}, {
														title: "RDF/XML View",
														xtype: "panel",
														id: "remrdfview"		
													}		
												],
												activeTab : 0
          									}],
          									activeTab : 2
      									}]
									}, {
										region : "south",
										xtype: "statusbar",
										id: "lorestatus",
										defaultText: "",
										autoClear: 6000	
									}]
						}]
			}/*, {
				region : "north",
				xtype : 'toolbar',
				border: false,
				items : [{
							xtype : 'tbbutton',
							iconCls : "tb-option",
							tooltip : "Options",
							minWidth : 25,
							handler : function(btn) {
								alert("option button pressed");
							}
						}, {
							xtype : 'tbbutton',
							iconCls : "tb-new-obj",
							tooltip : "New Compound Object",
							minWidth : 25,
							handler : function(btn) {
								alert("new compound object button pressed");
							}
						}, {
							xtype : 'tbbutton',
							iconCls : "tb-view-detail",
							tooltip : "View details",
							minWidth : 25,
							handler : function(btn) {
								alert("view detail button pressed");
							}
						}]

			}*/, {
				region : "west",
				title: "Sources and Properties",
				border: false,
				width : 250,
				minWidth: 100,
				split : true,
				collapsible : true,
				layout : "fit",
				items : [{
					layout : "border",
					items : [{
								region : "center",
								
								items : [{
											xtype : "treepanel",
											id: "annotationstree",
											animate : true,
											autoScroll : true,
											containerScroll : true,
											border : false,
											root : new Ext.tree.TreeNode({
														text : 'Annotations',
														draggable : false,
														iconCls : "tree-anno"
													}),
											dropConfig : {
												appendOnly : true
											}
										}, {
											xtype : "treepanel",
											id: "remstree",
											animate : true,
											autoScroll : true,
											containerScroll : true,
											border : false,
											root : new Ext.tree.TreeNode({
														text : 'Compound Objects',
														draggable : false,
														iconCls : "tree-ore"
													}),
											dropConfig : {
												appendOnly : true
											}
										}]
							}, {
								region : "south",
								split : true,
								height: 200,
          						xtype : "tabpanel",
								id: "propertytabs",
								enableTabScroll:true,
 								defaults: {autoScroll:true},

          						items : [{
									xtype: 'propertygrid',
									title: 'Resource Map',
									id: "remgrid",
									enableHdMenu: true,
									autoExpandColumn: 1,
									autoWidth: true,
									autoHeight: true,
									viewConfig: {
										forceFit: true,
										scrollOffset: 0
									}					
          							},        {
									xtype: 'propertygrid',
									title: 'Aggregation',
									id: "aggregrid",
									enableHdMenu: true,
									autoExpandColumn: 1,
									autoWidth: true,
									autoHeight: true,
									viewConfig: {
										forceFit: true,
										scrollOffset: 0
									}				
          							}, {
              						xtype: "propertygrid",
									title: "Resource/Relationship",
									id: "relgrid",
									enableHdMenu: true,
									autoExpandColumn: 1,
									autoWidth: true,
									autoHeight: true,
									viewConfig: {
										forceFit: true,
										scrollOffset: 0
									}
          							},{
              						xtype: "propertygrid",
									title: "Annotation",
									id: "annogrid",
									enableHdMenu: true,
									autoExpandColumn: 1,
									autoWidth: true,
									autoHeight: true,
									viewConfig: {
										forceFit: true,
										scrollOffset: 0
									}
          						}],
          						activeTab : 0
      						}]					
					}]
			}]
};

lore.main_window = new Ext.Viewport(lore.gui_spec);
lore.main_window.show();
