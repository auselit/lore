/**
 * @class lore.anno.ui.PagingToolbar Used to page annotation search results
 * @extends Ext.PagingToolbar
 */
lore.anno.ui.PagingToolbar = Ext.extend(Ext.PagingToolbar, {
       pageSize: 5,
       initComponent : function(){
        this.sortCombo = new Ext.form.ComboBox({
                triggerAction: 'all',
                width: 100,
                editable: false,
                mode: 'local',
                displayField: 'description',
                valueField: 'name',
                lazyInit: false,
                value: 'created',
                store: new Ext.data.ArrayStore({
                    fields: ['name', 'description'],
                    data :  [['title', 'Title'],['creator','Creator'],['created', 'Created'], ['modified','Modified'], ['resource', 'Target URL']]
                }),
                listeners: {
                    'select': {fn:function(combo){this.sortAnnotations(combo.getValue());}, scope:this}
                }
        });
        var pagingItems = [
            this.prev = new Ext.Toolbar.Button({
                tooltip: this.prevText,
                overflowText: this.prevText,
                iconCls: 'x-tbar-page-prev',
                disabled: true,
                handler: this.movePrevious,
                scope: this
            }), this.beforePageTextItem = new Ext.Toolbar.TextItem({
                text: this.beforePageText
            }),
            this.inputItem = new Ext.form.NumberField({
                cls: 'x-tbar-page-number',
                allowDecimals: false,
                allowNegative: false,
                enableKeyEvents: true,
                selectOnFocus: true,
                submitValue: false,
                listeners: {
                    scope: this,
                    keydown: this.onPagingKeyDown,
                    blur: this.onPagingBlur
                }
            }), this.afterTextItem = new Ext.Toolbar.TextItem({
                text: String.format(this.afterPageText, 1)
            }), this.next = new Ext.Toolbar.Button({
                tooltip: this.nextText,
                overflowText: this.nextText,
                iconCls: 'x-tbar-page-next',
                disabled: true,
                handler: this.moveNext,
                scope: this
            }),'Sort by:',
            this.sortCombo
        ];


        var userItems = this.items || this.buttons || [];
        if (this.prependButtons) {
            this.items = userItems.concat(pagingItems);
        } else{
            this.items = pagingItems.concat(userItems);
        }
        delete this.buttons;
        if(this.displayInfo){
            this.items.push('->');
            this.items.push(this.displayItem = new Ext.Toolbar.TextItem({}));
        }
        Ext.PagingToolbar.superclass.initComponent.call(this);
        this.addEvents(
            'change',
            'beforechange'
        );
        this.on('afterlayout', this.onFirstLayout, this, {single: true});
        this.cursor = 0;
        this.bindStore(this.store, true);
    },
    
    sortAnnotations: function(v){
        lore.debug.ore("sort annotations " + v,this);
        try{
        this.store.sort(v, (v == 'created' || v == 'modified') ? 'desc' : 'asc');
        this.moveFirst();
        } catch (e){
            lore.debug.ore("Problem sorting annotations",e);
        }
    },
    /**
     * Fix paging after clear: reset back to first page
     */
    onClear: function () {
        this.cursor = 0;
        this.store.lastOptions = {params:{start: 0, limit: 5}};
        this.onChange();
    },
    bindStore: function (store, initial) {
        // reconfigure sort options in toolbar if binding to solr store
        // as solr does not support searching multivalued fields (title, resource/annotates)
        var oldSortVal = this.sortCombo.getValue();
        if (store instanceof lore.anno.ui.SolrStore){
            if (oldSortVal == "title" || oldSortVal == "resource"){
                this.sortCombo.setValue('created');
            }
            this.sortCombo.store.loadData([['creator','Creator'],['created', 'Created'], ['modified', 'Modified']]);
            
        } else {
            this.sortCombo.store.loadData([['title', 'Title'],['creator','Creator'],['created', 'Created'], ['modified', 'Modified'], ['resource', 'Target URL']]);
        }
        
        var doLoad;
        if (!initial && this.store) {
            if (store !== this.store && this.store.autoDestroy) {
                this.store.destroy();
            } else {
                this.store.un('beforeload', this.beforeLoad, this);
                this.store.un('load', this.onLoad, this);
                this.store.un('exception', this.onLoadError, this);
                this.store.un('datachanged', this.onChange, this);
                this.store.un('add', this.onChange, this);
                this.store.un('remove', this.onChange, this);
                this.store.un('clear', this.onClear, this);
            }
            if (!store) {
                this.store = null;
            }
        }
        if (store) {
            store = Ext.StoreMgr.lookup(store);
            store.on({
                scope: this,
                beforeload: this.beforeLoad,
                load: this.onLoad,
                exception: this.onLoadError,
                datachanged: this.onChange,
                add: this.onChange,
                remove: this.onChange,
                clear: this.onClear
            });
            doLoad = true;
        }
        this.store = store;
        if (doLoad) {
            this.onLoad(store, null, {});
        }
    },
    onChange: function () { 
        var t = this.store.getTotalCount(),
            s = this.pageSize;
        if (this.cursor >= t) {
            this.cursor = Math.ceil((t + 1) / s) * s;
        }
        var d = this.getPageData(), ap = d.activePage, ps = d.pages;
        this.afterTextItem.setText(String.format(this.afterPageText, ps));
        this.inputItem.setValue(ap);
        if (ps <= 1){
            this.prev.hide();
            this.beforePageTextItem.hide();
            this.inputItem.hide();
            this.afterTextItem.hide();
            this.next.hide(); 
        } else {
            this.prev.show();
            this.beforePageTextItem.show();
            this.inputItem.show();
            this.afterTextItem.show();
            this.next.show();
        }
        this.prev.setDisabled(ap == 1);
        this.next.setDisabled(ap == ps);
        this.updateInfo();
        this.fireEvent('change', this, d);
    },
    onLoad : function(store, r, o){
        if(!this.rendered){
            this.dsLoaded = [store, r, o];
            return;
        }
        var p = this.getParams();
        this.cursor = (o.params && o.params[p.start]) ? o.params[p.start] : 0;
        this.onChange();
    }
});
Ext.reg('lore.anno.paging',lore.anno.ui.PagingToolbar);