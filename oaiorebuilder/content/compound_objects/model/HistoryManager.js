lore.ore.model.HistoryManager = function (listManager){
    this.listManager = listManager;
    this.historyService = Components.classes["@mozilla.org/browser/nav-history-service;1"]
              .getService(Components.interfaces.nsINavHistoryService);
    this.historyService.addObserver(this,false);
    this.mozannoService = Components.classes["@mozilla.org/browser/annotation-service;1"]
                      .getService(Components.interfaces.nsIAnnotationService);
    this.getHistory();
    
};
lore.ore.model.HistoryManager.prototype = {
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
      getHistory : function (){
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
		    lore.debug.ore("Error displaying history",e);
		  }
      },
      onBeginUpdateBatch: function() {
      },
      onEndUpdateBatch: function() {
        this.listManager.clear("history");
        this.getHistory();
      },
      onVisit: function(aURI, aVisitID, aTime, aSessionID, aReferringID, aTransitionType) {
      },
      onTitleChanged: function(aURI, aPageTitle) {
      },
      onDeleteURI: function(aURI) {
        this.listManager.remove(aURI.spec);
      },
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