define([
    'views/baseView',
    'collections/scores',
    'tmpl/scoreboard',
    'tmpl/_scoreboardTable'
], 
function(BaseView, ScoresCollection, tmpl, tableTmpl) {
    var ScoreboardView = BaseView.extend({

        template: tmpl,
        tableTemplate: tableTmpl,
        tagName: 'section',
        className: 'page',
        pageId: '#scoreboardPage',
        hidden: true,

        $scoresTable: null,
        $loader: null,

        scoresMaxCount: 10,

        initialize: function () {
            ScoresCollection.on('reset', this.renderSuccess, this);
            ScoresCollection.on('fetchFailed', this.renderFailed, this);
        },

        renderSuccess: function(collection, options) {
            this.renderTable(collection.models);
        },

        renderFailed: function(message) {
            this.renderTable(null, message);
        },

        render: function () {
            this.$el.html(this.template());
            this.$el.attr('id', this.pageId.slice(1));
            this.$loader = this.$('.scores-wrapper__loading-indicator');
            this.$scoresTable = this.$('#scoresTable');
            this.$loader.show();
            return this;
        },

        renderTable: function(data, errorMessage) {
            data = data ? data : [];

            this.$loader.hide();
            this.$scoresTable.html(this.tableTemplate({
                scores: data,
                error: errorMessage
            }));
            return this;
        },

        show: function () {
            this.render();
            this.$el.show();

//            $.event.trigger({
//                type: "showPageEvent",
//                pageId: this.pageId
//            });

            ScoresCollection.getData(this.scoresMaxCount);
            this.hidden = false;
        },

        totalShow: function(error_message) {
            this.render(ScoresCollection.toJSON(), error_message);
        },

        hide: function () {
            if (!this.hidden) {
                this.$el.hide();
                this.hidden = true;
            }
        }

    });

    return new ScoreboardView();
});