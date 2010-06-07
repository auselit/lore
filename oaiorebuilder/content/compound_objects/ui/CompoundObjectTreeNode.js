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
/** Tree node for representing Compound objects 
 * @class lore.ore.ui.CompoundObjectTreeNode
 * @extends Ext.tree.TreeNode */
lore.ore.ui.CompoundObjectTreeNode = Ext.extend(Ext.tree.TreeNode,{
   constructor: function(config){
        this.config = config || {};
        /** 
         * @cfg {lore.ore.model.CompoundObjectSummary} model The compound object represented by this tree node 
         * @property 
         * */
        this.model = config.model;
        this.initConfig(this.model);
        // listen for model property changes
        this.model.on("propertiesChanged", this.handleModelPropertiesChanged, this);
        this.addEvents('detailschange');
        lore.ore.ui.CompoundObjectTreeNode.superclass.constructor.call(this, this.config); 
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
    * Set the intial config values for text, uri etc from the model object
    * @param {lore.ore.model.CompoundObjectSummary} coSummary Model object for this tree node
    */
   initConfig: function(coSummary){
        var coProps = coSummary.getProperties();
        var iconCls = 'ro-oreresult';
        if (lore.ore.reposAdapter && coProps.uri.match(lore.ore.reposAdapter.idPrefix)){
            iconCls = 'oreresult';  
        }
        
        Ext.apply(this.config,{
            'iconCls'    : iconCls,
            'leaf'       : true,
            'draggable'  : true,
            'uiProvider' : Ext.ux.tree.MultilineTreeNodeUI,
            'text'       : coProps.title || "Untitled",
            'details'    : this.generateDetails(coProps),
            'uri'        : coProps.uri,
            'qtip'       : "Compound Object: " + coProps.uri
        });
   },
   /**
    * Construct the details to be displayed from model properties
    * @param {Object} coProps The properties from the model object
    * @return {Array} Array of strings to be used for details displayed under node text
    */
   generateDetails: function(coProps){
        var details = [];
                //if (searchval && res && res != -1) {
        // display a snippet to show where search term occurs
        //   var idx = res.toLowerCase().match(searchval.toLowerCase()).index;
        //   var s1 = ((idx - 15) < 0) ? 0 : idx - 15;
        //   var s2 = ((idx + 15) > (res.length))? res.length : idx + 15;
        //   details.push("<i>("+ ((s1 > 0)?"..":"") + res.substring(s1,s2) 
        //    + ((s2 < (res.length))? "..":"")+ ")</i>");
       // }
        if (coProps.match && coProps.match != -1 && coProps.searchval){ // search result
            // display a snippet to show where search term occurs
           var idx = coProps.match.toLowerCase().match(coProps.searchval.toLowerCase()).index;
           var s1 = ((idx - 15) < 0) ? 0 : idx - 15;
           var s2 = ((idx + 15) > (coProps.match.length))? coProps.match.length : idx + 15;
           details.push("<i>("+ ((s1 > 0)?"..":"") + coProps.match.substring(s1,s2) 
            + ((s2 < (coProps.match.length))? "..":"")+ ")</i>");
        }
        if (coProps.accessed) { // history result
            details.push("Last accessed " + coProps.accessed.format("j M Y, g:ia")); 
        }
        if (coProps.creator) { // browse result
            var cDetail = coProps.creator;
            var cMod = coProps.modified;
            if (cMod && Ext.isDate(cMod)){
                cDetail += ", last modified " + cMod.format("j M Y, g:ia");
            } else if (cMod){
                cDetail += ", last modified " + cMod;
            }
            details.push(cDetail);
        }
        return details;
   },
   /** Update the node display if the model properties change
    * @param {Object} oldProps The old properties
    * @param {Object} newProps The new properties
    */
   handleModelPropertiesChanged: function (oldProps, newProps){
    this.setText(newProps.title);
    this.setDetails(this.generateDetails(newProps));
   }
});