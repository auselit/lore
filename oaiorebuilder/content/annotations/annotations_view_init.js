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
 * @include  "/oaiorebuilder/content/annotations/init.js"
 * @include  "/oaiorebuilder/content/util.js"
 */

/** 
 * Annotations View
 * @namespace
 * @name lore.anno.ui
 */

/* Class definitions */

		/*  Tree UI Class Definitions */
  
		/**
		 * LOREColumnTree 
		 * Extends a regular Ext Tree Panel adding columns and segregated
		 * header, body and footer text fields for each tree node
		 * @class lore.anno.ui.LOREColumnTree
		 * @extends Ext.tree.TreePanel
		 * @xtype loretreepanel
		 */
		lore.anno.ui.LOREColumnTree = Ext.extend(Ext.tree.TreePanel, {
		    lines : false,
		    borderWidth : Ext.isBorderBox ? 0 : 2, // the combined left/right border for each cell
		    cls : 'x-column-tree',
			expandBefore: true,
			scrollOffset:19,
			
		    onRender : function(){
		        lore.anno.ui.LOREColumnTree.superclass.onRender.apply(this, arguments);
				this.headers = this.header.createChild({cls:'x-tree-headers'});
				
		        var cols = this.columns, c;
				var totalWidth = 0;
		        
		        
				//// prevent floats from wrapping when clipped
		        for(var i = 0, len = cols.length; i < len; i++){
		             c = cols[i];
		             totalWidth += c.width;
					 
		             this.headers.createChild({
		                 cls:'x-tree-hd ' + (c.cls?c.cls+'-hd':''),
		                 cn: {
		                     cls:'x-tree-hd-text',
		                     html: c.header
		                 },
		                 style:'width:'+(c.width-this.borderWidth) +'px;'
		             });
					 
		        }
		        this.headers.createChild({cls:'x-clear'});
				
				
				this.headers.setWidth(totalWidth+ this.borderWidth);
		        this.innerCt.setWidth(totalWidth);
				this.headers.totalWidth = totalWidth;
		    },
			
			onResize : function(cmp, bWidth, bHeight, width, height) {
				var newwidth = this.getWidth();
				lore.anno.ui.LOREColumnTree.superclass.onResize.apply(this, arguments);

				var cols = this.columns;
				var index = this.expandBefore ? 0: cols.length-1;
				var c = cols[index];
				var totalWidth = this.headers.totalWidth ;
				c.width = c.width + ( newwidth - totalWidth);
				this.headers.dom.childNodes[index].style.width = c.width;
				this.headers.totalWidth = totalWidth = newwidth;
			
					this.headers.setWidth(totalWidth + this.borderWidth);
					this.innerCt.setWidth(totalWidth);
					
				try {		
						var f = function (node) {
							if (node.isExpanded()) {
								var n = node.childNodes;
								for (var i = 0; i < n.length; i++) {
									n[i].ui.refresh(n[i]);
									f(n[i]);
								}
							}
						}
						 
						f(this.getRootNode());
						
						
					
				} catch(e){
					lore.debug.anno(e,e);
				}
				
			}
		});

		/**
		 * Construct a column tree node
		 * @constructor
		 * @param {Object} attributes
		 */
		lore.anno.ui.LOREColumnTreeNode = function(attributes){
		
			this.title = attributes.title || '';
			this.bheader = attributes.bheader || '';
			this.bfooter = attributes.bfooter || '';
			this.links = attributes.links || [];
			this.nodeType = attributes.nodeType;
			
			lore.anno.ui.LOREColumnTreeNode.superclass.constructor.call(this, attributes);
		}
    
		/**
		 * LOREColumnTreeNode extends regular treenode and provides
		 * separate fields for title, header, body, and footer information per node
		 * @class lore.anno.ui.LOREColumnTreeNode
		 * @extends Ext.tree.TreeNode
		 */
		Ext.extend(lore.anno.ui.LOREColumnTreeNode, Ext.tree.TreeNode, {
			
			setText: function(_title,bh,bf,_text) {
				var oldText = this.text;
				var oldTitle = this.title;
				var oldBh = this.bheader;
				var oldBf = this.bfooter;
		        this.title = _title;
				this.text = _text;
				this.bheader = bh;
				this.bfooter = bf;
				this.attributes.title = _title;
				this.attributes.bheader = bh;
				this.attributes.bfooter = bf;
				this.attributes.text = _text;
        		
				if(this.rendered){ // event without subscribing
            		this.ui.onTextChange(this, { title:_title,
												 bheader:bh,
												 bfooter:bf,
												 text:_text,
												 oldTitle: oldTitle,
												 oldBHeader: bh,
												 oldBFooter: bf,
												 oldText: oldText });
												 
												 
        		}
        		this.fireEvent('textchange', this,  { title:_title,
												 bheader:bh,
												 bfooter:bf,
												 text:_text,
												 oldTitle: oldTitle,
												 oldBHeader: bh,
												 oldBFooter: bf,
												 oldText: oldText });
			}
			

		});
		
		
		/**
		 * Extends regular TreeNodeUI by supporting columns and more text fields
		 * per node
		 * @class lore.anno.ui.LOREColumnTreeNodeUI
		 * @extends Ext.tree.TreeNodeUI
		 */
		lore.anno.ui.LOREColumnTreeNodeUI = Ext.extend(Ext.tree.TreeNodeUI, {
			// private
			
			focus : Ext.emptyFn,
			onTextChange : function( txtfield) {
				 if(this.rendered){
           			 this.textNode.innerHTML = txtfield.text;
					 
					 this.titleNode.innerHTML = txtfield.title;
					 if ( txtfield.bheader) this.bHeaderNode.innerHTML = txtfield.bheader;
					 if ( txtfield.bfooter) this.bFooterNode.innerHTML = txtfield.bfooter;
       			 }
			},
			
			refresh : function (n) {
				var t = n.getOwnerTree();
				var cols = t.columns;
				for (var i =0; i < cols.length; i++ ){
					this.columnNodes[i].style.width = cols[i].width - t.borderWidth - ( i == (cols.length-1)? t.scrollOffset: 0);
				}
				this.bodyNode.style.width= cols[0].width- t.borderWidth -(32 + n.getDepth() * 16);
			},
			
			renderElements : function(n, a, targetNode, bulkRender){
				// add some indent caching, this helps performance when rendering a large tree
				this.indentMarkup = n.parentNode ? n.parentNode.ui.getChildIndent() : '';
				
				var t = n.getOwnerTree();
				var cols = t.columns;
				var bw = t.borderWidth;
				var c = cols[0];
				
				
				var cb = typeof a.checked == 'boolean';
				
				var href = a.href ? a.href : Ext.isGecko ? "" : "#";
				var linksBuf = "";
				for (var i = 0; i < n.links.length; i++) {
						linksBuf += "<a title=\"" + n.links[i].title + "\" href=\"#\" onclick=\"" + n.links[i].jscript + "\"><img  src='" + this.emptyIcon + "' class='x-tree-node-icon x-tree-node-inline-icon anno-view " + n.links[i].iconCls + "' /></a><span class='left-spacer4' />";
				}
				
				// Hack to bypass the default tree node model's interception of child node clicks.
				var txt = n.text.replace(/<A /g,'<A onclick="window.open(this.href);" ');
				
				var buf = ['<li class="x-tree-node"><div ext:tree-node-id="', n.id, 
				'" class="x-tree-node-el x-tree-node-leaf ', a.cls, '" >',
				 '<div class="x-tree-col" style="width:', c.width-bw,'px;">',
				 '<span style="padding-left:', (n.getDepth()-1)*16,'" class="x-tree-node-indent"></span>', 
				 '<img src="', this.emptyIcon, '" class="x-tree-ec-icon x-tree-elbow" />', 
				 '<img src="', a.icon || this.emptyIcon, '" class="x-tree-node-icon', (a.icon ? " x-tree-node-inline-icon" : ""), (a.iconCls ? " " + a.iconCls : ""), 
				 '" />', 
				 '<div style="display:inline-block;width:', c.width-bw-(32 + n.getDepth() * 16),'"><div class="x-tree-col-div-general">',  n.title, '</div>','<div class="x-tree-node-bheader x-tree-col-div-general">', (n.bheader ?  n.bheader:''),'</div>',
				'<div class="x-tree-col-text x-tree-col-div-general">',txt, '</div>', (n.bfooter ? '<div class="x-tree-node-bfooter x-tree-col-div-general">' + n.bfooter + '</div>': '<span></span>'), '</div></div>'];
				
				 for(var i = 1, len = cols.length; i < len; i++){
             		c = cols[i];

            		 buf.push('<div class="x-tree-col ',(c.cls?c.cls:''),'" style="width:',c.width-bw- t.scrollOffset,'px;">',
                       // '<div class="x-tree-col-text">','blah'(c.renderer ? c.renderer(a[c.dataIndex], n, a) : a[c.dataIndex]),"</div>",
					    ( (n.columns && n.columns[i]) ? '<div class="x-tree-col-text">' + n.columns.text + '</div>':''), 
					    (c.links ? '<div class="x-tree-col-text">' + linksBuf + "</div>":''),"</div>");
         		}
				  buf.push(
            	'<div class="x-clear"></div></div>',
            	'<ul class="x-tree-node-ct" style="display:none;"></ul>',
            	"</li>");
			
				var nel;
				 if(bulkRender !== true && n.nextSibling && n.nextSibling.ui.getEl()){
           			 this.wrap = Ext.DomHelper.insertHtml("beforeBegin",
                                n.nextSibling.ui.getEl(), buf.join(''));
        		}else{
          			  this.wrap = Ext.DomHelper.insertHtml("beforeEnd", targetNode, buf.join(""));
       			 }
				
				this.elNode = this.wrap.childNodes[0];
				this.ctNode = this.wrap.childNodes[1];
				this.columnNodes = this.elNode.childNodes;
				var cs = this.elNode.firstChild.childNodes;
				this.indentNode = cs[0];
				this.ecNode = cs[1];
				this.iconNode = cs[2];
				this.bodyNode = cs[3];
				this.titleNode = cs[3].firstChild;
				this.bHeaderNode = this.titleNode.nextSibling;
				this.anchor = this.textNode = this.bHeaderNode.nextSibling;
				this.bFooterNode = this.textNode.nextSibling;
				
			}
		});
		

Ext.reg('loretreepanel', lore.anno.ui.LOREColumnTree);

/*	 Timeline UI Definitions */

/**  Replaces default function for generating contents of timeline bubbles
	 * @param {Object} elmt  dom node that the timeline bubble will be inserted into
	 * @param {Object} theme See timeline documentation
	 * @param {Object} labeller See timeline documentation
	 */
if (typeof Timeline !== "undefined") {
		Timeline.DefaultEventSource.Event.prototype.fillInfoBubble = function(elmt, theme, labeller){
			var doc = elmt.ownerDocument;
			var title = this.getText();
			var link = this.getLink();
			var image = this.getImage();
			
			if (image != null) {
				var img = doc.createElement("img");
				img.src = image;
				
				theme.event.bubble.imageStyler(img);
				elmt.appendChild(img);
			}
			
			var divTitle = doc.createElement("div");
			var textTitle = doc.createTextNode(title);
			if (link != null) {
				var a = doc.createElement("a");
				a.href = link;
				a.appendChild(textTitle);
				divTitle.appendChild(a);
			}
			else {
				divTitle.appendChild(textTitle);
			}
			theme.event.bubble.titleStyler(divTitle);
			elmt.appendChild(divTitle);
			
			var divBody = doc.createElement("div");
			this.fillDescription(divBody);
			theme.event.bubble.bodyStyler(divBody);
			elmt.appendChild(divBody);
			
			var divTime = doc.createElement("div");
			this.fillTime(divTime, labeller);
			divTime.style.fontSize = 'smaller';
			divTime.style.color = '#aaa';
			elmt.appendChild(divTime);
			
			var divOps = doc.createElement("div");
			divOps.style.paddingTop = '5px';
			var divOpsInner = "<a style='color:orange;font-size:smaller' href='#' " +
			"onclick='lore.anno.ui.annotimeline.getBand(0).closeBubble();lore.anno.ui.handleEditAnnotation(\"" +
			this._eventID +
			"\")'>EDIT</a> | " +
			"<a style='color:orange;font-size:smaller' href='#' " +
			"onclick='lore.anno.ui.annotimeline.getBand(0).closeBubble();lore.anno.ui.handleReplyToAnnotation(\"" +
			this._eventID +
			"\")'>REPLY</a>";
			divOps.innerHTML = divOpsInner;
			elmt.appendChild(divOps);
			
			var annoid = this._eventID;
			var node = lore.global.util.findChildRecursively(lore.anno.ui.treeroot, 'id', annoid);
			if ( node) {
				node.select();
			} else {
				lore.debug.anno("Could not select node for :" + annoid, annoid); 
			}
									
		};
};

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
							xtype: "combo",
							id: "typecombo",
							fieldLabel: 'Type',
							name: 'type',
							hiddenName: 'type',
							store: new Ext.data.SimpleStore({
								fields: ['typename', 'qtype'],
								data: [['Comment', "http://www.w3.org/2000/10/annotationType#Comment"], ['Explanation', "http://www.w3.org/2000/10/annotationType#Explanation"],['Question','http://www.w3.org/2000/10/annotationType#Question' ], ['Variation', "http://austlit.edu.au/ontologies/2009/03/lit-annotation-ns#VariationAnnotation"]]
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
							},
							labelStyle: 'font-size:90%;'
						
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
								border: 'none',
								'font-size': '90%'
							},
							labelStyle: 'font-size:90%;'
						}, {
							xtype:"button",
							text: 'Update Selection',
							fieldLabel: '',
							id: 'updctxtbtn',
							tooltip: 'Set the context of the annotation to be the current selection from the main browser window'
						},
						{
							fieldLabel: 'Variant resource',
							name: 'variant',
							id: 'variantfield',
							readOnly: true,
							style: {
								background: 'none',
								border: 'none',
								'font-size': '90%'
							},
							labelStyle: 'font-size:90%'
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
								border: 'none',
								'font-size': '90%'
							},
							labelStyle: 'font-size:90%'
						},{
							xtype:"button",
							text: 'Update Variant Selection',
							fieldLabel: '',
							id: 'updrctxtbtn',
							hidden: true,
							tooltip: 'For Variation Annotations: set the context in the variant resource to be the current selection from the main browser window'
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
							store: new Ext.data.SimpleStore({
								fields: ['id', 'name'],
								data: lore.anno.thesaurus
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
						}],
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
			title: "Tree",
			xtype: "panel",
			id: "treeview",
			layout: "border",
			items: [{
				region: "center",
				layout: "border",
				items: [{
					region: "center",
					xtype: "loretreepanel",
					id: "annosourcestree",
					animate: true,
					autoScroll: true,
					columns: [{
						header: "Annotations",
						
						width: 280
					}, {
						header: "Views",
						width: 80,
						links:true
					}],
					header: true,
					rootVisible: false,
					containerScroll: true,
					split: true,
					border: false,
					pathSeparator: " ",
					root: new Ext.tree.TreeNode({}),
					dropConfig: {
						appendOnly: true
					},
					bbar: { xtype: 'toolbar',
							items: [ 
							{
								xtype: "combo",
								id: "sorttypecombo",
								name: 'sorttypecombo',
								hiddenName: 'sorttypecombo',
								store: new Ext.data.SimpleStore({
									fields: ['type', 'typename', 'direction'],
									data: [['title', 'Title(Ascending)','asc'], ['title','Title(Descending)','desc'],
										   ['creator', 'Creator(Ascending)', 'asc'], ['creator', 'Creator(Descending)', 'desc'],
										   ['created', 'Creation Date(Ascending)','asc'], ['created', 'Creation Date(Descending)', 'desc'],
										   ['modified','Modified Date(Ascending)', 'asc' ],['modified','Modified Date(Descending)', 'desc' ],
										   ['type', 'Type(Ascending)', 'asc'],['type', 'Type(Descending)','desc']]
								}),
								valueField: 'type',
								displayField: 'typename',
								typeAhead: true,
								emptyText: "Sort by...",
								triggerAction: 'all',
								forceSelection: true,
								mode: 'local',
								selectOnFocus: true
							}
						]	
					}
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
			title: "Current Page",
			id: "curpage",
			deferredRender: false,
			activeTab: "treeview",
			items: [loreuiannotreeandeditor(store), loreuiannotimeline(store)]
		};
}

loreuiannosearchform = function (store ) {
	return { 
			xtype: "form",
		
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
				dataIndex: 'title',
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
				enableRowBody: true,
			},
			
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

		var annosourcestreeroot = Ext.getCmp("annosourcestree").getRootNode();
		lore.global.ui.clearTree(annosourcestreeroot);
		lore.anno.ui.treeroot = annosourcestreeroot; 
		lore.anno.ui.treeroot.expand();
		lore.anno.ui.addTreeSorter('created', 'asc');

		
		Ext.getCmp("annosourcestree").on("click", lore.anno.ui.handleAnnotationSelection);
		Ext.getCmp("annosourcestree").on("dblclick", lore.anno.ui.handleEditAnnotation);
			
		Ext.getCmp("sorttypecombo").on("select", lore.anno.ui.handleSortTypeChange);
		
		lore.anno.ui.formpanel = Ext.getCmp("annotationslistform")
		lore.anno.ui.form = lore.anno.ui.formpanel.getForm();
		lore.anno.ui.formpanel.hide();
		lore.anno.ui.sformpanel = Ext.getCmp("annosearchform");
		lore.anno.ui.sform = lore.anno.ui.sformpanel.getForm();
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
		Ext.getCmp("updctxtbtn").on('click',
				lore.anno.ui.handleUpdateAnnotationContext);
		Ext.getCmp("updrctxtbtn").on('click',
				lore.anno.ui.handleUpdateAnnotationVariantContext);
		Ext.getCmp("variantfield").on('specialkey', lore.anno.ui.launchFieldWindow);
		Ext.getCmp("originalfield").on('specialkey', lore.anno.ui.launchFieldWindow);
		Ext.getCmp("typecombo").on('valid', lore.anno.ui.handleAnnotationTypeChange);
		lore.anno.ui.form.findField("body").on("push", function(field, html) {
			// this is hack to stop this field being flagged as dirty because
			// originalValue is XML and the value field is converted to HTML
			field.originalValue = field.getValue();
			
		});
		
		lore.anno.ui.setAnnotationFormUI(false);
		
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

/**
 * Create a Timeline visualisation
 */
lore.anno.ui.initTimeline = function() {
	var tl = Ext.getCmp("annotimeline");
	if (typeof Timeline !== "undefined") {
		lore.anno.ui.annoEventSource = new Timeline.DefaultEventSource();
        var theme = Timeline.ClassicTheme.create();
        theme.event.bubble.width = 350;
		var bandConfig = [Timeline.createBandInfo({
							eventSource : lore.anno.ui.annoEventSource,
                            theme: theme,
							width : "90%",
							intervalUnit : Timeline.DateTime.WEEK,
							intervalPixels : 100,
							timeZone : 10,
                            layout: "original"
						}), Timeline.createBandInfo({
							eventSource : lore.anno.ui.annoEventSource,
                            theme: theme,
                            //showEventText:  false,
							width : "10%",
							intervalUnit : Timeline.DateTime.MONTH,
							intervalPixels : 430,
							timeZone : 10,
                            layout: "overview"
						})];
        
		bandConfig[1].syncWith = 0;
		bandConfig[1].highlight = true;
		lore.anno.ui.annotimeline = Timeline.create(document
						.getElementById("annotimeline"), bandConfig, Timeline.HORIZONTAL);
		tl.on("resize", function() {
			lore.anno.ui.scheduleTimelineLayout();
		});
        lore.anno.ui.annotimeline.getBand(0).getEventPainter().setFilterMatcher(function(evt){
            return !(evt._eventID == "flagdelete");
        });
	} else {
        lore.debug.anno("Timeline is undefined",this);
    }
}

/**
 * Disable or enable the annotations view
 * @param {Object} opts Object containing disable/enable options. Valid fields includes opts.disable_annotations
 */	
lore.anno.ui.disableUIFeatures = function(opts) {
    lore.debug.ui("LORE Annotations: disable ui features?", opts);
    lore.anno.ui.disabled = opts;

	// don't set visibility on start up 
	if (!lore.anno.ui.disableUIFeatures.initialCall) {
		lore.anno.ui.disableUIFeatures.initialCall = 1;
	}
	else {
	
		if (opts.disable_annotations) {
			lore.anno.ui.topView.setAnnotationsVisibility(false);
		}
		else {
			lore.anno.ui.topView.setAnnotationsVisibility(true);
		}
	}
}
