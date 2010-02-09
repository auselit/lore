
lore.ore.FedoraAdapter = Ext.extend(lore.ore.RepositoryAdapter,{
/*getCompoundObjects : function(matchuri, matchpred, matchval, isSearchQuery){
    
},*/
/*loadCompoundObject : function(remid){
    
},*/
saveCompoundObject : function (remid,therdf){
    lore.ore.ui.loreError("Saving to Fedora not yet implemented");
    var soaptempl = "<soap:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">"
    + "<soap:Body> "
            // + "<GetInfoByZIP xmlns=\"http://www.webserviceX.NET\"> <USZip>string</USZip> </GetInfoByZIP>"
    + "</soap:Body></soap:Envelope>";
}
/*deleteCompoundObject : function(remid){

}*/
});