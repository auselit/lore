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
 
 var EXPORTED_SYMBOLS = ['store'];
 
 /** 
  * Store object.  Used for storing/caching objects.
  * Basically a Map that contains Maps.
  * @class lore.global.store
  * @singleton
  */
 store =  {
	
	 uidcache: {},
	 datastores : {},
	 uid: "",
	 METADATA : "METADATA",
	 caching: true,
	 
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
	 
	 setCaching: function(caching) {
	 	this.caching = caching;
	 },
	 
	 /**
	  * Retrieve the store given the data store name 
	  * and optionall the context uid 
	  * @param {String} datastoreName The data store name
	  * @param {String} uid (Optional) The context uid
	  */
	 get : function (datastoreName,  uid) {
	 	var datastores = store.datastores;
		if ( uid ) {
			datastores = store.uidcache[uid];
		}

		if (datastores) {
			this.invalidate(datastores, datastoreName);			
			return datastores[datastoreName];
		} else {
			return null;
		}
	 },
	 
	 /**
	  * Invalidate caching if validity timeout has been reached
	  * @param {Object} s Datastores map
	  * @param {String} dsName Datstore name
	  */
	 invalidate: function(s, dsName) {
	 	var meta = s[this.METADATA];
		if ( !meta || meta.timeout[dsName] == 0)
			return;
			
	 	if ( !this.caching || ((new Date().getTime() - meta.timestamp[dsName]) > meta.timeout[dsName])) {
			s[dsName] = null;
		} 
	 },
	 
	/**
	  * 'Hash' the store given the data store name, the store 
	  * and optionally the context uid 
	  * @param {String} datastoreName The data store name
	  * @param {Object} datastore The data store to hash into the supplied/current context
	  * @param {String} uid (Optional) The context uid
	  */
	 set : function (datastoreName, datastore, uid, timeout ) {
	 	var s;
		if (uid) {
			if (!store.uidcache[uid]) {
				store.uidcache[uid] = {};
			}
			s = store.uidcache[uid];
		} else {
			s = store.datastores;
		}
		s[datastoreName] = datastore;
		if ( !s[this.METADATA])
			s[this.METADATA] = { timestamp: {}, timeout: {} };
			
		s[this.METADATA].timestamp[datastoreName] = new Date().getTime();
		s[this.METADATA].timeout[datastoreName] = timeout || 0;
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
	 },
	 
	 removeCache : function( datastoreName, uid ) {
	 	if ( store.uidcache[uid])
			(store.uidcache[uid])[datastoreName] = null;
	 }
 };