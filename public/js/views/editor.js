define([
    'backbone',
    'tmpl/editor',
    'game/Game',
    'views/viewmanager'
], 
function(Backbone, tmpl, Game, ViewManager) {
    var EditorView = Backbone.View.extend({

        template: tmpl,
        el: '#pages',
        pageId: '#editorPage',
        canvas: null,
        scene: null,
        game: null,

        initialize: function () {
            ViewManager.addView(this.pageId, this);
            this.render();
        },

        render: function () {
            var p = $(this.template());
            p.attr("id", this.pageId.slice(1));
            p.appendTo(this.$el);

            this.canvas = document.getElementById('editor-field');
            this.scene = $('#editor-scene');
            this.calcDimensions();

            this.runGame();
            return this;
        },
        show: function () {
            this.$el.find(this.pageId).show();
            $.event.trigger({
                type: "showPageEvent",
                pageId: this.pageId
            });
        },
        hide: function () {
            this.$el.find(this.pageId).hide();
        },

        calcDimensions: function() {
            if (this.scene === null) {
                console.log("#scene is null");
                return;
            }

            var self = this;
            $(window).resize(function() {
                self.canvas.width = $(this).width()*0.8; //80%
                self.canvas.height = $(this).height();
            });
            $(window).resize();
        },

        runGame: function() {
            this.game = new Game(this.canvas, true);
            this.game.run();
        }

    });

    return new EditorView();
});