lore.ore.ui.SlidePanel = Ext.extend(Ext.Panel,{
    layout:'card',
    activeItem: 0,
    playing: false,
    interval: 3,
    bodyStyle: 'padding:3px',
    defaults: {
        border:false
    },		
    setActiveItem: function(i){
        var max = this.items.length;
        var ai = 0;
        if (i < 0){
            ai = max - 1;
        } else {
            ai = i % max;
        } 
        this.activeItem = ai;
        this.layout.setActiveItem(ai);
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
    initComponent: function(){
         Ext.apply(this,
            {  tbar: [
                    '->',
                    {
                        id: 'move-prev',
                        iconCls: 'ux-carousel-nav-prev',
                        handler: this.prev.createDelegate(this)
                    },
                    {
                        id: 'play',
                        iconCls: 'ux-carousel-nav-play',
                        handler: this.playPause.createDelegate(this)
                    },
                    {
                        id: 'move-next',
                        iconCls: 'ux-carousel-nav-next',
                        handler: this.next.createDelegate(this)
                    }
                ]
            }
        );
        lore.ore.ui.SlidePanel.superclass.initComponent.call(this);
   }
});
Ext.reg('slidepanel',lore.ore.ui.SlidePanel);