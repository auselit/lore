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
 * @class lore.anno.repos.RestAdapter Access and store annotations using lorestore REST api
 */
lore.anno.repos.RestAdapter = Ext.extend(lore.anno.repos.RepositoryAdapter,{
    // Override the idPrefix property with a different URL
    constructor : function(baseURL) {
        lore.anno.repos.RestAdapter.superclass.constructor.call(this, baseURL);
        this.reposURL = baseURL + "/oac/";
        this.idPrefix = this.reposURL;
        this.unsavedSuffix = "#unsaved";
    },
    getAnnotatesQuery : function(matchuri, scope, filterFunction){
       
         var queryUrl = this.reposURL  + "?annotates=" + lore.util.fixedEncodeURIComponent(matchuri);
         lore.debug.anno("Updating annotations with request URL: " + queryUrl);

         Ext.Ajax.request({
             url: queryUrl,
             method: "GET",
             headers: {
            	'Accept': 'application/trix' 
             },
             disableCaching: false,
             success: function(resp, opt) {
                 try {
                     lore.debug.anno("Success retrieving annotations from " + opt.url, resp);
                     this.handleAnnotationsLoaded(resp, filterFunction, true);
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
    getRepliesQuery : function(annoID,  scope){
        var queryUrl = this.reposURL  + "?annotates=" + lore.util.fixedEncodeURIComponent(annoID);
        Ext.Ajax.request({
            disableCaching: false, // without this the request was failing
            method: "GET",
            url: queryUrl, 
            success: function(resp,opt){
                this.handleAnnotationRepliesLoaded(resp,true);
            },
            failure: function(resp, opt){
                lore.debug.anno("Unable to obtain replies for " + opt.url, resp);
            },
            scope:scope
        });
    },
   /* getAnnotations : function(matchuri, matchpred, matchval, isSearchQuery){
        var ra = this;
        try {
           var escapedURL = "";
           var altURL = "";
           if (matchuri){
               escapedURL = encodeURIComponent(matchuri.replace(/}/g,'%257D').replace(/{/g,'%257B'));
           }
           var queryURL = "";
           if (isSearchQuery){
                queryURL = this.reposURL
                    + "?matchval=" + matchval;
                if (escapedURL && escapedURL != "")
                    queryURL += "&refersTo=" + escapedURL;
                if (matchpred && matchpred != "")
                    queryURL += "&matchpred=" + matchpred;
           } else {
               queryURL = this.reposURL
                    + "?refersTo=" + escapedURL;
           }
            
            var xhr = new XMLHttpRequest();
            lore.debug.anno("RestAdapter.getAnnotations", {queryURL:queryURL});
            xhr.open('GET', queryURL);
            xhr.onreadystatechange = function(aEvt) {
                if (xhr.readyState == 4) {
                    if (xhr.responseText && xhr.status != 204 && xhr.status < 400) {
                        var xmldoc = xhr.responseXML;
                        var listname = (isSearchQuery? "search" : "browse");  
                        var result = {};
                        if (xmldoc) {
                            result = xmldoc.getElementsByTagNameNS(lore.constants.NAMESPACES["sparql"], "result");
                        }
                        
                        
                        if (result.length > 0){
                            // add the results to the model
                            var coList = [];
                            var processed = {};
                            for (var i = 0; i < result.length; i++) {
                                var theobj = ra.parseCOFromXML(result[i]);
                                var resultIndex = processed[theobj.uri];
                                var existing = theobj; 
                                if (resultIndex >= 0){
                                    existing = coList[resultIndex];
                                    if (existing && !existing.creator.match(theobj.creator)){
                                        existing.creator = existing.creator + " &amp; " + theobj.creator;
                                    }
                                } else {
                                   if (matchval) {theobj.searchval = matchval;}
                                   coList.push(theobj);
                                   processed[theobj.uri] = coList.length - 1; 
                                }    
                            }
                            //lore.ore.coListManager.add(coList,listname);
                        } 
                    } else if (xhr.status == 404){
                        lore.debug.anno("404 accessing Resource Map repository",xhr);
                    }
                }
            };
            xhr.send(null);
        } catch (e) {
            lore.debug.anno("Unable to retrieve annotations",e);
            lore.anno.ui.loreError("Unable to retrieve annotations");
        }
    },*/
    
    saveAnnotation : function (annoRec, resultCallback,t){
        var annoRDF = t.createAnnoOAC([annoRec.data], t.annods, true, "xml");
        var xhr = new XMLHttpRequest();
        if (annoRec.data.isNew()) {
            lore.debug.anno("creating new annotation");
            // create new annotation
            var action = 'create';
            var successfulStatus = 201;
            xhr.open("POST", this.reposURL);
        } else {
            lore.debug.anno("updating existing annotation");
            // Update the annotation on the server via HTTP PUT
            var action = 'create';
            var successfulStatus = 200;
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
    },
    
    
    /*deleteAnnotation : function(annoid, callback, failure){
       
        lore.debug.anno("deleting from lorestore repository " + annoid);
        try {
          lore.anno.am.runWithAuthorisation(function() {
            var xhr = new XMLHttpRequest();
            xhr.open("DELETE", annoid);  
            xhr.onreadystatechange= function(){
                if (xhr.readyState == 4) {
                    if (xhr.status == 204) { // OK
                        if (callback){
                            callback(annoid);
                        }
                    } else {
                        if (failure){
                            failure(annoid, xhr);
                        }
                        lore.anno.ui.loreError('Unable to delete annotation' + xhr.statusText);
                        lore.debug.anno("Unable to delete annotation", {
                            xhr : xhr,
                            headers : xhr.getAllResponseHeaders()
                        });
                        var msg = '<b>' + xhr.statusText + '</b>'  
                                + '<br><br><a style="text-decoration:underline;color:blue" href="#" onclick="lore.util.launchWindow(\'data:text/html,' + encodeURIComponent(xhr.responseText) + '\',false,window)\">View Details</a>';  
                        Ext.Msg.show({
                            title : 'Unable to delete annotation',
                            buttons : Ext.MessageBox.OK,
                            msg : msg
                        });
                    }
                }
            };
            xhr.send(null);
          });
        } catch (e){
            Ext.MessageBox.hide();
            lore.debug.anno("RestAdapter: error deleting annotation",e);
        }        
    },*/
    
    generateID : function() {
        return this.reposURL + this.unsavedSuffix;
    }
});


 