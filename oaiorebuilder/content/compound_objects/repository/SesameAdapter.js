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
 
/** Access and store compound objects using a Sesame 2 repository
 * @class lore.ore.SesameAdapter
 * @extends lore.ore.RepositoryAdapter
 */
lore.ore.SesameAdapter = Ext.extend(lore.ore.RepositoryAdapter,{
    getCompoundObjects : function(matchuri, matchpred, matchval, isSearchQuery){
	    try {
	       var escapedURL = "";
	       var altURL = "";
	       if (matchuri){
	           escapedURL = encodeURIComponent(matchuri);
	           // browse matches both www and non-www version of URL
		       if (!matchuri.match("http://www.")){
		            altURL = escape(matchuri.replace("http://","http://www."));
		       } else {
		            altURL = escape(matchuri.replace("http://www.","http://"));
		       }
	       }
	       var queryURL = "";
	       if (isSearchQuery){
			    if (matchuri && matchuri !== ""){
			        escapedURL = "<" + escapedURL + ">";
			    } else {
			        escapedURL = "?u";
			    }
			    if (matchpred && matchpred !== ""){
			        matchpred = "<" + matchpred + ">";
			    } else {
			        matchpred = "?p";
			    }
			    var filter = "";
			    if (matchval && matchval != ""){
			        filter = "FILTER regex(str(?v), \"" + matchval + "\", \"i\")";
			    } 
		        queryURL = this.reposURL
		        + "?queryLn=sparql&query=" 
		        + "select distinct ?g ?a ?c ?t ?v where {"
		        + " graph ?g {" + escapedURL + " " + matchpred + " ?v ."
		        + filter + "} ."
		        + "{?g <http://purl.org/dc/elements/1.1/creator> ?a} ."
		        + "{?g <http://purl.org/dc/terms/created> ?c} ."
		        + "OPTIONAL {?g <http://purl.org/dc/elements/1.1/title> ?t}}";
	       } else {
		       queryURL = this.reposURL
		            + "?queryLn=sparql&query=" 
		            + "select distinct ?g ?a ?c ?t where { graph ?g {" 
		            + "{<" + escapedURL + "> ?p ?o .} UNION " 
		            + "{?s ?p2 <" + escapedURL + ">} UNION "
		            + "{<" + altURL + "> ?p3 ?o2 .} UNION "
		            + "{?s2 ?p4 <" + altURL + ">}"
		            + "} . {?g <http://purl.org/dc/elements/1.1/creator> ?a}"
		            + ". {?g <http://purl.org/dc/terms/created> ?c}"
		            + ". OPTIONAL {?g <http://purl.org/dc/elements/1.1/title> ?t}}";
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
					        //lore.debug.ore("compound objects sparql " + listname, xmldoc);
					        result = xmldoc.getElementsByTagNameNS(lore.constants.NAMESPACES["sparql"], "result");
					    }
					    if (result.length > 0){
	                        // add the results to the model
					        var coList = [result.length];
					        for (var i = 0; i < result.length; i++) {
					            var theobj = new lore.ore.model.CompoundObjectSummary(result[i]);
					            if (matchval) {theobj.setSearchVal(matchval);}
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
	        lore.ore.ui.loreWarning("Unable to retrieve compound objects");
	    }
	},
	loadCompoundObject : function(remid, callback){
	     Ext.Ajax.request({
	            // could use repository context (but would need to set accept headers to specify xml
	            //url: this.reposURL + "/statements?context=<" + remid + ">",
	            url: remid,
	            method: "GET",
	            disableCaching: false,
	            success: callback,
	            failure: function(resp, opt){
	                lore.debug.ore("Unable to load compound object " + opt.url, resp);
	            }
	        }); 
	},
	saveCompoundObject : function (remid,therdf,callback){
	    try {                  
	       var xmlhttp2 = new XMLHttpRequest();
	       xmlhttp2.open("PUT",
	           this.reposURL + "/statements?context=<" + remid + ">", true);
	       xmlhttp2.onreadystatechange = function() {
	            if (xmlhttp2.readyState == 4) {
	                if (xmlhttp2.status == 204) {
	                    lore.debug.ore("sesame: RDF saved",xmlhttp2);
	                    lore.ore.ui.loreInfo("Compound object " + remid + " saved");
                        callback(remid);
	                } else {
	                    lore.ore.ui.loreError('Unable to save to repository' + xmlhttp2.responseText);
	                    Ext.Msg.show({
	                        title : 'Problem saving RDF',
	                        buttons : Ext.MessageBox.OKCANCEL,
	                        msg : ('There was an problem saving to the repository: ' + xmlhttp2.responseText + '<br>Please try again in a few minutes or save your compound object to a file using the <i>Export to RDF/XML</i> menu option from the toolbar and contact the Aus-e-Lit team for further assistance.')
	                    });
	                }
	            }
	        };
	        xmlhttp2.setRequestHeader("Content-Type", "application/rdf+xml");
	        xmlhttp2.send(therdf); 
	    } catch (e) {
	        xmlhttp = false;
	    }
	},
	deleteCompoundObject : function(remid, callback){
	    lore.debug.ore("deleting from sesame repository " + remid);
	    try {
	        var xmlhttp = new XMLHttpRequest();
	        xmlhttp.open("DELETE",
	            this.reposURL + "/statements?context=<" + remid + ">", true);  
	        xmlhttp.onreadystatechange= function(){
	            if (xmlhttp.readyState == 4) {
                    callback(remid);
	            }
	        };
	        xmlhttp.send(null);
	    } catch (e){
	        lore.debug.ore("sesame: error deleting compound object",e);
	    }        
	},
    getExploreData : function(uri,title,isCompoundObject){
        var eid = uri.replace(/&amp;/g,'&').replace(/&amp;/g,'&');
        var eid2 = escape(eid);
        try {
		    var thequery = "PREFIX dc:<http://purl.org/dc/elements/1.1/> PREFIX ore:<http://www.openarchives.org/ore/terms/> PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns%23>"
		    + "SELECT DISTINCT ?something ?somerel ?sometitle ?sometype WHERE {"
		    + "{?aggre ore:aggregates <" + eid2 + "> . ?something ore:describes ?aggre ."
		    + " ?something a ?sometype . OPTIONAL {?something dc:title ?sometitle .}}"
		    +  "UNION { ?something ?somerel <" + eid2 + "> . FILTER isURI(?something) ."
		    + "FILTER (?somerel != ore:aggregates) . FILTER (?somerel != rdf:type) . OPTIONAL {?something dc:title ?sometitle.} }"
		    + "UNION {<"+ eid2 + "> ?somerel ?something . FILTER isURI(?something). FILTER (?somerel != rdf:type) . FILTER (?somerel != ore:describes) . OPTIONAL {?something dc:title ?sometitle.}}"
		    + "UNION {<" + eid2 + "> ore:describes ?aggre .?aggre ?somerel ?something . FILTER (?somerel != rdf:type) .OPTIONAL {?something dc:title ?sometitle . } . OPTIONAL {?something a ?sometype}}}";
		    var queryURL = this.reposURL
		            + "?queryLn=sparql&query=" 
		            + thequery;
            //lore.debug.ore("sparql query is",thequery);
		    var json;
            var xsltproc = new XSLTProcessor();
	        // get the stylesheet - this has to be an XMLHttpRequest because Ext.Ajax.request fails on chrome urls
	        var xhr = new XMLHttpRequest();
	        xhr.overrideMimeType('text/xml');
	        xhr.open("GET", 'chrome://lore/content/compound_objects/stylesheets/sparqlexplore.xsl', false);
	        xhr.send(null);
	        var stylesheetDoc = xhr.responseXML;
	        xsltproc.importStylesheet(stylesheetDoc);
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
	        var thefrag = xsltproc.transformToFragment(rdfDoc, document);
	        var serializer = new XMLSerializer();
	        //lore.debug.ore("response is",serializer.serializeToString(rdfDoc));
	        eval ("json = " + serializer.serializeToString(thefrag));
	        //lore.debug.ore("got json",json);
            return json;
	    } catch (ex){
	        lore.debug.ore("SesameAdapter.getExploreData: ",ex);
	    } 
    }
});


 