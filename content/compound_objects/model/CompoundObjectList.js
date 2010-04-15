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
lore.ore.model = lore.ore.model || {};
/** 
 * Represents a list of compound object summaries 
 * @class lore.ore.model.CompoundObjectList
 **/
// TODO: extend Ext.data.ArrayStore?
lore.ore.model.CompoundObjectList = Ext.extend(Ext.util.Observable, {
    /** @constructor */
    constructor: function (config){
        /** 
         * The name of this list
         * @property
         * @type string
         */
       this.name = config.name;
       this.compoundObjects = [];
       this.addEvents(
	       /** @event add
	        * Fires when compound objects are added to this list
	        * @param {Array} coSummaries Array of {@link lore.ore.model.CompoundObjectSummary} objects that were added
	        */
            'add', 
            /** @event remove
             * Fires when a compound object is removed from this list
             * @param {String} uri The URI of the removed compound object
             */
            'remove',
            /** @event clear
             * Fires when this list is cleared (all compound objects removed)
             */
            'clear');
       lore.ore.model.CompoundObjectList.superclass.constructor.call(config);
    },
    /**
     * Clear all compound objects from the list
     */
    clearList: function() {
        this.compoundObjects = [];
        this.fireEvent('clear');
    },
    /** 
     * Remove a single compound object from the list
     * @param {string} uri The URI of the compound object to be removed
     */
    remove: function(uri){
        for (var i = 0; i < this.compoundObjects.length; i++){
            var co = this.compoundObjects[i];
            if (co.getUri() == uri){
                this.compoundObjects = this.compoundObjects.splice(i,1);
                break;
            }
        }
        this.fireEvent('remove',uri);
    },
    /** Add a batch of compound objects to the list
     * @param {Array} coSummaries An Array of {@link lore.ore.ui.graph.CompoundObjectSummary} objects
     */
    add: function(coSummaries){
        if (this.compoundObjects.length == 0){
            this.compoundObjects = coSummaries;
        }
        else {
           this.compoundObjects = this.compoundObjects.concat(coSummaries);
        }
        this.fireEvent('add',coSummaries); 
    },
    /**
     * Get the contents of the list
     * @return {Array} An Array of {@link lore.ore.model.CompoundObjectSummary} objects 
     */
    getCompoundObjectsList: function(){
        return this.compoundObjects;
    }
});
