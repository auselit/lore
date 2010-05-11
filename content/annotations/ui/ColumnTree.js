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
 
 

/*  Tree UI Class Definitions */
  
/**
 * ColumnTree 
 * Extends a regular Ext Tree Panel adding columns and segregated
 * header, body and footer text fields for each tree node
 * @class lore.anno.ui.ColumnTree
 * @extends Ext.tree.TreePanel
 * @xtype columntreepanel
 */
lore.anno.ui.ColumnTree = Ext.extend(Ext.tree.TreePanel, {
    lines : false,
    borderWidth : Ext.isBorderBox ? 0 : 2, // the combined left/right border for each cell
    cls : 'x-column-tree',
	expandBefore: true,
	scrollOffset: 19,
	
	initComponent: function(){
		try {
			Ext.apply(this, {
				root: new Ext.tree.TreeNode({
					'draggable': false
				}),
				header: true,
			 	rootVisible: false,
					columns: this.columns ? this.columns:[ {'header': "Default",
				'width': 280
				}]
			});
			lore.anno.ui.ColumnTree.superclass.initComponent.apply(this, arguments);
		} catch(e){
			lore.debug.anno("ColumnTree:initComponent() - " + e, e);
		}
	},
	/**
	 * When the the tree panel is rendered turn the header component a set of
	 * divs for columns 
	 */
    onRender : function(){
	
        lore.anno.ui.ColumnTree.superclass.onRender.apply(this, arguments);
			
		this.headers = this.header.createChild({cls:'x-tree-headers'});
		
        var cols = this.columns, c;
		var totalWidth = 0;
        
        
		// generate the column headers
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
		// set the widths 
        this.headers.createChild({cls:'x-clear'});
		this.headers.setWidth(totalWidth+ this.borderWidth);
        this.innerCt.setWidth(totalWidth);
		this.headers.totalWidth = totalWidth;
    },
	/**
	 * Refresh the tree node ui objects when the tree is resized
	 * @param {Object} cmp
	 * @param {Object} bWidth
	 * @param {Object} bHeight
	 * @param {Object} width
	 * @param {Object} height
	 */
	onResize : function(cmp, bWidth, bHeight, width, height) {
		var newwidth = this.getWidth();
		lore.anno.ui.ColumnTree.superclass.onResize.apply(this, arguments);

		var cols = this.columns;
		var index = this.expandBefore ? 0: cols.length-1;
		var c = cols[index];
		
		// recalculate column widths
		var totalWidth = this.headers.totalWidth ;
		c.width = c.width + ( newwidth - totalWidth);
		this.headers.dom.childNodes[index].style.width = c.width;
		this.headers.totalWidth = totalWidth = newwidth;
	
		this.headers.setWidth(totalWidth + this.borderWidth);
		this.innerCt.setWidth(totalWidth);
		
		// refresh all the nodes that are expanded
		// could optimize this by checking whether the node is actually
		// visible to the user 
		try {		
				var f = function (node) {
					if (node.isExpanded()) {
						var n = node.childNodes;
						for (var i = 0; i < n.length; i++) {
							if ( n[i].ui.refresh)
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
lore.anno.ui.ColumnTreeNode = function(attributes){

	this.title = attributes.title || '';
	this.bheader = attributes.bheader || '';
	this.bfooter = attributes.bfooter || '';
	this.links = attributes.links || [];
	this.nodeType = attributes.nodeType;
	
	lore.anno.ui.ColumnTreeNode.superclass.constructor.call(this, attributes);
}
    
/**
 * ColumnTreeNode extends regular treenode and provides
 * separate fields for title, header, body, and footer information per node
 * @class lore.anno.ui.ColumnTreeNode
 * @extends Ext.tree.TreeNode
 */
Ext.extend(lore.anno.ui.ColumnTreeNode, Ext.tree.TreeNode, {
	
	/**
	 * Set the text fields for the tree node
	 * @param {String} _title The title field
	 * @param {String} bh header before body
	 * @param {String} bf footer after body
	 * @param {String} _text body text
	 */
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
 * @class lore.anno.ui.ColumnTreeNodeUI
 * @extends Ext.tree.TreeNodeUI
 */
lore.anno.ui.ColumnTreeNodeUI = Ext.extend(Ext.tree.TreeNodeUI, {
	// private
	
	focus : Ext.emptyFn,
	
	/**
	 * When text on the nodel changes update the HTML 
	 * @param {Object} txtfield
	 */
	onTextChange : function( txtfield) {
		 if(this.rendered){
   			 this.textNode.innerHTML = txtfield.text;
			 
			 this.titleNode.innerHTML = txtfield.title;
			 if ( txtfield.bheader) this.bHeaderNode.innerHTML = txtfield.bheader;
			 if ( txtfield.bfooter) this.bFooterNode.innerHTML = txtfield.bfooter;
			 }
	},
	
	/**
	 * Refresh the node, by recalculating column divs
	 * @param {Object} n
	 */
	refresh : function (n) {
		if (this.rendered) {
			var t = n.getOwnerTree();
			var cols = t.columns;
			for (var i = 0; i < cols.length; i++) {
				this.columnNodes[i].style.width = cols[i].width - t.borderWidth - (i == (cols.length - 1) ? t.scrollOffset : 0);
			}
			this.bodyNode.style.width = cols[0].width - t.borderWidth - (32 + n.getDepth() * 16);
		}
	},
	/**
	 * Generate the HTML for the tree ndoe
	 * @param {TreeNode} n The tree Node
	 * @param {String} a link for the tree node
	 * @param {Object} targetNode target node
	 * @param {Object} bulkRender
	 */
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
		'" class="x-tree-node-el x-tree-node-leaf x-unselectable ', a.cls,'" unselectable="on">',
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
		


/**
 * Extends ColumnTree by providing default values for ColumnTree nodes
 * add sorting capabilites
 * @class lore.anno.ui.AnnoColumnTree
 * @extends lore.anno.ui.ColumnTree
 */
lore.anno.ui.AnnoColumnTree = Ext.extend(lore.anno.ui.ColumnTree, {
		
		initComponent: function(){
      	  	try {
				
				var cmbname = this.genID("sorttypecombo");
				
				this.sorttypecombo = new Ext.form.ComboBox({
					xtype: "combo",
					editable: false,
					store: new Ext.data.SimpleStore({
						fields: ['type', 'typename', 'direction'],
						data: [['title', 'Title(Ascending)','asc'], ['title','Title(Descending)','desc'],
							   ['creator', 'Creator(Ascending)', 'asc'], ['creator', 'Creator(Descending)', 'desc'],
							   ['created', 'Creation Date(Ascending)','asc'], ['created', 'Creation Date(Descending)', 'desc'],
							   ['modified','Modified Date(Ascending)', 'asc' ],['modified','Modified Date(Descending)', 'desc' ],
							   ['type', 'Type(Ascending)', 'asc'],['type', 'Type(Descending)','desc']]
					}),
					valueField: 'typename',
					displayField: 'typename',
					//emptyText: "Sort by...",
					emptyText: 'A-Z',
					triggerAction: 'all',
					mode: 'local',
					forceSelection: true
				});
					
					
				Ext.apply(this, {
					animate    	: false,
		          	autoScroll	: true,
					rootVisible: false,
					containerScroll: true,
					split: true,
					border: false,
					pathSeparator: " ",
					root: new Ext.tree.TreeNode({
						'draggable': false
					}),
					columns		: [{
								'header': "Annotations",
								'width': 260
								}, {
								'header': "Views",
								'width': 80,
								'links':true
								}],
								
					header: true,
					dropConfig: {
						appendOnly: true
					},
					bbar: {
						xtype: 'toolbar', 
						items: [ this.sorttypecombo	]
					}
				});
				
				lore.anno.ui.AnnoColumnTree.superclass.initComponent.apply(this, arguments);
				
				this.addEvents("sortchange");
				this.addTreeSorter('created', 'asc');
				this.sorttypecombo.on("select", this.handleSortTypeChange, this);
				
				
			} catch(e){
				lore.debug.anno("AnnoColumnTree:initComponent() - " + e, e);
			}
		},
		/**
		 * Handler for sorting combo, set sorting field and direction
		 * based off the combo selection
		 * @param {Object} combo
		 * @param {Object} rec
		 * @param {Object} index
		 */
		handleSortTypeChange : function (combo, rec, index) {
			try {
				this.treesorter = {
					sortField : rec.data.type,
					direction  : rec.data.direction
				}
				
				this.fireEvent("sortchange", this, this.getRootNode().firstChild);
			} catch (e ) {
				lore.debug.anno("Error occurred changing sort type: " + e,e);
			}
			
		},
		
		refresh : function () {
			
		},
	
	/**
	 * Add sorting event handlers
	 * @param {Object} field Field to sort on
	 * @param {String} direction The direction, 'asc' or 'desc'
	 */	
   	addTreeSorter: function(field, direction){
			
		  var ts = this.treesorter = {
				sortField: field,
				direction: direction
			}
			
			var tree = this;
			
			// taken from TreeSorter in Ext, and modified so that
			// direction can be dynamically changed
			var sortType =  function(node){
				try {
					var r = lore.global.util.findRecordById(tree.model, lore.anno.ui.nodeIdToRecId(node));
					if (r) {
						return r.data[ts.sortField] || r.data.created;
					}
				} catch (e) {
					lore.debug.anno(e, e);
				}
				return "";
			}
			
			// compare two nodes and return positive depending on node1's value compared to node2's
			var sortFn = function(n1, n2){

				try {
					if (n1.attributes["leaf"] && !n2.attributes["leaf"]) {
						return 1;
					}
					if (!n1.attributes["leaf"] && n2.attributes["leaf"]) {
						return -1;
					}
					
					var v1 = sortType(n1).toUpperCase();
					var v2 = sortType(n2).toUpperCase();
					var dsc = ts.direction == 'desc';
					
					if (v1 < v2) {
						return dsc ? +1 : -1;
					}
					else 
						if (v1 > v2) {
							return dsc ? -1 : +1;
						}
						else {
							return 0;
						}
				} catch (e ) {
					lore.debug.anno("sortFn: " + e, e);
				}
			 };
			 
			// perform sort on node
			var doSort = function(node){
			   ts = this.treesorter;
			   node.sort(sortFn);
    		}
			
			// compare node text
			//var compareNodes = function(n1, n2){
        	//	return (n1.text.toUpperCase() > n2.text.toUpperCase() ? 1 : -1);
    		//}
    
    		var updateSort  = function(tree, node){
        		if(node.childrenRendered){
            		doSort.defer(1, this, [node]);
        		}
    		}
			this.on("beforechildrenrendered", doSort, this);
   			this.on("append", updateSort, this);
    		this.on("insert", updateSort, this);
			this.on("sortchange", updateSort, this);
    		
	},
	/**
	 * Generated ID for a sub-component of this component
	 * @param id Id of sub-component
	 */
	genID: function(id) {
		return this.id + "_" + id;	
	},
	
	/**
	 * Retrieve a sub-componetn within this componet
	 * @param id Id of sub-component
	 */
	getComponent: function (id ) {
		return Ext.getCmp(this.genID(id));
	}});
		
		
	
		
		

				
lore.anno.ui.AnnoPageTreeNode = Ext.extend( Ext.tree.TreeNode, 
{
	constructor: function(config ){
		  this.config = config || {};
        /** 
         * @cfg {lore.ore.model.CompoundObjectSummary} The compound object represented by this tree node 
         * @property 
         * */
        this.model = config.model;
        this.initConfig(this.model);
        
		this.model.on("load", this.handleLoad, this);
		this.model.on("remove", this.handleRemove, this);
		this.model.on("update", this.handleUpdate, this);
		this.model.on("clear", this.handleClear, this);
		
        lore.anno.ui.AnnoPageTreeNode.superclass.constructor.call(this, this.config); 
	},
	
	initConfig: function(model) {
		Ext.apply(this, {});
	},
	
	/**
	 * Notification function called when a load operation occurs in the store.
	 * This is called when annotations are loaded in bulk from the server or when
	 * an individual annotation was added by a user.  Adds one or more nodes to the
	 * tree
	 * @param {Store} store The data store that created the notification
	 * @param {Array} records The list of records that have been added to the store
	 * @param {Object} options Not used
	 */
	handleLoad : function(store, records, options ) {
		
		try {
			
				for (var i = 0; i < records.length; i++) {
					var rec = records[i];
				 	var anno = rec.data;
					
					try {
						var n = new lore.anno.ui.AnnoColumnTreeNode({
							anno: anno
						})
						
						var parent = null;
						if (  anno.isReply) 
							parent = lore.anno.ui.findNode(anno.about, this);				
						else 
							parent = this;
						
						parent.appendChild(n);
				
					} 
					catch (e) {
						lore.debug.anno("error loading: " + rec.id, e);
					}
				}
			
				if (!this.isExpanded())
					this.expand();
			} 
			catch (e) {
				lore.debug.ui("Error loading annotation tree view: " + e, e);
			}
		
		
	},
	
		/**
		 * Notification function  called when a remove operation occurs in the store.
		 * Removes a node from the tree and the timeline.
		 * @param {Store} store The data store that performed the notification
		 * @param {Record} rec  The record for the annotation that has been removed
		 * @param {Integer} index Not used
		 */	
	handleRemove: function(store, rec, ind ) {
	try {
			var node = lore.anno.ui.findNode(rec.data.id, this);
			if (node) {
				node.remove();
			}
		} 
		catch (e) {
			lore.debug.ui("AnnoPageTreeNode:handleRemove() Error removing node : " + e, e);
		}
	},

	/**
	 * Notification function called when an update operation occurs in the store
	 * Update the values of a node in tree
	 * @param {Object} store The datastore that perofmred the notification
	 * @param {Object} rec The record of the annotation that has changed
	 * @param {Object} operation The update operation that occurred to the record
	 */			
	handleUpdate: function(store, rec, operation) {
		try {
			var node = lore.anno.ui.findNode(rec.data.id, this);
			
			if (!node) {
				return;
			}

			var info = ' ';
			info = lore.anno.ui.genAnnotationCaption(rec.data, 'by c, d r')
			node.setText(rec.data.title, info,' ', lore.anno.ui.genTreeNodeText(rec.data));

		} 
		catch (e) {
			lore.debug.ui("Error updating annotation tree view: " + e, e);
		}
	},
	
	/**
	 * Notification function called when a clear operation occurs in the store.
	 * Clears the tree.
	 * @param {Store} store The data store that performed the notification
	 */
	handleClear: function(store ){
		this.removeAll();
	},
	
	refresh : function () {
		this.handleClear();
		this.handleUpdate(this.model, this.model.getRange());
	}
	
});


 

lore.anno.ui.AnnoModifiedPageTreeNode = Ext.extend( Ext.tree.TreeNode, {

	constructor: function(config ){
		  this.config = config || {};
        /** 
         * @cfg {lore.ore.model.CompoundObjectSummary} The compound object represented by this tree node 
         * @property 
         * */
        this.model = config.model;
        this.initConfig(this.model);
        
		this.model.on("load", this.handleLoad, this);
		this.model.on("remove", this.handleRemove, this);
		this.model.on("update", this.handleUpdate, this);
		this.model.on("clear", this.handleClear, this);
		
        lore.anno.ui.AnnoModifiedPageTreeNode.superclass.constructor.call(this, this.config); 
	},
	
	initConfig: function(model) {
		Ext.apply(this, { postfix: this.config.postfix ? this.config.postfix: ''});
	},
	
	handleLoad: function(store, records, options ) {
		try {
			// add
			if (records.length == 1) {
				//lore.debug.anno("AnnoModifiedPageTreeNode:handleLoad() " + records.length + " records.", records);
				var rec = records[0];
				
				var n = new lore.anno.ui.AnnoColumnTreeNode({
					anno: rec.data,
					postfix: this.postfix
				})
				this.appendChild(n);
				
			}
		}catch (e) {
			lore.debug.anno("handleLoad: " +e, e);
		}
	},
	
	handleRemove : function(store, rec, index) {
			try {
				var node = lore.anno.ui.findNode(rec.data.id + this.postfix, this);
				if (node) {
					node.remove();
				} else {
					lore.debug.anno("node not found to remove: " + rec.data.id, this);
				}
			} 
			catch (e) {
				lore.debug.ui("Error removing annotation from tree view: " + e, e);
			}
		},
		
		
	handleUpdate : function(store, rec, operation){
			
			try {
				var node = lore.anno.ui.findNode(rec.data.id + this.postfix, this);
				
				if (!node) {
					return;
				}
				var info = ' ';
				
			 
				if (rec.data.resource != lore.anno.ui.currentURL) {
					info = "Unsaved annotation from " + rec.data.resource + " ";
				}
				
				if (!rec.data.isNew()) {
					info = info + lore.anno.ui.genAnnotationCaption(rec.data, 'by c, d r')
				}
				
				node.setText(rec.data.title, info,' ', lore.anno.ui.genTreeNodeText(rec.data));
				
			} 
			catch (e) {
				lore.debug.ui("Error updating annotation tree view: " + e, e);
			}
		},
		
	/**
	 * Notification function called when a clear operation occurs in the store.
	 * Clears the tree.
	 * @param {Store} store The data store that performed the notification
	 */
	handleClear: function(store){
		this.removeAll();
	}
});
 
				
					
/** Tree node for representing Compound objects 
 * @class lore.ore.ui.AnnoColumnTreeNode
 * @extends Ext.tree.TreeNode */
lore.anno.ui.AnnoColumnTreeNode = Ext.extend(lore.anno.ui.ColumnTreeNode,{
  
  
   constructor: function(config){
        this.config = config || {};
        /** 
         * @cfg {lore.ore.model.CompoundObjectSummary} The compound object represented by this tree node 
         * @property 
         * */
      
        this.initConfig();
        lore.anno.ui.AnnoColumnTreeNode.superclass.constructor.call(this, this.config); 
   },
   
    /**
    * Set the intial config values for text, uri etc from the model object
    * @param {lore.ore.model.CompoundObjectSummary} coSummary Model object for this tree node
    */
   initConfig: function(){
		try {
			var anno = this.config.anno;
			var iCls = lore.anno.ui.getAnnoTypeIcon(anno);
			
			Ext.apply(this.config, {
				id: anno.id + ( this.config.postfix ? this.config.postfix:''),
				iconCls: iCls,
				title: lore.anno.ui.getAnnoTitle(anno),
				uiProvider: lore.anno.ui.ColumnTreeNodeUI,
				nodeType: anno.type				
			});
			
			
			if (anno.isNew()) {
				Ext.apply(this.config, {
					text: anno.body || ''
				});
			}
			else {
				Ext.apply(this.config, {
					text: lore.anno.ui.genTreeNodeText(anno),
					bheader: lore.anno.ui.genAnnotationCaption(anno, 'by c, d r'),
					links: this.config.links,
				});
			}
		} catch (e ) {
			lore.debug.anno("AnnoColumnTreeNode:initConfig() " + e, e);
		}
  },
  /**
	* Generated ID for a sub-component of this component
	* @param id Id of sub-component
	*/
  genID: function(id ) {
  	return	this.id + "_" + id;
  },
  
  /**
   * Retrieve sub-component of this component
   * @param {Object} id Id of sub-component
   */
  getComponent: function(id) {
  	return Ext.getCmp(this.genID(id));
  }
});
  
					
				 
				
				
// register the components with Ext 
Ext.reg('columntreepanel', lore.anno.ui.ColumnTree);
Ext.reg('annocolumntreepanel', lore.anno.ui.AnnoColumnTree);
Ext.reg('annopagetreenode', lore.anno.ui.AnnoPageTreeNode);
Ext.reg('annomodpagetreenode', lore.anno.ui.AnnoPageTreeNode);

