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

 
 /*retrieveCache = function (uid) {
 	if (! lore.store.uidcache) {
		lore.store.uidcache = {};
	}
	return lore.store.uidcache[uid];	
 }*/
 
 lore.store.uidcache = {};
 lore.store.datastores = {};
 lore.store.uid = "";
 
 lore.store.setCacheContext = function (uid) {
 	lore.store.uid = uid;
	lore.store.datastores = lore.store.uidcache[uid];
 }
 /**
  * 
  * @param {Object} datastoreName
  * @param {Object} uid
  */
 lore.store.get = function (datastoreName,  uid) {
 	if ( uid ) {
		lore.debug.ui("Retrieving datastore for : " +uid, lore.store.uidcache);
		var datastores = lore.store.uidcache[uid]
		if (datastores) {
			return datastores[datastoreName];
		} else {
			return null;
		}
	}
	return lore.store.datastores[datastoreName];
 }
 
 /**
  * 
  * @param {Object} datastoreName
  * @param {Object} uid
  * @param {Object} datastore
  */
 lore.store.set = function (datastoreName, datastore, uid ) {
 	if (uid) {
		if (!lore.store.uidcache[uid]) {
			lore.store.uidcache[uid] = {};
		}
		lore.debug.ui("Setting datastore for : " + uid, lore.store.uidcache);
		(lore.store.uidcache[uid])[datastoreName] = datastore;
	}
	else {
		lore.store.datastores[datastoreName] = datastore;
	}
 }
 
 /**
  * 
  * @param {Object} datastore
  * @param {Object} uid
  * @param {Object} type
  */
 lore.store.create = function (datastoreName, thestore, uid) {
 	var datastores = lore.store.datastores;
	if ( uid ) {
		datastores = lore.store.uidcache[uid];
	}
	lore.store.datastores[datastoreName] = thestore;
	
 	return lore.store.datastores[datastoreName];	
 }
 
 
 lore.store.load = function (datastore, uid, type) {
 }