define([
    'backbone'
], 
function(Backbone) {
    var ViewManager = Backbone.View.extend({
        el: '#pages',
        views: {},
        currentView: null,
        router: null,

        initialize: function () {
        },

        addView: function(view) {
            this.views[view.pageId] = view;
            this.addToDOM(view.pageId);
        },

        addToDOM: function(viewId) {
            this.$el.append(this.views[viewId].$el);
        },

        _setCurrentViewActive: function(viewToShow) {
            this.currentView = viewToShow;
            this.currentView.show();
        },

        _closeOthers: function(currentId) {
            _.each(this.views, function(value, key) {
                if (currentId !== key) {
                    value.hide();
                }
            });
        },

        setRouter: function(router) {
            this.router = router;
        },

        show: function(viewToShow, noConfirm) {
            if (!this.currentView) {
                this._setCurrentViewActive(viewToShow);
                return;
            }

            if (!noConfirm) {
                this.router.navigate(this.currentView.pageId);
                var self = this;
                this.currentView.confirm({
                    yes: function () {
                        self._closeOthers(viewToShow.pageId);
                        self._setCurrentViewActive(viewToShow);
                        self.router.navigate(viewToShow.pageId);
                    },
                    no: function () {
                    }
                });
            } else {
                this._closeOthers(viewToShow.pageId);
                this._setCurrentViewActive(viewToShow);
            }

        }

    });

    return new ViewManager();
});