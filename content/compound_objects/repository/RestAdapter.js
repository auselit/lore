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
 * @class lore.ore.repos.RestAdapter Access and store compound objects using a
 *  REST based respository
 * @extends lore.ore.repos.SesameAdapter
 */
lore.ore.repos.RestAdapter = Ext.extend(lore.ore.repos.SesameAdapter,{
	// Override the idPrefix property with a different URL
	constructor : function(reposURL) {
		lore.ore.repos.RestAdapter.superclass.constructor.call(this, reposURL);
	    this.idPrefix = reposURL.substring(0, reposURL.indexOf('/',7) + 1) + "ore/";
	    this.unsavedSuffix = "#unsaved";
	},
    getCompoundObjects : function(matchuri, matchpred, matchval, isSearchQuery){
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
		        	+ "?refersTo=" + escapedURL
		        	+ "&matchpred=" + matchpred
		        	+ "&matchval=" + matchval;
	       } else {
		       queryURL = this.reposURL
		            + "?refersTo=" + escapedURL;
	       }
	        
	        var req = new XMLHttpRequest();
	        req.open('GET', queryURL, true);
	        req.onreadystatechange = function(aEvt) {
	            if (req.readyState == 4) {
	                if (req.responseText && req.status != 204
	                        && req.status < 400) {
	                    var xmldoc = req.responseXML;
	                    var listname = (isSearchQuery? "search" : "browse");  
					    var result = {};
					    if (xmldoc) {
					        result = xmldoc.getElementsByTagNameNS(lore.constants.NAMESPACES["sparql"], "result");
					    }
                        lore.ore.coListManager.clear(listname);
                        
					    if (result.length > 0){
	                        // add the results to the model
					        var coList = [result.length];
					        for (var i = 0; i < result.length; i++) {
					            var theobj = ra.parseCOFromXML(result[i]);
					            if (matchval) {theobj.searchval = matchval;}
					            coList[i] = theobj; 
					        }
					        lore.ore.coListManager.add(coList,listname);
					    } 
	                } else if (req.status == 404){
	                    lore.debug.ore("404 accessing compound object repository",req);
	                }
	            }
	        };
	        req.send(null);
	    } catch (e) {
	        lore.debug.ore("Unable to retrieve compound objects",e);
	        lore.ore.ui.vp.warning("Unable to retrieve compound objects");
	    }
	},
	loadCompoundObject : function(remid, callback, failcallback){
	     Ext.Ajax.request({
	            url: remid,
                headers: {
                    Accept: 'application/rdf+xml'
                },
	            method: "GET",
	            disableCaching: false,
	            success: callback,
	            failure: failcallback
	        }); 
	},
	saveCompoundObject : function (theco,callback){
        // TODO: first check that the compound object hasn't changed on the server

        var remid = theco.uri;
        var therdf = theco.toRDFXML(false);
		Ext.Msg.show({
	           msg: 'Saving Compound Object to repository...',
	           width:250,
	           defaultTextHeight: 0,
	           closable: false,
	           cls: 'co-load-msg'
	       });
	    try {
           var xmlhttp = new XMLHttpRequest();
           
	       if (theco.uri.indexOf(this.unsavedSuffix) > 1) { // New compound object, not in the repo yet
	    	   lore.debug.ore("lorestore: saving new compound object", theco);
	    	   xmlhttp.open("POST", this.reposURL);
	    	   
	       } else { // updating an existing compound object
	    	   lore.debug.ore("lorestore: saving existing compound object: " + remid, theco);
	    	   xmlhttp.open("PUT", remid);
	       }
	       xmlhttp.onreadystatechange = function() {
	            if (xmlhttp.readyState == 4) {
	            	Ext.Msg.hide();
	                if (xmlhttp.status == 200) { // OK
	                    lore.debug.ore("lorestore: RDF saved",xmlhttp);
	                    lore.ore.ui.vp.info("Compound object " + remid + " saved");
                        callback(remid);
	                } else if (xmlhttp.status == 201) {  // Created
	                    lore.debug.ore("lorestore: RDF saved",xmlhttp);
	                    var location = xmlhttp.getResponseHeader("Location");
	                    lore.debug.ore("New CO URI is: " + location);
	                    lore.ore.ui.vp.info("Compound object " + remid + " saved");
	                    
	                    lore.ore.controller.loadCompoundObject(xmlhttp);
                        callback(location);
	                } else {
	                    lore.ore.ui.vp.error('Unable to save to repository' + xmlhttp.responseText);
                        lore.debug.ore("Unable to save to repository",{xmlhttp:xmlhttp,headers:xmlhttp.getAllResponseHeaders()});
	                    Ext.Msg.show({
	                        title : 'Problem saving RDF',
	                        buttons : Ext.MessageBox.OKCANCEL,
	                        msg : ('There was an problem saving to the repository: ' + xmlhttp.responseText + '<br>Please try again in a few minutes or save your compound object to a file using the <i>Export to RDF/XML</i> menu option from the toolbar and contact the Aus-e-Lit team for further assistance.')
	                    });
	                }
	            }
	        };
	        xmlhttp.setRequestHeader("Content-Type", "application/rdf+xml");
	        xmlhttp.send(therdf); 
	    } catch (e) {
	        lore.debug.ore("lorestore: problem saving compound object", e);
	    }
	},
	loadNew : function(oldURI, newURI) {
		// should be an #unsaved URI
		lore.ore.cache.remove(oldURI);
		
		// Except, this function is doing mooooore
		controller.loadCompoundObjectFromURL(newURI);
        lore.ore.reposAdapter.loadCompoundObject(rdfURL, lore.ore.controller.loadCompoundObject, lore.ore.controller.afterLoadCompoundObjectFail);
	},
	deleteCompoundObject : function(remid, callback){
        // TODO: first check that it hasn't been changed on the server
	    lore.debug.ore("deleting from lorestore repository " + remid);
	    try {
	        var xmlhttp = new XMLHttpRequest();
	        xmlhttp.open("DELETE", remid, true);  
	        xmlhttp.onreadystatechange= function(){
	            if (xmlhttp.readyState == 4) {
                    callback(remid);
	            }
	        };
	        xmlhttp.send(null);
	    } catch (e){
	        lore.debug.ore("RestAdapter: error deleting compound object",e);
	    }        
	},
    /**
     * Performs a SPARQL query to retrieve data for Explore view
     * @param {} uri
     * @param {} title
     * @param {} isCompoundObject
     * @return {}
     */
    getExploreData : function(uri,title,isCompoundObject){
        var eid = uri.replace(/&amp;/g,'&').replace(/&amp;/g,'&');
        var eid2 = escape(eid);
        try {
		    var queryURL = this.reposURL
		            + "?exploreFrom=" 
		            + eid2;
		    var jsonobj;
            var xsltproc = new XSLTProcessor();
            var xhr = new XMLHttpRequest();                
            xhr.overrideMimeType('text/xml');
            if (!this.exploreStylesheet){
		        // get the stylesheet - this has to be an XMLHttpRequest because Ext.Ajax.request fails on chrome urls
		        xhr.open("GET", 'chrome://lore/content/compound_objects/stylesheets/sparqlexplore.xsl', false);
		        xhr.send(null);
		        this.exploreStylesheet = xhr.responseXML;
            }
	        xsltproc.importStylesheet(this.exploreStylesheet);
	        xsltproc.setParameter(null,'subj',eid);
	        if (title){
	            xsltproc.setParameter(null,'title',title);
	        }
            if (isCompoundObject){
                xsltproc.setParameter(null,'isCompoundObject','y');
            }
	        // get the xml
	        xhr.open("GET",queryURL, false);
	        xhr.send(null);
	        var rdfDoc = xhr.responseXML;
            var serializer = new XMLSerializer();
            //lore.debug.ore("sparql explore result",serializer.serializeToString(rdfDoc));
	        var thefrag = xsltproc.transformToFragment(rdfDoc, document);
	        
            //lore.debug.ore("json is",serializer.serializeToString(thefrag));
            jsonobj = Ext.decode(serializer.serializeToString(thefrag));
            return jsonobj;
	    } catch (ex){
	        lore.debug.ore("RestAdapter.getExploreData",ex);
	    } 
    },
    
    generateID : function() {
    	return this.reposURL + this.unsavedSuffix;
    }
});


 