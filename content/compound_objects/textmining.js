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
 
 /*
  * @include  "/oaiorebuilder/content/compound_objects/RdfStore.js"
  * @include "/oaiorebuilder/content/compound_objects/RdfGrid.js"
  */
  
/**
 * Handler function for successful return of Ajax request to Calais web service
 * 
 * @param {Object} resp
 */
lore.ore.textm.processRDFa = function(tmtab) {
    try{
    // process RDFa in current page
    var doc = lore.global.util.getContentWindow(window).document;
    var contentElem = jQuery('body',doc);
    tmtab.body.update("Found the following from RDFa:<br>");
    var myrdf = contentElem.rdfa();
    var triples = myrdf.databank.triples();
    lore.debug.ore("triples object", triples);
    lore.debug.ore("json dump", Ext.util.JSON.encode(jQuery.rdf.dump(triples)));
    for (var t = 0; t < triples.length; t++){
        var triple = triples[t];
        var triplestr = lore.global.util.escapeHTML(triple.toString());
        // add a border around elements with rdfa with a hover to disply the triple
        if (triple.source.style){
            triple.source.style.border="0.5px solid #eeeeee";
            jQuery(triple.source).simpletip({
                content: '&nbsp;<img src="../../skin/icons/ore/rdf.png">&nbsp;' +  triplestr,
                showEffect: 'custom',
                fixed:true,
                position:["-20","0"],
                showCustom: function(){
                  try{
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
    myrdf.prefix('rdf',lore.constants.NAMESPACES["rdf"]).where('?athing rdf:type ?atype').each(function(){
       
       var resultStr = this.athing.value + " is a " + this.atype.value + "<br>";
       tmtab.body.insertHtml('beforeEnd',resultStr);
       myrdf.about(this.athing).each(function(){
        
       });
       
    });
    
    /*var myrdfstore = new Ext.ux.RdfStore(myrdf.databank); 

    var rdfgrid = new Ext.ux.RdfGrid({
       store: myrdfstore
    });

    var win = new Ext.Window({
       items: rdfgrid,
       width: 500,
       height:350,
       plain: true
    });
    win.show(this);
    */
    var ser = new XMLSerializer();
    var rdfxml = jQuery.rdf.dump(triples,{'format': 'application/rdf+xml', 'namespaces': {'austlit': 'http://austlit.edu.au/owl/austlit.owl#'}});
    tmtab.body.insertHtml('beforeEnd',"The RDF/XML is:<pre style='font-size:smaller;color:#51666b;'>"
        + Ext.util.Format.htmlEncode(XML(ser.serializeToString(rdfxml)).toXMLString()) + "</pre>");
    } catch (ex){
        lore.debug.tm("exception processing rdfa",ex);
    }
};

/**
 * Triggered when the user selects the Calais button from the toolbar: sends a
 * request to retrieve metadata using Calais web service
 */
lore.ore.doTextMining = function() {
    lore.ore.ui.vp.info("Please wait while semantic entities are identified");
    try{
    // TODO: do this async
    //lore.ore.textm.processRDFa(tmtab);
    
    var ocParams = '<c:params xmlns:c="http://s.opencalais.com/1/pred/">'
            + '<c:processingDirectives c:contentType="text/html" c:outputFormat="rdf/xml"></c:processingDirectives>'
            + '<c:userDirectives c:allowDistribution="true" c:allowSearch="true"/><c:externalMetadata />'
            + '</c:params>';

    // set contentStr to current selection
    var selection = lore.global.util.getContentWindow(window).getSelection();
    if (!selection || !selection.toString()){
        lore.ore.ui.vp.warning("Please highlight text to be analysed from the current page prior to selecting the text mining button");
    }
    var contentStr = selection.toString();
    
    // truncate - web service can only handle 100,000 chars
    if (contentStr.length > 99999) {
        lore.ore.ui.vp.info("Selection too long, identifying entities from the first 100,000 characters only");
        contentStr = str.substring(0, 99999);
    }

    contentStr = contentStr.replace(/"/g,"\\\"");
    if (lore.ore.textm.tmkey){
	    Ext.Ajax.request({
	        url : "http://api.opencalais.com/enlighten/rest/",
	        success : lore.ore.textm.handleOpenCalaisMetadata,
	        failure : function(resp) {
	            lore.debug.tm("Unable to obtain OpenCalais metadata", resp);
	            lore.ore.ui.vp.warning("Unable to obtain OpenCalais metadata");
	        },
	        params : {
	            licenseID : lore.ore.textm.tmkey,
	            content : contentStr, // Ext.Ajax does urlencoding 
	            paramsXML : ocParams
	        }
	    });
    } else {
        lore.ore.ui.vp.error("Please enter your text mining key in the preferences");
    }
    } catch (e){
        lore.debug.tm("error in doTextMining",e);
    }
};
lore.ore.textm.handleOpenCalaisMetadata = function(resp) {
    try{
    var res = resp.responseXML;
    var databank = jQuery.rdf.databank();
    databank.load(res);
    lore.debug.tm("Text mining RDF result",databank);
    var rdfxml = databank.dump({format:'application/rdf+xml',serialize:true});
    lore.debug.tm("Text mining RDF/XML",rdfxml);
    } catch (e){
        lore.debug.tm("error in text mining RDF",e);
    }
    /* Errors look like this:
     <Error Method="ProcessText" CalaisSessionID="(Session ID here)" CalaisVersion="(Version Number here)">
        <Exception> (Error Message Here) [SID= (Session ID here)]</Exception>
      </Error>
     */
    /*
    Ext.getCmp("textmining").body.update(res + lore.ore.textm.POWEREDBY_CALAIS);
    */
};
