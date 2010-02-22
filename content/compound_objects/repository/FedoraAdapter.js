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