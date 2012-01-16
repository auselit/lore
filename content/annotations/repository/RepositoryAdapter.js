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
 * Abstract superclass providing functions for storing, loading annotations from a repository
 * @class lore.anno.repos.RepositoryAdapter
 * Authorisation is handled by Controller at present (as both danno and lorestore use Emmet)
 * @param {} reposURL
 */
lore.anno.repos.RepositoryAdapter = function (baseURL){
    this.reposBase = baseURL;
};
Ext.apply(lore.anno.repos.RepositoryAdapter.prototype, {
    /**
     * Set the access URL of the repository
     * @param {} reposURL
     */
    setReposURL : function(reposURL){
        this.reposURL = reposURL;
    },
    /**
     * Returns the access URL of the repository
     * @return {}
     */
    getReposURL : function (){
        return this.reposURL;
    },
    /**
     * Gets annotations that match the parameters and add them to the model
     * @param {String} matchuri The URI to match 
     * @param {String} matchpred The predicate to match
     * @param {String} matchval The value to search for
     * @param {Boolean} isSearchQuery Whether this is a search query (otherwise it is a browse query)
     */
    getAnnotatesQuery : function(matchuri, scope, filterFunction){
        throw "Method not implemented";
    },
    
    /**
     * Creates (or replaces) an annotation in the repository
     * @param {} theAnno 
     */
    saveAnnotation : function (annoRec, resultCallback,t){
        throw "Method not implemented";
    },
    /**
     * Delete the annotation
     * @param {String} id The URI of the annotation to remove 
     **/
    deleteAnnotation : function(id, success, failure, scope){
            Ext.Ajax.request({
                url: id,
                success: function(resp){
                    try{
                        if (success){
                            // trick to get scope right
                            Ext.each([resp],success, scope);
                        }
                    } catch (ex){
                        lore.debug.anno("Problem",ex);
                    }
                },

                failure: function(resp, opts){
                    try {
                        if (failure){
                            // trick for scope
                            Ext.each([{resp:resp,opts:opts}],failure,scope)
                        }
                    } catch (ex){
                        lore.debug.anno("Problem",ex);
                    }
                },
                method: "DELETE",
                scope: scope
            });
    },
    /**
     * Generate a URI 
     * @return {}
     */
    generateID: function(){
        // id generated here is ignored by server, used only for differentiation while it is in local annotation store
        return this.idPrefix + "/" + lore.draw2d.UUID.create();
    }
    
});