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
 * Abstract superclass providing functions for storing, loading compound objects from a repository
 * @class lore.ore.RepositoryAdapter
 * @param {} reposURL
 */
lore.ore.RepositoryAdapter = function (reposURL){
    this.reposURL = reposURL;
    // prefix for identifiers is base URI (ie reposURL after http:// until next slash) plus 'rem/'
    this.idPrefix = reposURL.substring(0, reposURL.indexOf('/',7) + 1) + "rem/";
}
lore.ore.RepositoryAdapter.prototype = {
    setReposURL : function(reposURL){
        this.reposURL = reposURL;
    },
    getReposURL : function (){
        return this.reposURL;
    },
    /**
     * Gets compound objects that match the parameters and add them to the model
     * @param {String} matchuri The URI to match 
     * @param {String} matchpred The predicate to match
     * @param {String} matchval The value to search for
     * @param {Boolean} isSearchQuery Whether this is a search query (otherwise it is a browse query)
     */
    getCompoundObjects : function(matchuri, matchpred, matchval, isSearchQuery){
        throw "Method not implemented";
    },
    /**
     * Get a compound object from the repository and load it into the editor
     * @param {String} remid The identifier of the compound object to get
     */
    loadCompoundObject : function(remid){
        throw "Method not implemented";
    },
    /**
     * Creates (or replaces) a compound object in the sesame repository
     * @param {String} remid The id of the compound object
     * @param {String} therdf The content of the compound obect as RDF/XML
     */
    saveCompoundObject : function (remid,therdf){
        throw "Method not implemented";
    },
    /**
     * Delete the compound object from the sesame repository
     * calls afterDeleteCompoundObject to remove it from the UI
     * @param {String} remid The URI of the compound object to remove 
     **/
    deleteCompoundObject : function(remid){
        throw "Method not implemented";
    },
    generateID: function(){
        // TODO: #125 should use a persistent identifier service to request an identifier
        // TODO: check that this id hasn't been used before
        return this.idPrefix + draw2d.UUID.create();
    }
}