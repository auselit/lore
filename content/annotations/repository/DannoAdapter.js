/*
 * Copyright (C) 2008 - 2011 School of Information Technology and Electrical
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
 * @class lore.anno.repos.DannoAdapter Access and store annotations using danno (Annotea)
 */
lore.anno.repos.DannoAdapter = Ext.extend(lore.anno.repos.RepositoryAdapter,{
    // Override the idPrefix property with a different URL
    constructor : function(baseURL) {
        lore.anno.repos.DannoAdapter.superclass.constructor.call(this, baseURL);
        this.reposURL = baseURL //+ "/annotea/";
        this.idPrefix = this.reposURL;
        this.unsavedSuffix = "#unsaved";
        lore.debug.anno("created repos adapter",this);
    },
    getAnnotatesQuery : function(matchuri, scope, filterFunction){
         var queryUrl = this.reposURL  + lore.constants.ANNOTEA_ANNOTATES + lore.util.fixedEncodeURIComponent(matchuri);
         lore.debug.anno("Updating annotations with request URL: " + queryUrl);

         Ext.Ajax.request({
             url: queryUrl,
             method: "GET",
             disableCaching: false,
             success: function(resp, opt) {
                 try {
                     lore.debug.anno("Success retrieving annotations from " + opt.url, resp);
                     this.handleAnnotationsLoaded(resp, filterFunction, false);
                 } catch (e ) {
                     lore.debug.anno("Error getting annotations",e);
                 }
             },
             failure: function(resp, opt){
                 try {
                     this.fireEvent('servererror', 'list', resp);
                     lore.debug.anno("Unable to retrieve annotations from " + opt.url, resp);
                     lore.anno.ui.loreError("Failure loading annotations for page.");

                 } catch (e ) {
                     lore.debug.anno("Error on failure loading annotations",e);
                 }
             },
             scope:scope
         });
        
    },
    getRepliesQuery : function(annoID, scope){
        var queryURL = this.reposURL + lore.constants.ANNOTEA_REPLY_TREE + annoID;
        Ext.Ajax.request({
            disableCaching: false, // without this the request was failing
            method: "GET",
            url: queryURL, 
            success: function(resp,opt){
                this.handleAnnotationRepliesLoaded(resp,false);
            },
            failure: function(resp, opt){
                lore.debug.anno("Unable to obtain replies for " + opt.url, resp);
            },
            scope:scope
        });
    },
    
    saveAnnotation : function (annoRec, resultCallback,t){
        var annoRDF = t.serializer.serialize([annoRec.data], t.annods);
        var xhr = new XMLHttpRequest();
        if (annoRec.data.isNew()) {
            lore.debug.anno("creating new annotation");
            // create new annotation
            var action = 'create';
            var successfulStatus = 201;
            xhr.open("POST", this.reposURL);
            xhr.setRequestHeader('Content-Type', "application/rdf+xml");
            xhr.setRequestHeader('Content-Length', annoRDF.length);
        } else {
            lore.debug.anno("updating existing annotation");
            // Update the annotation on the server via HTTP PUT
            var action = 'create';
            var successfulStatus = 200;
            xhr.open("PUT", annoRec.data.id);
            xhr.setRequestHeader('Content-Type', "application/xml");
        }
        xhr.onreadystatechange = function(){
            try {
                if (xhr.readyState == 4) {
                    if (xhr.status == successfulStatus) {
                        resultCallback(xhr, action);
                        t.fireEvent("committedannotation", action, annoRec);
                    } else {
                        t.fireEvent('servererror', action, xhr);
                    }
                }

            } catch(e ) {
                lore.debug.anno("error sending annotation to server", e);
            }
        };
        xhr.send(annoRDF);
        lore.debug.anno("RDF of annotation", annoRDF);
    }
    

    
});