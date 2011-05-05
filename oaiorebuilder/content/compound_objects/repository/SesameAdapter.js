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
 * @class lore.ore.repos.SesameAdapter Access and store compound objects using a Sesame 2 repository
 * @extends lore.ore.repos.RepositoryAdapter
 */
lore.ore.repos.SesameAdapter = Ext.extend(lore.ore.repos.RepositoryAdapter,{
    getCompoundObjects : function(matchuri, matchpred, matchval, isSearchQuery){
        var sa = this;
	    try {
	       var escapedURL = "";
	       var altURL = "";
	       if (matchuri){
	           escapedURL = encodeURIComponent(matchuri.replace(/}/g,'%257D').replace(/{/g,'%257B'));
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
                    var fobj = this.makeFilter(matchval);
                    filter = fobj.filter;
                    matchval = fobj.matchval;
			    } 
		        queryURL = this.reposURL
		        + "?queryLn=sparql&query=" 
		        + "select distinct ?g ?a ?m ?t ?v where {"
		        + " graph ?g {" + escapedURL + " " + matchpred + " ?v ."
		        + filter + "} ."
		        + "{?g <http://purl.org/dc/elements/1.1/creator> ?a} ."
		        + "{?g <http://purl.org/dc/terms/modified> ?m} ."
		        + "OPTIONAL {?g <http://purl.org/dc/elements/1.1/title> ?t}}";
	       } else {
		       queryURL = this.reposURL
		            + "?queryLn=sparql&query=" 
		            + "select distinct ?g ?a ?m ?t where { graph ?g {" 
		            + "{<" + escapedURL + "> ?p ?o .} UNION " 
		            + "{?s ?p2 <" + escapedURL + ">} UNION "
		            + "{<" + altURL + "> ?p3 ?o2 .} UNION "
		            + "{?s2 ?p4 <" + altURL + ">}"
		            + "} . {?g <http://purl.org/dc/elements/1.1/creator> ?a}"
		            + ". {?g <http://purl.org/dc/terms/modified> ?m}"
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
					        result = xmldoc.getElementsByTagNameNS(lore.constants.NAMESPACES["sparql"], "result");
					    }
                        lore.ore.coListManager.clear(listname);
                        
					    if (result.length > 0){
	                        // add the results to the model
					        var coList = [];
                            var processed = {};
					        for (var i = 0; i < result.length; i++) {
					            var theobj = sa.parseCOFromXML(result[i]);
                                // deal with duplicate results (often because of multiple creators)
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
	            //url: this.reposURL + "/statements?context=<" + remid + ">",
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
	       var xmlhttp2 = new XMLHttpRequest();
	       xmlhttp2.open("PUT",
	           this.reposURL + "/statements?context=<" + remid + ">", true);
	       xmlhttp2.onreadystatechange = function() {
	            if (xmlhttp2.readyState == 4) {
	            	Ext.Msg.hide();
	                if (xmlhttp2.status == 204) {
	                    lore.debug.ore("sesame: RDF saved",xmlhttp2);
	                    lore.ore.ui.vp.info("Compound object " + remid + " saved");
                        callback(remid);
	                } else {
	                    lore.ore.ui.vp.error('Unable to save to repository' + xmlhttp2.responseText);
                        lore.debug.ore("Unable to save to repository: " + xmlhttp2.responseText,xmlhttp2);
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
        // TODO: first check that it hasn't been changed on the server
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
            Ext.MessageBox.hide();
	        lore.debug.ore("sesame: error deleting compound object",e);
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
		    var thequery = 
            "PREFIX dc:<http://purl.org/dc/elements/1.1/> " 
            + "PREFIX dcterms:<http://purl.org/dc/terms/>"
            + "PREFIX ore:<http://www.openarchives.org/ore/terms/> " 
            + "PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns%23>"
		    + "SELECT DISTINCT ?something ?somerel ?sometitle ?sometype ?creator ?modified ?anotherrel ?somethingelse WHERE {"
            // Compound objects that contain this uri
		    + "{?aggre ore:aggregates <" + eid2 + "> . " 
                    + "?something ore:describes ?aggre . "
		            + "?something a ?sometype . " 
                    + "OPTIONAL {?something dc:creator ?creator .} "
                    + "OPTIONAL {?something dcterms:modified ?modified .} "
                    + "OPTIONAL {?something dc:title ?sometitle .}}"
            // uris that have an asserted relationship to this uri
		    +  "UNION { ?something ?somerel <" + eid2 + "> . " 
                    + "FILTER isURI(?something) ."
		            + "FILTER (?somerel != ore:aggregates) . " 
                    + "FILTER (?somerel != rdf:type) . " 
                    + "OPTIONAL {?something a ?sometype} ."
                    + "OPTIONAL {?something dc:title ?sometitle.} }"
            // uris that have an asserted relationships from this uri
		    + "UNION {<"+ eid2 + "> ?somerel ?something . " 
                    + "FILTER isURI(?something). " 
                    + "FILTER (?somerel != rdf:type) . " 
                    + "FILTER (?somerel != ore:describes) . "
                    + "OPTIONAL {?something a ?sometype} ."
                    + "OPTIONAL {?something dc:title ?sometitle.}}"
            // if this is a compound object, uris contained
		    + "UNION {<" + eid2 + "> ore:describes ?aggre ."
                    + "?aggre ?somerel ?something . " 
                    + "FILTER isURI(?something) ."
                    + "FILTER (?somerel != rdf:type) ." 
                    + "OPTIONAL {?something dc:title ?sometitle . } . " 
                    + "OPTIONAL {?something ?anotherrel ?somethingelse . FILTER isURI(?somethingelse)} . "
                    + "OPTIONAL {?something a ?sometype}}}";

		    var queryURL = this.reposURL
		            + "?queryLn=sparql&query=" 
		            + thequery;
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
            lore.debug.ore("sparql explore result",serializer.serializeToString(rdfDoc));
	        var thefrag = xsltproc.transformToFragment(rdfDoc, document);
	        
            //lore.debug.ore("json is",serializer.serializeToString(thefrag));
            jsonobj = Ext.decode(serializer.serializeToString(thefrag));
            return jsonobj;
	    } catch (ex){
	        lore.debug.ore("SesameAdapter.getExploreData: ",ex);
	    } 
    },
    /**
     * @private constructs a filter for SPARQL query
     * @param {} matchval
     * @return {}
     */
    makeFilter : function(matchval){
        // implicit and, use quotes for phrase search
        var fExpr = "";
        var mlen = matchval.length;
        var newmatchval = matchval;
        if (matchval.charAt(0) == '"' && matchval.charAt(mlen - 1) == '"'){
            newmatchval = matchval.substring(1,(mlen - 1));
            fExpr = "FILTER regex(str(?v), \"" + newmatchval + "\", \"i\")";
        } else if (matchval.match(" ")){
            var msplit = matchval.split(" ");
            newmatchval = msplit[0];
            for (var i = 0; i < msplit.length; i++){
               fExpr += "FILTER regex(str(?v), \"" + msplit[i] + "\", \"i\"). ";  
            }
        } else {
            fExpr = "FILTER regex(str(?v), \"" + matchval + "\", \"i\")";
        }
        return {filter: fExpr, matchval: newmatchval};
    },
   /**
    * Parses compound object details from a SPARQL XML result
    * @param {XMLNode} XML node to be parsed
    * Returns an object with the following properties:
    *  {string} uri The identifier of the compound object 
    *  {string} title The (Dublin Core) title of the compound object 
    *  {string} creator The (Dublin Core) creator of the compound object 
    *  {Date} modified The date on which the compound object was modified (from dcterms:modified) 
    *  {string} match The value of the subject, predicate or object from the triple that matched the search 
    *  {Date} acessed The date this compound object was last accessed (from the browser history) 
    * */
   parseCOFromXML: function(/*Node*/result){
        var props = {};
        var bindings, node, attr, nodeVal;
        props.title = "Untitled";
        props.creator = "Anonymous";
        try {  
           bindings = result.getElementsByTagName('binding');
           for (var j = 0; j < bindings.length; j++){  
            attr = bindings[j].getAttributeNode('name');
            if (attr.nodeValue =='g'){ //graph uri
                node = bindings[j].getElementsByTagName('uri'); 
                props.uri = lore.global.util.safeGetFirstChildValue(node);
            } else if (attr.nodeValue == 'v'){
                node = bindings[j].getElementsByTagName('literal');
                nodeVal = lore.global.util.safeGetFirstChildValue(node);
                if (!nodeVal){
                    node = bindings[j].getElementsByTagName('uri');
                }
                props.match = lore.global.util.safeGetFirstChildValue(node);
            } else {
                node = bindings[j].getElementsByTagName('literal');
                nodeVal = lore.global.util.safeGetFirstChildValue(node);
                if (attr.nodeValue == 't' && nodeVal){ //title
                    props.title = nodeVal;
                } else if (attr.nodeValue == 'a' && nodeVal){// dc:creator
                    props.creator = nodeVal;
                } else if (attr.nodeValue == 'm' && nodeVal){ // dcterms:modified
                    props.modified = nodeVal;
                    try {
                        var modDate = Date.parseDate(props.modified,'c') || Date.parseDate(props.modified,'Y-m-d');
                        if (modDate){
                            props.modified = modDate;
                        }
                    } catch (e){
                        lore.debug.ore("parseCOFromXML: error converting date",e);
                    }
                } 
            }
           }
        } catch (ex) {
            lore.debug.ore("Unable to process compound object result list", ex);
        }
        return props;
    }
});


 