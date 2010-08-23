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
Ext.namespace("lore.ore.model");
/**
 * @class lore.ore.model.ResourceProperties Manage multi-valued properties for Resources
 */
lore.ore.model.ResourceProperties = function (){
    this.data = {};
};

Ext.apply(lore.ore.model.ResourceProperties.prototype, {
    /** setProperty Set a property or add if it does not exist
     * @param {Object} config The data for the property
     * @cfg id The URI of the property
       @cfg ns The namespace part of the property URI
       @cfg name The name of the property (usually the term part of the property)
       @cfg value The value of the property
       @cfg prefix The namespace prefix eg dc
       @cfg valueType The datatype of the value
       @param {int} index Optional index of existing property to update
     */
    setProperty: function(config, index){
        var propValArray = this.data[config.id];
        if (!propValArray){
            propValArray = [config];
            this.data[config.id] = propValArray;
        } else {
            if (index && index < propValArray.length){
                // update existing property at index
                propValArray[index] = config;
            } else {
                // add new property
                propValArray.push(config);
            }
        }
    },
    /** Remove a property with a given index (if no index is supplied, 0 is assumed)
     * 
     * @param {String} property URI of property to remove
     * @param {int} index Index to remove, defaults to 0
     * @return {}
     */
    removeProperty : function(property, index){
      index = index || 0;
      var propValues = this.data[property];
      if (propValues && propValues.length > index){
        propValues.splice(index,1);
        // remove from data if there are no other values for this property
        if (propValues.length == 0) {
            delete propValues;
        }
      }
      return this.data;
    },
    /** Get property with given index 
     * @param {String} property URI of the property
     * @param {int} index Index of the property (defaults to 0
     * @return {Object}
     */
    getProperty : function(property, index) {
        index = index || 0;
        var propValues = this.data[property];
        if (propValues && propValues.length > index){
            return propValues[index];
        } else {
            return false;
        }
    },
     /**
     * Convenience function to get the title of this resource 
     * @return {String} The primary title, or undefined if there is no primary title
     */
    getTitle : function(){
        var t = this.data[lore.constants.NAMESPACES["dc"] + "title"] || this.data[lore.constants.NAMESPACES["dcterms"] + "title"];
        if (t && t.length > 0) {
            return t[0].value;
        }
    }
});