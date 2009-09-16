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
 	if (! store.uidcache) {
		store.uidcache = {};
	}
	return store.uidcache[uid];	
 }*/
 
 var EXPORTED_SYMBOLS = ['store'];
 
 store = {};
 store.uidcache = {};
 store.datastores = {};
 store.uid = "";
 
 store.setCacheContext = function (uid) {
 	store.uid = uid;
	store.datastores = store.uidcache[uid];
 }
 /**
  * 
  * @param {Object} datastoreName
  * @param {Object} uid
  */
 store.get = function (datastoreName,  uid) {
 	if ( uid ) {
		
		var datastores = store.uidcache[uid]
		if (datastores) {
			return datastores[datastoreName];
		} else {
			return null;
		}
	}
	return store.datastores[datastoreName];
 }
 
 /**
  * 
  * @param {Object} datastoreName
  * @param {Object} uid
  * @param {Object} datastore
  */
 store.set = function (datastoreName, datastore, uid ) {
 	if (uid) {
		if (!store.uidcache[uid]) {
			store.uidcache[uid] = {};
		}
		
		(store.uidcache[uid])[datastoreName] = datastore;
	}
	else {
		store.datastores[datastoreName] = datastore;
	}
 }
 
 /**
  * 
  * @param {Object} datastore
  * @param {Object} uid
  * @param {Object} type
  */
 store.create = function (datastoreName, thestore, uid) {
 	var datastores = store.datastores;
	if ( uid ) {
		datastores = store.uidcache[uid];
	}
	store.datastores[datastoreName] = thestore;
	
 	return store.datastores[datastoreName];	
 }
 
 
 store.load = function (datastore, uid, type) {
 }