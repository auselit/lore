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

/**
 * Handler function for successful return of Ajax request to Calais web service
 * 
 * @param {Object} resp
 */
lore.textm.handleOpenCalaisMetadata = function(resp) {
    // get the contents of the string element
    // using string replace because the result using the dom was being truncated
    var res = resp.responseText.replace(
            '<?xml version="1.0" encoding="utf-8"?>', '').replace(
            '<string xmlns="http://clearforest.com/">', '').replace(
            '</string>', '');
    // load into an object
    var jsonObj;
    lore.ui.textminingtab.body.update(res + lore.textm.POWEREDBY_CALAIS);
    var nativeJSON = Components.classes["@mozilla.org/dom/json;1"]
                 .createInstance(Components.interfaces.nsIJSON);

    var jsonObj = nativeJSON.decode(res);

}
/**
 * Triggered when the user selects the Calais button from the toolbar: sends a
 * request to retrieve metadata using Calais web service
 */
lore.textm.requestTextMiningMetadata = function() {
    if (!lore.ui.textminingtab) {
        return;
    }
    try{
    // process RDFa
    var doc = lore.util.getContentWindow().document;
    var contentElem = jQuery('body',doc);
    
    var myrdf = contentElem.rdfa();
    var triples = myrdf.databank.triples();
    lore.debug.tm("triples object", triples);
    lore.debug.tm("json dump", Ext.util.JSON.encode(jQuery.rdf.dump(triples)));
    var ser = new XMLSerializer();
    var rdfxml = jQuery.rdf.dump(triples,{'format': 'application/rdf+xml', 'namespaces': {'austlit': 'http://austlit.edu.au/owl/austlit.owl#'}});
    lore.ui.textminingtab.body.update("Extracted the following RDF: <pre style='font-size:smaller;color:#51666b;'>"
        + Ext.util.Format.htmlEncode(XML(ser.serializeToString(rdfxml)).toXMLString()) + "</pre>");
    
    } catch (ex){
        lore.debug.tm("exception processing rdfa",ex);
    }

    /*var ocParams = '<c:params xmlns:c="http://s.opencalais.com/1/pred/">'
            + '<c:processingDirectives c:contentType="text/txt" c:outputFormat="application/json"></c:processingDirectives>'
            + '<c:userDirectives c:allowDistribution="true" c:allowSearch="true"/><c:externalMetadata />'
            + '</c:params>';

    // set contentStr to current main window contents
    // TODO: do this better in terms of preserving whitespace and ignoring
    // script and hidden elems
    var contentStr = window.top.getBrowser().selectedBrowser.contentWindow.document.body.textContent
            .normalize().escapeHTML();
    // alert(contentStr);
    // truncate - web service can only handle 100,000 chars
    if (contentStr.length > 99999) {
        contentStr = str.substring(0, 99999);
    }

    Ext.Ajax.request({
        url : 'http://api.opencalais.com/enlighten/calais.asmx/Enlighten',
        success : lore.textm.handleOpenCalaisMetadata,
        failure : function(resp) {
            lore.debug.tm("Unable to obtain OpenCalais metadata", resp);
            lore.ui.loreWarning("Unable to obtain OpenCalais metadata");
        },
        params : {
            licenseID : lore.textm.OPENCALAIS_KEY,
            content : contentStr, // Ext.Ajax does urlencoding 
            paramsXML : ocParams
        }
    });*/
   
    //lore.ui.textminingtab.body.update(myresult);
}
