Ext.namespace("lore.ore.model");
/**
 * History manager that observes the browser history and updates 
 * the list of recently viewed Resource Maps and records new visits
 * @class lore.ore.model.HistoryManager
 * @param {lore.ore.model.CompoundObjectListManager} listManager
 */
lore.ore.model.HistoryManager = function (listManager){
    this.listManager = listManager;
    if (lore.ore.firefox){
        this.historyService = Components.classes["@mozilla.org/browser/nav-history-service;1"]
                  .getService(Components.interfaces.nsINavHistoryService);
        this.historyService.addObserver(this,false);
        this.mozannoService = Components.classes["@mozilla.org/browser/annotation-service;1"]
                          .getService(Components.interfaces.nsIAnnotationService);
    } else {
        var that = this;
        // make sure Resource Maps are not displayed if removed from history
        chrome.history.onVisitRemoved.addListener(function(removed){
            if (removed.allHistory && removed.urls){
                for (var i = 0 ; i < removed.urls.length; i++){
                    this.listManager.remove(removed.urls[i]);
                }
            }
        });
    }
    this.loadHistory();
};
Ext.apply(lore.ore.model.HistoryManager.prototype, {

    /** 
     * Add a visit for a Resource Map. The time of the visit will be the current time
     * @param {} remurl The URI of the Resource Map
     * @param {} title The title of the Resource Map
     */
      addToHistory: function (remurl, title, isPrivate){
        var storeHistoryMetadata= function(key,value){
            window.localStorage.removeItem(key);
            window.localStorage.setItem(key, value);
         };
        try {
            if (lore.ore.firefox){
                 var theuri = Components.classes["@mozilla.org/network/io-service;1"].
                     getService(Components.interfaces.nsIIOService).
                     newURI(remurl, null, null);
                 
                 // Add it to browser history
                 var visitDate = new Date();
                 var browserHistory = this.historyService.QueryInterface(Components.interfaces.nsIBrowserHistory);
                 browserHistory.addPageWithDetails(theuri,title,visitDate.getTime() * 1000);
                 // Use Firefox annotation to mark it as a Resource Map
                 this.mozannoService.setPageAnnotation(theuri, "lore/compoundObject", 
                    title, 0, this.mozannoService.EXPIRE_WITH_HISTORY);
                 this.mozannoService.setPageAnnotation(theuri, "lore/isPrivate", 
                    "" + isPrivate, 0, this.mozannoService.EXPIRE_WITH_HISTORY);
            } else {
                // add to Google Chrome history
                chrome.history.addUrl({url:remurl});
                // TODO: use localStorage to remember isPrivate etc
                storeHistoryMetadata(remurl+ ".title", title);
                if (isPrivate){
                    storeHistoryMetadata(remurl+".isPrivate",isPrivate);
                }
                
            }
             this.listManager.add(
                [
                {
                    'uri': remurl,
                    'title': title,
                    'accessed': visitDate,
                    'isPrivate': isPrivate
                }
                ],
                'history'
             );
          } catch (e){
              lore.debug.ore("Error adding Resource Map to browser history: " + remurl,e);
          }
         
          
      },
      /**
       * Remove records of page visit from history
       * @param {} remurl
       */
      deleteFromHistory: function(remurl){
        if (lore.ore.firefox) {
            var theuri = Components.classes["@mozilla.org/network/io-service;1"].
                     getService(Components.interfaces.nsIIOService).
                     newURI(remurl, null, null);
            var browserHistory = this.historyService.QueryInterface(Components.interfaces.nsIBrowserHistory);
            browserHistory.removePage(theuri);
        } else {
            // delete from Google Chrome history and localStorage
            chrome.history.deleteUrl({url:remurl});
            window.localStorage.removeItem(remurl+".title");
            window.localStorage.removeItem(remurl+".isPrivate");
        }
      },
      /**
       * Load Resource Maps from the browse history into the Resource Maps history list
       */
      loadHistory : function (){
        try{
            if (lore.ore.firefox){
                var query = this.historyService.getNewQuery(); 
                query.annotation = "lore/compoundObject";
                var ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
                var options = this.historyService.getNewQueryOptions();
                options.sortingMode = options.SORT_BY_DATE_ASCENDING;
                options.includeHidden = true;
                //options.maxResults = 20;
                var result = this.historyService.executeQuery(query, options);
                result.root.containerOpen = true;
                var count = result.root.childCount;
                var coList = [count];
                var annotationService = Components.classes["@mozilla.org/browser/annotation-service;1"]
                            .getService(Components.interfaces.nsIAnnotationService);
                for (var i = 0; i < count; i++) {
                    var theobj = {};
                    var node = result.root.getChild(i);
                    var title = node.title;
                    var uri = node.uri;
                    //var visited = node.accessCount;
                    var lastVisitedTimeInMicrosecs = node.time;
                    var thedate = new Date();
                    thedate.setTime(lastVisitedTimeInMicrosecs / 1000);
                    var theCO = {
                        'uri': uri,
                        'title': title,
                        'accessed': thedate
                    }
                    try{
                        var aUri = ios.newURI(uri,null,null);
                        if (this.mozannoService.pageHasAnnotation(aUri,"lore/isPrivate")){
                            theCO.isPrivate = this.mozannoService.getPageAnnotation(aUri,"lore/isPrivate") == "true";
                        } 
                    } catch (f){
                        lore.debug.ore("Error getting isPrivate from history",f);
                    }
                    coList[i] = theCO;
                }
                if (count > 0){
                    this.listManager.add(coList, 'history');
                }
                result.root.containerOpen = false;
            } else {
                // construct list from Google Chrome history
                
                var that = this;
                chrome.history.search({text: '' },function(results){
                    var count = 0;
                    var coList = [];
                    for (var i = 0; i < results.length; i++){
                        var historyItem = results[i];
                        if(historyItem.url){
                            var localTitle = window.localStorage.getItem(historyItem.url + ".title");
                            if (localTitle){
                                count++;
                                var theCO = {
                                    'uri': historyItem.url,
                                    'title': localTitle,
                                    //'accessed': historyItem.lastVisitTime
                                }
                                coList.push(theCO);
                            } 
                        }
                    }
                    if (count > 0){
                        that.listManager.add(coList, 'history');
                    }
                });
            }
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
      onVisit: function(aURI, aVisitID, aTime, aSessionID, aReferringID, aTransitionType, aGUID, aAdded) {
      },
      onTitleChanged: function(aURI, aPageTitle) {
      },
      /** Remove an entry from the list if it has been removed from the browser history
       * @param {} aURI The URI that has been removed
       */
      onDeleteURI: function(aURI, aGUID) {
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
});