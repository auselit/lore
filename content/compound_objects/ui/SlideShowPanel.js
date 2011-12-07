 /**
  * 
  * @class lore.ore.ui.SlideShowPanel Represents a slideshow with navigation buttons
  * @extends Ext.Panel
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
    /** jump to slide for a resource from the current Resource Map */
    showResource: function(uri){
    	Ext.getCmp("loreviews").activate(this.id);
    	// The id of the active item has the containing Resource Map appended
    	this.setActiveItem(uri + "_" + lore.ore.cache.getLoadedCompoundObjectUri());
    },
    /** 
     * Sets the slide to be displayed in the slideshow
     * @param {} i Number or id of the item to make active
     */
    setActiveItem: function(i){
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
    /** Display next slide */
    next : function(){
        this.setActiveItem(this.activeItem + 1);
    },
    /** Display previous slide */
    prev : function(){
        this.setActiveItem(this.activeItem - 1);
    },
    /** Toggle between auto play */
    playPause : function (){
      if(this.playing) {
          this.pause();
      } else {
          this.play();
      }  
    },
    /** Pause the auto play */
    pause: function(){
      if(this.playing) {
            Ext.TaskMgr.stop(this.playTask);
            this.playTaskBuffer.cancel();
            this.playing = false;
            this.getTopToolbar().findById('play').removeClass('ux-carousel-playing');
        }        
        return this;  
    },
    /** Start the auto play */
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
                        icon: '../../skin/icons/arrow_refresh.png',
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
        var parent = this.findParentByType('panel');
        parent.on("activate",this.showSlideshow,this);
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
        	cr.each(function(rec){
        		var r = rec.data;
                if (r.representsCO && (nestingLevel < lore.ore.cache.MAX_NESTING)) {
                    // process nested content
                    var rco = lore.ore.cache.getCompoundObject(r.uri);
                    
                    if (rco) {
                        r.representsCO = rco;
                    } else {
                        lore.debug.ore("CO not found in cache " + r.uri,lore.ore.cache);
                    }
                    // nested Resource Maps must be unique across entire slideshow - ie only create slides once               
                    if (!this.findById(r.uri)) {
                        slide = new lore.ore.ui.SlidePanel({id: r.uri, ssid: this.id});
                        slide.loadContent(rec);
                        items.push(slide);
                        if (rco) {
                            items.push(this.createContentSlides(rco.aggregatedResourceStore, nestingLevel + 1, rco.uri));
                        }
                    }
                } else {
                    // resource slides are unique within their container (can appear in multiple nested comp objs)
                    slide = new lore.ore.ui.SlidePanel({id: r.uri + "_" + containerid, ssid: this.id});
                    slide.loadContent(rec);
                    items.push(slide);
                }
            },this);
        } catch (e) {
            lore.debug.ore("Problem creating content slides",e);
        }
        return items;
   },
   showSlideshow: function(p){
        Ext.MessageBox.show({
               msg: 'Generating Slideshow',
               width:250,
               defaultTextHeight: 0,
               closable: false,
               cls: 'co-load-msg'
        });
        
        // TODO: slideshow should listen to model and this should not be regenerated each time
        var currentCO = lore.ore.cache.getLoadedCompoundObject();
        var coContents = currentCO.serialize('rdfquery');
        var tmpCO = new lore.ore.model.CompoundObject();
        tmpCO.load({format: 'rdfquery',content: coContents});
        this.loadContent(tmpCO);
        Ext.Msg.hide();
   },
   /** Clear and reload content to represent a Resource Map
    * 
    * @param {} co The Resource Map to render
    */
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
            this.add(this.createContentSlides(co.aggregatedResourceStore, 0, co.uri)); 
        }
    } catch (e){
        lore.debug.ore("Problem loading slideshow content",e);
    }
   },
   /**
    * Sets the Resource Map represented by the slide show
    * @param {} co The Resource Map model object
    */
   bindModel: function(co){
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