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
 * History manager that observes the browser history and updates 
 * the list of recently viewed compound objects and records new visits
 * @param {lore.ore.model.CompoundObjectListManager} listManager
 */
lore.ore.model.HistoryManager = function (listManager){
    this.listManager = listManager;
    this.historyService = Components.classes["@mozilla.org/browser/nav-history-service;1"]
              .getService(Components.interfaces.nsINavHistoryService);
    this.historyService.addObserver(this,false);
    this.mozannoService = Components.classes["@mozilla.org/browser/annotation-service;1"]
                      .getService(Components.interfaces.nsIAnnotationService);
    this.loadHistory();
    
};
lore.ore.model.HistoryManager.prototype = {
    /** 
     * Add a visit for a compound object. The time of the visit will be the current time
     * @param {} remurl The URI of the compound object
     * @param {} title The title of the compound object
     */
      addToHistory: function (remurl, title){
        try {
		     var theuri = Components.classes["@mozilla.org/network/io-service;1"].
		         getService(Components.interfaces.nsIIOService).
		         newURI(remurl, null, null);
		     // Use Firefox annotation to mark it as a compound object
		     this.mozannoService.setPageAnnotation(theuri, "lore/compoundObject", 
		        title, 0, this.mozannoService.EXPIRE_WITH_HISTORY);
		     // Add it to browser history
		     var visitDate = new Date();
		     var browserHistory = this.historyService.QueryInterface(Components.interfaces.nsIBrowserHistory);
		     browserHistory.addPageWithDetails(theuri,title,visitDate.getTime() * 1000);
		     this.listManager.add(
		        [new lore.ore.model.CompoundObjectSummary(
		        {
		            'uri': remurl,
		            'title': title,
		            'accessed': visitDate
		        })],
		        'history'
		     );
		  } catch (e){
		      lore.debug.ore("Error adding compound object to browser history: " + remurl,e);
		  }
      },
      /**
       * Load compound objects from the browse history into the compound objects history list
       */
      loadHistory : function (){
        try{
		    var query = this.historyService.getNewQuery();
		    query.annotation = "lore/compoundObject";
		    var options = this.historyService.getNewQueryOptions();
		    options.sortingMode = options.SORT_BY_DATE_ASCENDING;
		    options.includeHidden = true;
		    options.maxResults = 20;
		    var result = this.historyService.executeQuery(query, options);
		    result.root.containerOpen = true;
		    var count = result.root.childCount;
		    for (var i = 0; i < count; i++) {
		        var theobj = {};
		        var node = result.root.getChild(i);
		        var title = node.title;
		        var uri = node.uri;
		        //var visited = node.accessCount;
		        var lastVisitedTimeInMicrosecs = node.time;
		        var thedate = new Date();
		        thedate.setTime(lastVisitedTimeInMicrosecs / 1000);
		        this.listManager.add(
		                [new lore.ore.model.CompoundObjectSummary(
		                {
		                    'uri': uri,
		                    'title': title,
		                    'accessed': thedate
		                })],
		                'history'
		        );
		    }
		    result.root.containerOpen = false;
		  } catch (e) {
		    lore.debug.ore("Error retrieving history",e);
		  }
      },
      onBeginUpdateBatch: function() {
      },
      /**
       * Reload the list when the browse history has been updated in a batch
       */
      onEndUpdateBatch: function() {
        this.listManager.clear("history");
        this.loadHistory();
      },
      onVisit: function(aURI, aVisitID, aTime, aSessionID, aReferringID, aTransitionType) {
      },
      onTitleChanged: function(aURI, aPageTitle) {
      },
      /** Remove an entry from the list if it has been removed from the browser history
       * @param {} aURI The URI that has been removed
       */
      onDeleteURI: function(aURI) {
        this.listManager.remove(aURI.spec);
      },
      /** Clear the list if the browser history has been cleared **/
      onClearHistory: function() {
        this.listManager.clear("history");
      },
      onPageChanged: function(aURI, aWhat, aValue) {
      },
      onPageExpired: function(aURI, aVisitTime, aWholeEntry) {
      },
      QueryInterface: function(iid) {
        if (iid.equals(Components.interfaces.nsINavHistoryObserver) ||
            iid.equals(Components.interfaces.nsISupports)) {
          return this;
        }
        throw Components.results.NS_ERROR_NO_INTERFACE;
      }
};