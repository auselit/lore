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
 * Update the resource map dc:creator property
 * 
 * @param {}
 *            creator The new value for dc:creator
 */
lore.ui.setdccreator = function(creator) {
	var remprops = lore.ui.grid.getSource();
	remprops["dc:creator"] = creator;
	lore.ui.grid.setSource(remprops);
	lore.defaultCreator = creator;
}
/**
 * Set the global variables for the repository access URLs
 * 
 * @param {}
 *            rdfrepos The repository access URL
 * @param {}
 *            rdfrepostype The type of the repository (eg sesame, fedora)
 * @param {}
 *            annoserver The annotation server access URL
 */
lore.ui.setRepos = function(rdfrepos, rdfrepostype, annoserver) {
	lore.ore.reposURL = rdfrepos; // compound object repository
	lore.ore.reposType = rdfrepostype; // type of compound object repository
	// (eg sesame)
	lore.anno.annoURL = annoserver; // annotation server
}
/**
 * Display an informational message in the status bar
 * 
 * @param {}
 *            message The message to display
 */
lore.ui.loreInfo = function(message) {
	lore.ui.lorestatus.setStatus({
				text : message,
				iconCls : 'info-icon',
				 clear : {wait: 3000}
			});
     
}
/**
 * Display an warning message in the status bar
 * 
 * @param {}
 *            message The message to display
 */
lore.ui.loreWarning = function(message) {
	lore.ui.lorestatus.setStatus({
				text : message,
				iconCls : 'warning-icon',
				clear : { wait : 3000}
			});
}
/**
 * Display an error message in the status bar
 * 
 * @param {}
 *            message The message to display
 */
lore.ui.loreError = function(message) {
	lore.ui.lorestatus.setStatus({
				text : message,
				iconCls : 'error-icon',
				clear : {wait: 3000}
			});
}

/**
 * Clear nodes from sources tree
 * 
 * @param {Object} theTree The tree node to clear
 */
lore.ui.clearTree = function(treeRoot) {
	while (treeRoot.firstChild) {
		treeRoot.removeChild(treeRoot.firstChild);
	}
}

/**
 * Update the source lists to show annotations and compound objects that
 * reference the resource currently loaded in the web browser
 * 
 * @param {}
 *            contextURL The URL of the resource currently loaded in the browser
 */
lore.ui.updateSourceLists = function(contextURL) {
	lore.ui.currentURL = contextURL; // store the contextURL
     
	if (lore.ui.lorevisible) {
       
        //if (!lore.ui.disabled || !lore.ui.disabled.disable_annotations){
		if (lore.anno && lore.anno.updateAnnotationsSourceList) {
			lore.anno.updateAnnotationsSourceList(contextURL);
		}
        //}
        //if (!lore.ui.disabled || !lore.ui.disabled.disable_compoundobjects){
		if (lore.ore && lore.ore.updateCompoundObjectsSourceList) {
			lore.ore.updateCompoundObjectsSourceList(contextURL);
		}
		//}
		lore.ui.loadedURL = contextURL;
	}
}

lore.ui.loreOpen = function() {
	lore.ui.lorevisible = true;
	if (lore.ui.currentURL && lore.ui.currentURL != 'about:blank'
			&& lore.ui.currentURL != ''
			&& (!lore.ui.loadedURL || lore.ui.currentURL != lore.ui.loadedURL)) {
		lore.ui.updateSourceLists(lore.ui.currentURL);
		lore.ui.loadedURL = lore.ui.currentURL;
	}
}
lore.ui.loreClose = function() {
	lore.ui.lorevisible = false;
}





