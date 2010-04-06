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
/**
 * Displays a list of Compound Objects
 * @class lore.ore.ui.CompoundObjectTree
 * @extends Ext.tree.TreePanel
 * @xtype cotree
 **/
lore.ore.ui.CompoundObjectTree = Ext.extend(Ext.tree.TreePanel, {
    animate         : false,
    autoScroll      : true,
    fitToFrame      : true,
    rootVisible     : false,
    containerScroll : true,
    border          : false,
    enableDrag      : true,
    enableDrop      : false,
    ddGroup         : "TreeDD",
    initComponent: function(){
        Ext.apply(this, {
            root: new Ext.tree.TreeNode({'draggable':false})
        });
        lore.ore.ui.CompoundObjectTree.superclass.initComponent.apply(this, arguments);
    },
    /** 
     * Override the onInvalidDrop function on the dragZone  so that dragged element is 
     * hidden when nodes are dropped back onto the tree
     */
    initEvents: function(){
        lore.ore.ui.CompoundObjectTree.superclass.initEvents.call(this);
        Ext.apply(this.dragZone,{
            onInvalidDrop: function(){
                this.hideProxy();
            }
        });
    }
    
});
Ext.reg('cotree',lore.ore.ui.CompoundObjectTree);
