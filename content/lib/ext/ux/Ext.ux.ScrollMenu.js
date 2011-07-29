/*
 * Override menu to support scroll using mousewheel
 * See: http://www.sencha.com/forum/showthread.php?43884-tip-menu-overflow
 */
Ext.override(Ext.menu.Menu, {
    MaxHeight:undefined
    ,SaveState:true
    ,scrollRepeatInterval:100
    ,TopAndBottomSpace:24
    ,scrollRunner:new Ext.util.TaskRunner()
    ,scrollTask:undefined
    ,clientHeight:undefined
    ,fnScrollTop:function(){
        var items = this.ul.dom.childNodes;
        var h = 0;
        for(var i = 0; i < this.lastChild - 1; i++){
            h += Ext.get(items[i]).getHeight();
        }
        if(this.lastChild!=0){
            this.lastChild--;
            this.nextChild--;
        }
        this.ul.scrollTo("top",h,true);
    }
    ,fnScrollBottom:function(){
        var items = this.ul.dom.childNodes;
        if(this.nextChild >= items.length){
        return false;
    }
    var h=0;
        for(var i=0;i<this.nextChild+1;i++){
            h += Ext.get(items[i]).getHeight();
        }
        h -= this.ul.getHeight();
        if(this.nextChild < items.length){
            this.nextChild++;
            this.lastChild++;
        }
        this.ul.scrollTo("top", h, true);
        return true;
    }
    ,onWheel:function(e){
        w = e.getWheelDelta();
        if (w == 1){
            this.fnScrollTop();
        }
        else{
            if(w==-1){
                this.fnScrollBottom();
            }
        }
    }
    ,startScrollBottom:function(){
        this.scrollTask = {
            run:this.fnScrollBottom
            ,interval:200 //0.2 second
            ,scope:this
        }
        this.scrollRunner.start(this.scrollTask);
    }
    ,startScrollTop:function(){
        this.scrollTask = {
            run:this.fnScrollTop
            ,interval:200 //0.2 second
            ,scope:this
        }
        this.scrollRunner.start(this.scrollTask);
    }
    ,stopScrolling:function(){
        if (!Ext.isEmpty(this.scrollTask)){
            this.scrollRunner.stop(this.scrollTask);
        }
        scrolTask = undefined;
    }
    ,showAt:function(xy, parentMenu, _e){
        var maxHeight;
        this.parentMenu = parentMenu;
        if(!this.el){
            this.render();
        }
        if(_e !== false){
            this.fireEvent("beforeshow", this);
            xy = this.el.adjustForConstraints(xy);
        }
        this.clientHeight = Ext.lib.Dom.getViewHeight();

        if(this.MaxHeight == undefined){
            maxHeight = this.clientHeight - xy[1] - this.TopAndBottomSpace;
        }
        else{
            maxHeight = this.MaxHeight - this.TopAndBottomSpace;
        }
        var last_ul_height = this.ul.getHeight();
        var items = this.ul.dom.childNodes;
        if((last_ul_height > maxHeight || this.addedScrolling == true) && items.length > 1){
            var addWidth = 0;
            if(this.SaveState){
                for(var i = 0; i < this.lastChild; i++){
                    addWidth += Ext.get(items[i]).getHeight();
                }
            }
            var h = 0;
            for(var i = 0, len = items.length; i >= 0 && i < len; i++){
                var iEl = Ext.get(items[i]);
                h += iEl.getHeight();
                if(h > (maxHeight + addWidth)){
                    this.ul.setHeight(h - iEl.getHeight());
                    this.nextChild = i;
                    break;
                }
            }
            if(!this.SaveState){
                this.ul.scrollTo("top",0);
                this.lastChild=0;
            }
        }
        if((last_ul_height > maxHeight && this.addedScrolling != true) && items.length > 1){
            var sb = this.el.createChild({
                tag:"div"
                ,cls:"menu-scroll-bottom"
            });
            sb.addClassOnOver('x-menu-item-active menu-scroll-over');
            sb.on({
                'mouseover':{
                    fn:this.startScrollBottom
                    ,scope:this
                    ,options:{
                        delay:this.scrollRepeatInterval
                        ,scope:this
                    }
                }
                ,'mouseout':{
                    fn:this.stopScrolling
                    ,scope:this
                    ,options:{
                        scope:this
                    }
                }
            });
            var st = this.el.insertFirst({
                tag:"div"
                ,cls: "menu-scroll-top"
            });
            st.addClassOnOver('x-menu-item-active menu-scroll-over');
            st.on({
                'mouseover':{
                    fn:this.startScrollTop
                    ,scope:this
                    ,options:{
                        delay:this.scrollRepeatInterval
                        ,scope:this
                    }
                }
                ,'mouseout':{
                    fn:this.stopScrolling
                    ,scope:this
                    ,options:{
                        scope: this
                    }
                }
            });

            this.ul.on('mousewheel', this.onWheel, this);
            this.scrollBottom = sb; 
            this.scrollTop = st;
            this.addedScrolling = true;
            this.lastChild = 0;
        }
        this.el.setXY(xy);
        this.el.show();
        this.hidden = false;
        this.focus();
        this.fireEvent("show", this);
    }

});