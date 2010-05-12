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
 
// New Fedora adapter that uses the REST API : currently incomplete
lore.ore.FedoraAdapter = Ext.extend(lore.ore.RepositoryAdapter,{
    constructor: function(config){
      this.idPrefix = "demo:";
      lore.ore.FedoraAdapter.superclass.constructor.call(this, config); 
    },
getCompoundObjects : function(matchuri, matchpred, matchval, isSearchQuery){
    
},
loadCompoundObject : function(remid, callback){
    //var fedoraid = 'demo:' + lore.global.util.splitTerm(remid).term;
    Ext.Ajax.request({
                url: this.reposURL + "/objects/" + remid + "/export",
                method: "GET",
                disableCaching: false,
                success: function(){
                    // TODO: callback expects RDF: convert from FOXML to RDF/XML
                    var rdf = "";
                    callback(rdf);
                },
                failure: function(resp, opt){
                    lore.debug.ore("Unable to load compound object " + opt.url, resp);
                }
            }); 
},
saveCompoundObject : function (coid,thexml,callback){
    // /objects/ [{pid}| new] ? [label] [format] [encoding] [namespace] [ownerId] [logMessage] [ignoreMime]

    // creates a new compound object
    // TODO: allow modification of existing
    // FIXME:
    var foxml = lore.ore.createFOXML();
    //var remid = 'demo:' + lore.global.util.splitTerm(lore.ore.cache.getLoadedCompoundObjectUri() ).term;
    lore.debug.ore("saving foxml to fedora",foxml);
    try {                  
           var xmlhttp2 = new XMLHttpRequest();
           xmlhttp2.open("POST",
               this.reposURL + "/objects/" + remid + "?format=info:fedora/fedora-system:FOXML-1.1", true);
           xmlhttp2.onreadystatechange = function() {
                if (xmlhttp2.readyState == 4) {
                    if (xmlhttp2.status == 201) {
                        lore.debug.ore("fedora: Compound object saved",xmlhttp2);
                        lore.ore.ui.loreInfo("Compound object " + remid + " saved");
                        callback(remid);
                    } else {
                        lore.ore.ui.loreError('Unable to save to repository' + xmlhttp2.responseText);
                        lore.debug.ore("Unable to save to repository",xmlhttp2);
                        Ext.Msg.show({
                            title : 'Problem saving RDF',
                            buttons : Ext.MessageBox.OKCANCEL,
                            msg : ('There was an problem saving to the repository: ' + xmlhttp2.responseText + '<br>Please try again in a few minutes or save your compound object to a file using the <i>Export to RDF/XML</i> menu option from the toolbar and contact the Aus-e-Lit team for further assistance.')
                        });
                        
                    }
                }
            };
            xmlhttp2.setRequestHeader("Content-Type", "text/xml");
            xmlhttp2.send(foxml); 
        } catch (e) {
            xmlhttp = false;
        }
}/*,
deleteCompoundObject : function(remid,callback){

}
TODO: getExploreData 
*/
});