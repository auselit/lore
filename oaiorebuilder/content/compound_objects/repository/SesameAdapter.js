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
	}
});


 