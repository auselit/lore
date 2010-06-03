/* 
 * Represents a slideshow
 * 
 */
lore.ore.ui.SlideShowPanel = Ext.extend(Ext.Panel,{
    layout:'card',
    activeItem: 0,
    playing: false,
    interval: 3,
    bodyStyle: 'padding:3px',
    defaults: {
        border:false
    },      
    setActiveItem: function(i){
        // i can be a number or id
        if (typeof i == 'string'){
            this.layout.setActiveItem(i);
            this.activeItem = this.items.indexOf(this.layout.activeItem);
        } else {
	        var max = this.items.length;
	        var ai = 0;
	        if (i < 0){
	            ai = max - 1;
	        } else {
	            ai = i % max;
	        } 
	        this.activeItem = ai;
	        this.layout.setActiveItem(ai);
        }
       
    },
    next : function(){
        this.setActiveItem(this.activeItem + 1);
    },
    prev : function(){
        this.setActiveItem(this.activeItem - 1);
    },
    playPause : function (){
      if(this.playing) {
          this.pause();
      } else {
          this.play();
      }  
    },
    pause: function(){
      if(this.playing) {
            Ext.TaskMgr.stop(this.playTask);
            this.playTaskBuffer.cancel();
            this.playing = false;
            this.getTopToolbar().findById('play').removeClass('ux-carousel-playing');
        }        
        return this;  
    },
    play: function() {
        if(!this.playing) {
            this.playTask = this.playTask || {
                run: function() {
                    this.playing = true;
                    this.next();
                },
                interval: this.interval*1000,
                scope: this
            };
            
            this.playTaskBuffer = this.playTaskBuffer || new Ext.util.DelayedTask(function() {
                Ext.TaskMgr.start(this.playTask);
            }, this);

            this.playTaskBuffer.delay(this.interval*1000);
            this.playing = true;
            this.getTopToolbar().findById('play').addClass('ux-carousel-playing');
        }  
        return this;
    },
    /** 
     * Reset current slide preview, in case user has navigated away from page in iframe
     */
    resetSlide: function() {
        var ai = this.layout.activeItem;
        ai.resetPreview();
    },
    initComponent: function(){
         Ext.apply(this,
            {  tbar: [
                    {
                        id: 'reset-slide',
                        tooltip: 'Reset slide preview',
                        icon: 'chrome://lore/skin/icons/arrow_refresh.png',
                        handler: this.resetSlide.createDelegate(this)
                    },
                    '->',
                    {
                        id: 'move-prev',
                        tooltip: 'Move to previous slide',
                        iconCls: 'ux-carousel-nav-prev',
                        handler: this.prev.createDelegate(this)
                    },
                    {
                        id: 'play',
                        tooltip: 'Play slideshow',
                        iconCls: 'ux-carousel-nav-play',
                        handler: this.playPause.createDelegate(this)
                    },
                    {
                        id: 'move-next',
                        tooltip: 'Move to next slide',
                        iconCls: 'ux-carousel-nav-next',
                        handler: this.next.createDelegate(this)
                    }
                ]
            }
        );
        lore.ore.ui.SlideShowPanel.superclass.initComponent.call(this);
   },
   /**
    * Create slides to represent some resources
    * @param {} cr An array of content resources
    * @param {} nestingLevel Current level of nesting
    * @return {} Array of lore.ore.model.SlidePanel objects
    */
   createContentSlides: function(cr, nestingLevel, containerid){
        var items = [];
        var slide;
        try{
            for (var i = 0; i < cr.length; i++) {
                var r = cr[i]; 
                if (r.representsCO && (nestingLevel < lore.ore.MAX_NESTING)) {
                    // process nested content
                    var rco = lore.ore.cache.getCompoundObject(r.uri);
                    
                    if (rco) {
                        r.representsCO = rco;
                    } else {
                        lore.debug.ore("CO not found in cache " + r.uri,lore.ore.cache);
                    }
                    // nested compound objects must be unique across entire slideshow - ie only create slides once
                    if (!this.findById(r.uri)) {
                        slide = new lore.ore.ui.SlidePanel({id: r.uri, ssid: this.id});
                        slide.loadContent(r);
                        items.push(slide);
                        if (rco) {
                            items.push(this.createContentSlides(rco.aggregatedResources, nestingLevel + 1, rco.uri));
                        }
                    }
                } else {
                    // resource slides are unique within their container (can appear in multiple nested comp objs)
                    slide = new lore.ore.ui.SlidePanel({id: r.uri + "_" + containerid, ssid: this.id});
                    slide.loadContent(r);
                    items.push(slide);
                }
            }
        } catch (e) {
            lore.debug.ore("Problem creating content slides",e);
        }
        return items;
   },
   loadContent: function(co){
    
    try{
        this.removeAll();
        if (co){
            // Title slide for slideshow
            var slide = new lore.ore.ui.SlidePanel({id: co.uri, ssid: this.id});
            slide.loadContent(co);
            this.add(slide);
            this.setActiveItem(0);
            // make a slide for each aggregated resource
            this.add(this.createContentSlides(co.aggregatedResources, 0, co.uri)); 
        }
    } catch (e){
        lore.debug.ore("Problem loading slideshow content",e);
    }
   },
   setModel: function(co){
        if (this.model) {
            panel.removeAll();
            this.model.un("addAggregatedResource", this.addResourceSlide,this);
            this.model.un("removeAggregatedResource", this.removeResourceSlide,this);
        }
        this.model = co;
        this.model.on("addAggregatedResource", this.addResourceSlide, this);
        this.model.on("removeAggregatedResource", this.removeResourceSlide, this);
        this.loadContent(this.model);
    }
});
Ext.reg('slideshowpanel',lore.ore.ui.SlideShowPanel);