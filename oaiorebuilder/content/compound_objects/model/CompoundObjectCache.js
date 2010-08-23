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
 * @class lore.ore.model.CompoundObjectCache manages a cache of Compound Objects that have been loaded in LORE
 */
lore.ore.model.CompoundObjectCache = function() {
    this.cache = {};
    this.timestamps = {};
    this.loadedCompoundObject = "";
    this.loadedIsNew = true;
    /** Maximum level of nesting that the cache fetches automatically */
    this.MAX_NESTING = 2
}
Ext.apply(lore.ore.model.CompoundObjectCache.prototype, {
    /**
     * Add a compound object to the cache
     * @param {String} aUri The URI of the Compound Object
     * @param {lore.ore.model.CompoundObject} co The Compound Object model object
     */
    add: function(aUri,co) {
        this.cache[aUri] = co;
        this.timestamps[aUri] = new Date();
    },
    /**
     * Remove a compound object from the cache
     * @param {} aURI The URI identifying the Compound Object to be removed
     */
    remove: function(aURI) {
        delete this.cache[aURI];
        delete this.timestamps[aURI];
    },
    /** Empty the entire cache */
    clear: function() {
        delete this.cache;
        this.cache = {};
        delete this.timestamps;
        this.timestamps = {};
    },
    /** Indicate whether the currently loaded CO is newly created
     * @param {} boolean
     */
    setLoadedCompoundObjectIsNew: function(boolean) {
        this.loadedIsNew = boolean;  
    },
    /** Returns true if the loaded Compound Object has been flagged as newly created 
     * @return {boolean}
     */
    getLoadedCompoundObjectIsNew: function(){
        return this.loadedIsNew;
    },
    /** Set the currently loaded URI 
     * @param {} aURI
     */
    setLoadedCompoundObjectUri: function(aURI) {
        this.loadedCompoundObject = aURI;
    },
    /** Get the URI of the currently loaded Compound Object
     * @return {String} 
     */
    getLoadedCompoundObjectUri: function() {
      return this.loadedCompoundObject;  
    },
    /** Get the currently loaded Compound Object
     * @return {lore.ore.model.CompoundObject}
     */
    getLoadedCompoundObject: function() {
        return this.getCompoundObject(this.loadedCompoundObject);
    },
    /** Get the Compound Object that was cached, by URI
     * @param {} aURI
     * @return {}
     */
    getCompoundObject: function(aURI) {
            // TODO: check timestamp and expire if too old
            return this.cache[aURI];
    },
    /** Cache nested compound objects 
     * @param {} coContents
     * @param {} nestingLevel
     */
    cacheNested : function(coContents,nestingLevel) {
        var that = this;
        if (nestingLevel < this.MAX_NESTING){
            coContents.where('?a ore:aggregates ?url')
                .where('?url rdf:type <' + lore.constants.RESOURCE_MAP + '>')
                .each(function(){
                    try{
                      var theurl = this.url.value.toString();
                      var nestedCO = that.getCompoundObject(theurl);
                      if (!nestedCO){
                          // TODO: Load these asynchronously via the repository adapter
                          var xhr = new XMLHttpRequest();
                          xhr.overrideMimeType('text/xml');
                          xhr.open("GET", theurl, false);
                          xhr.send(null);
                          nestedCO = new lore.ore.model.CompoundObject({uri: theurl});
                          nestedCO.load({format: 'application/rdf+xml', content: xhr.responseXML});
                          that.add(theurl, nestedCO);
                          that.cacheNested(nestedCO.getInitialContent(), nestingLevel + 1)
                      }
                    } catch (e) {
                        lore.debug.ore("Problem loading nested CO into cache",e);
                    }
                }
            );
        }
    }
});
