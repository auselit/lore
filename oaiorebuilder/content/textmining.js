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
 * Text mining aspects of LORE
 * @namespace
 * @name lore.textm
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
lore.textm.processRDFa = function() {
    try{
    // process RDFa in current page
    var doc = lore.util.getContentWindow().document;
    var contentElem = jQuery('body',doc);
    lore.ui.textminingtab.body.update("Found the following from RDFa:<br>");
    var myrdf = contentElem.rdfa();
    var triples = myrdf.databank.triples();
    lore.debug.tm("triples object", triples);
    lore.debug.tm("json dump", Ext.util.JSON.encode(jQuery.rdf.dump(triples)));
    for (var t = 0; t < triples.length; t++){
        var triple = triples[t];
        var triplestr = triple.toString().escapeHTML();
        // add a border around elements with rdfa with a hover to disply the triple
        if (triple.source.style){
	        triple.source.style.border="0.5px solid #eeeeee";
	        jQuery(triple.source).simpletip({
	            content: '&nbsp;<img src="chrome://lore/skin/icons/rdf.png">&nbsp;' +  triplestr,
	            showEffect: 'custom',
	            fixed:true,
                position:["-20","0"],
	            showCustom: function(){
	              try{
	                //lore.debug.ore("showcustom",this);
	                this.context.style.padding="2px";
	                this.context.style.position= 'absolute';
	                this.context.style.opacity = "1";
	                this.context.style.backgroundColor="#fcfcfc";
	                this.context.style.fontSize = "9pt";
	                this.context.style.fontWeight = "normal";
	                this.context.style.color="#51666b";  
	                this.context.style.border= '1.5px solid orange';
	                this.context.style.zIndex="3";  
	                jQuery(this).animate({
	                    width: 'auto',
	                    display: 'block'
	                },400);
                    
	              } catch (ex){
	                lore.debug.ore("exception in hover",ex);
	              }
	            }
	        });
        }    
    }
    myrdf.prefix('rdf',lore.constants.RDF_SYNTAX_NS).where('?athing rdf:type ?atype').each(function(){
       
       var resultStr = this.athing.value + " is a " + this.atype.value + "<br>";
       lore.ui.textminingtab.body.insertHtml('beforeEnd',resultStr);
       myrdf.about(this.athing).each(function(){
        lore.debug.ore("properties of thing "+ this.property.value.toString(),this);
        
       });
       
    });
    var ser = new XMLSerializer();
    var rdfxml = jQuery.rdf.dump(triples,{'format': 'application/rdf+xml', 'namespaces': {'austlit': 'http://austlit.edu.au/owl/austlit.owl#'}});
    lore.ui.textminingtab.body.insertHtml('beforeEnd',"The RDF/XML is:<pre style='font-size:smaller;color:#51666b;'>"
        + Ext.util.Format.htmlEncode(XML(ser.serializeToString(rdfxml)).toXMLString()) + "</pre>");
    
    } catch (ex){
        lore.debug.tm("exception processing rdfa",ex);
    }
}
/**
 * Triggered when the user selects the Calais button from the toolbar: sends a
 * request to retrieve metadata using Calais web service
 */
lore.textm.requestTextMiningMetadata = function() {
    if (!lore.ui.textminingtab) {
        return;
    }
    
    lore.textm.processRDFa();
    // TODO: call semantic text mining services such as Open Calais
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
