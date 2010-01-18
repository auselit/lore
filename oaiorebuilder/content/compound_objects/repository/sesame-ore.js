/*
 * Copyright (C) 2008 - 2009 School of Information Technology and Electrical
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
 
/* Compound object functions for Sesame 2 repositories */
lore.ore.sesame = {};


/**
 * Gets compound objects that match the parameters and add them to the model
 * @param {} matchuri The URI to match 
 * @param {} matchpred The predicate to match
 * @param {} matchval The value to search for
 * @param {Boolean} isSearchQuery Whether this is a search query (otherwise it is a browse query)
 */
lore.ore.sesame.getCompoundObjects = function(matchuri, matchpred, matchval, isSearchQuery){
    try {
       // browse matches both www and non-www version of URL
       var escapedURL = "";
       var altURL = "";
       if (matchuri){
           escapedURL = encodeURIComponent(matchuri);
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
	        queryURL = lore.ore.reposURL
	        + "?queryLn=sparql&query=" 
	        + "select distinct ?g ?a ?c ?t ?v where {"
	        + " graph ?g {" + escapedURL + " " + matchpred + " ?v ."
	        + filter + "} ."
	        + "{?g <http://purl.org/dc/elements/1.1/creator> ?a} ."
	        + "{?g <http://purl.org/dc/terms/created> ?c} ."
	        + "OPTIONAL {?g <http://purl.org/dc/elements/1.1/title> ?t}}";
            lore.debug.ore("compound object search query is",queryURL);
       } else {
	       queryURL = lore.ore.reposURL
	            + "?queryLn=sparql&query=" 
	            + "select distinct ?g ?a ?c ?t where { graph ?g {" 
	            + "{<" + escapedURL + "> ?p ?o .} UNION " 
	            + "{?s ?p2 <" + escapedURL + ">} UNION "
	            + "{<" + altURL + "> ?p3 ?o2 .} UNION "
	            + "{?s2 ?p4 <" + altURL + ">}"
	            + "} . {?g <http://purl.org/dc/elements/1.1/creator> ?a}"
	            + ". {?g <http://purl.org/dc/terms/created> ?c}"
	            + ". OPTIONAL {?g <http://purl.org/dc/elements/1.1/title> ?t}}";
	        //lore.debug.ore("compound object browse query is",queryURL);
       }
        
        var req = new XMLHttpRequest();
        req.open('GET', queryURL, true);
        req.onreadystatechange = function(aEvt) {
            if (req.readyState == 4) {
                if (req.responseText && req.status != 204
                        && req.status < 400) {
                    var xmldoc = req.responseXML;
                    // TODO: this should be a callback and should add to model instead
                    lore.ore.addCompoundObjectsFromSearch(xmldoc, matchval, isSearchQuery);

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
}
/**
 * Get a compound object from the repository and load it into the editor
 * @param {} remid The identifier of the compound object to get
 */
lore.ore.sesame.loadCompoundObject = function(remid){
     Ext.Ajax.request({
            // could use repository context (but would need to set accept headers to specify xml
            //url: lore.ore.reposURL + "/statements?context=<" + remid + ">",
            url: remid,
            method: "GET",
            disableCaching: false,
            success: lore.ore.loadCompoundObject,
            failure: function(resp, opt){
                lore.debug.ore("Unable to load compound object " + opt.url, resp);
            }
        }); 
}

/**
 * Creates (or replaces) a compound object in the sesame repository
 * @param {} remid The id of the compound object
 * @param {} therdf The content of the compound obect as RDF/XML
 */
lore.ore.sesame.saveCompoundObject = function (remid,therdf){
    try {                  
       var xmlhttp2 = new XMLHttpRequest();
       xmlhttp2.open("PUT",
           lore.ore.reposURL + "/statements?context=<" + remid + ">", true);
       xmlhttp2.onreadystatechange = function() {
            if (xmlhttp2.readyState == 4) {
                if (xmlhttp2.status == 204) {
                    lore.debug.ore("sesame: RDF saved",xmlhttp2);
                    lore.ore.ui.loreInfo(remid + " saved to " + lore.ore.reposURL);
                    // add to model
                    lore.ore.afterSaveCompoundObject(remid);
                } else {
                    lore.ore.ui.loreError('Unable to save to repository' + xmlhttp2.responseText);
                    Ext.Msg.show({
                        title : 'Problem saving RDF',
                        buttons : Ext.MessageBox.OKCANCEL,
                        msg : ('There was an problem saving to the repository: ' + xmlhttp2.responseText + '<br>Please try again or save your compound object to a file using the <i>Save to file</i> menu option and contact the Aus-e-Lit team for further assistance.')
                    });
                }
            }
        };
        xmlhttp2.setRequestHeader("Content-Type",
                "application/rdf+xml");
        xmlhttp2.send(therdf); 
    } catch (e) {
        xmlhttp = false;
    }
}


/**
 * Delete the compound object from the sesame repository
 * calls afterDeleteCompoundObject to remove it from the UI
 */
lore.ore.sesame.deleteCompoundObject = function(remid){
    lore.debug.ore("deleting from sesame repository " + remid);
    try {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("DELETE",
            lore.ore.reposURL + "/statements?context=<" + remid + ">", true);  
        xmlhttp.onreadystatechange= function(){
            if (xmlhttp.readyState == 4) {
                lore.ore.afterDeleteCompoundObject(remid);
            }
        };
        xmlhttp.send(null);
    } catch (e){
        lore.debug.ore("sesame: error deleting compound object",e);
    }        
};
 