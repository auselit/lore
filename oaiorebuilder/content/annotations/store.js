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
 * @namespace
 * @name lore.store
 */ 
 var EXPORTED_SYMBOLS = ['store'];
 
 store =  {
	/** @lends lore.store */
	
	 uidcache: {},
	 datastores : {},
	 uid: "",
	 
	 /**
	  * Set the context for the current cache
	  * Subsequent calls to the store will be using
	  * this supplied context uid
	  * @param {String} uid The context uid to use
	  */
	 setCacheContext : function (uid) {
	 	store.uid = uid;
		store.datastores = store.uidcache[uid];
	 },
	 
	 /**
	  * Retrieve the store given the data store name 
	  * and optionall the context uid 
	  * @param {String} datastoreName The data store name
	  * @param {String} uid (Optional) The context uid
	  */
	 get : function (datastoreName,  uid) {
	 	if ( uid ) {
			
			var datastores = store.uidcache[uid]
			if (datastores) {
				return datastores[datastoreName];
			} else {
				return null;
			}
		}
		return store.datastores[datastoreName];
	 },
	 
	/**
	  * 'Hash' the store given the data store name, the store 
	  * and optionally the context uid 
	  * @param {String} datastoreName The data store name
	  * @param {Object} datastore The data store to hash into the supplied/current context
	  * @param {String} uid (Optional) The context uid
	  */
	 set : function (datastoreName, datastore, uid ) {
	 	if (uid) {
			if (!store.uidcache[uid]) {
				store.uidcache[uid] = {};
			}
			
			(store.uidcache[uid])[datastoreName] = datastore;
		}
		else {
			store.datastores[datastoreName] = datastore;
		}
	 },
	 
	 /**
	  * Create a store for the supplied/current cache context
	  * @param {String} datastoreName The datastore name 
	  * @param {Object} thestore The store
	  * @param {String} uid The context uid
	  */
	 create : function (datastoreName, thestore, uid) {
	 	var datastores = store.datastores;
		if ( uid ) {
			datastores = store.uidcache[uid];
		}
		store.datastores[datastoreName] = thestore;
		
	 	return store.datastores[datastoreName];	
	 }
 }