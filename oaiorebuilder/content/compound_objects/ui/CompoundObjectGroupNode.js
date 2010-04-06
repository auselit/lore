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
/** Tree node for grouping compound objects eg browse results, history, search 
 * @class lore.ore.ui.CompoundObjectGroupNode
 * @extends Ext.tree.TreeNode */
lore.ore.ui.CompoundObjectGroupNode = Ext.extend(Ext.tree.TreeNode,{
    constructor: function(config){
        this.reverse = config.reverse || false;
        config.iconCls = "tree-ore";
        config.draggable = false;
        config.uiProvider = Ext.ux.tree.MultilineTreeNodeUI;
        lore.ore.ui.CompoundObjectGroupNode.superclass.constructor.call(this, config); 
    },
    /** Update the details displayed under the node text 
    * @param {Array} details Strings to be displayed */
    setDetails : function(details){
        var oldDetails = this.attributes.details;
        this.attributes.details = details;
        if(this.rendered){ 
            this.ui.onDetailsChange(this, details, oldDetails);
        }
        this.fireEvent('detailschange', this, details, oldDetails);
    },
     /**
     * Constructs an id for a child TreeNode 
     * @param {String} uri The URI of the compound object
     * @return {String} identifier for TreeNode
     * */
    generateNodeId: function(uri){
        return this.id + "_" + uri;  
    },
     /**
     * Set up reference to model object and listeners 
     * @param {lore.ore.model.CompoundObjectList} coList The model object representing the list
     **/
    addModel: function(coList){
        if (!this.model){
            this.model = coList;
            this.model.on("add", this.addCompoundObjects, this);
            this.model.on("clear",this.clearChildren,this);
            this.model.on("remove", this.removeCompoundObject, this);
            // load contents from model
            var initialContents = this.model.getCompoundObjectsList();
            if (initialContents){
                this.addCompoundObjects(initialContents);
            }
        }
    },
    /**
     * Clear nodes all children from a tree node
     */
    clearChildren: function (){
        while (this.firstChild) {
            this.removeChild(this.firstChild,true);
        }    
    },
    /** 
     * Respond to add event from the model 
     * @param {lore.ore.model.CompoundObjectSummary} coSummary Details of added compound objects
     **/
    addCompoundObjects : function(coList){
        try{
        //lore.debug.ore("addCompoundObjects " + coList.length,coList);
        if (coList){
            for (var i=0; i<coList.length;i++){   
                var remuri = coList[i].getUri();
                // if node already exists remove it
                this.removeCompoundObject(remuri); 
                var newNode = new lore.ore.ui.CompoundObjectTreeNode(
                    {
                        'id': this.generateNodeId(remuri),
                        'model':coList[i]
                    }
                );
                
                if (this.reverse && this.firstChild){
                        this.insertBefore(newNode, this.firstChild);
                } else {
                    this.appendChild(newNode);  
                    
                }
                this.attachRemActions(newNode); 
            }
            // only expand if this node has been added to a tree
            if (this.getOwnerTree()) {this.expand();}
        }
        } catch (e){
            lore.debug.ore("CompoundObjectTree.addCompoundObject:",e);
        }
    },
    /** 
     * Respond to remove event from the model 
     * @param {String} uri The identifier for the compound object that was removed
     **/
    removeCompoundObject: function (uri){
        var existingNode = this.findChild('id',this.generateNodeId(uri));
        if (existingNode){
            existingNode.remove(true);
        } 
    },
        
    /** 
     * Set up actions such as opening upon double click and context menu options
     * @param {Ext.tree.TreeNode} node The node to which to attach actions
     **/
    attachRemActions: function (node){
        // TODO: should this go in TreeNode?
        node.on('dblclick', function(node) {
            lore.ore.readRDF(node.attributes.uri);
        });
        node.on('contextmenu', function(node, e) {
            node.select();
            if (!node.contextmenu) {
                node.contextmenu = new Ext.menu.Menu({
                    id : node.attributes.uri + "-context-menu"
                });
                node.contextmenu.add({
                    text : "Edit compound object",
                    handler : function(evt) {
                        lore.ore.readRDF(node.attributes.uri);
                    }
                });
                node.contextmenu.add({
                    text : "Delete compound object",
                    handler : function(evt) {
                        lore.ore.deleteFromRepository(node.attributes.uri,node.text);
                    }
                });
                node.contextmenu.add({
                    text : "Add as node in compound object editor",
                    handler : function(evt) {
                        lore.ore.ui.graph.addFigure(node.attributes.uri,{
                            "rdf:type_0": lore.constants.RESOURCE_MAP,
                            "dc:title_0": node.text});
                    }
                });
            }
            node.contextmenu.showAt(e.xy);
        });
    }
});
