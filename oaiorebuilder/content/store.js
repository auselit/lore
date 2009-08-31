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

 
 /*retrieveCache = function (uri) {
 	if (! lore.store.uricache) {
		lore.store.uricache = {};
	}
	return lore.store.uricache[uri];	
 }*/
 
 lore.store.uricache = {};
 lore.store.datastores = {};
 lore.store.uri = "";
 
 lore.store.setCacheContext = function (uri) {
 	lore.store.uri = uri;
	lore.store.datastores = lore.store.uricache[uri];
 }
 /**
  * 
  * @param {Object} datastoreName
  * @param {Object} uri
  */
 lore.store.get = function (datastoreName,  uri) {
 	if ( uri ) {
		var datastores = lore.store.uricache[uri]
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
  * @param {Object} uri
  * @param {Object} datastore
  */
 lore.store.set = function (datastoreName, datastore, uri ) {
 	if (uri) {
		(lore.store.uricache[uri])[dataStoreName] = datastore;
	}
	else {
		lore.store.datastores[datastoreName] = datastore;
	}
 }
 
 /**
  * 
  * @param {Object} datastore
  * @param {Object} uri
  * @param {Object} type
  */
 lore.store.create = function (datastoreName, thestore, uri) {
 	var datastores = lore.store.datastores;
	if ( uri ) {
		datastores = lore.store.uricache[uri];
	}
	lore.store.datastores[datastoreName] = thestore;
	
 	return lore.store.datastores[datastoreName];	
 }
 
 
 lore.store.load = function (datastore, uri, type) {
 }