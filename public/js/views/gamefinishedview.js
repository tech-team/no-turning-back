define([
    'backbone',
    'tmpl/form',
    'collections/scores',
    'models/player',
    'views/scoreboard'
], 
function(Backbone, formTmpl, Scoreboard, Player, ScoreboardView) {
    var GameFinishedView = Backbone.View.extend({
        template: formTmpl,
        el: '#pages',
        pageId: '#scoreSenderPage',
        called: false,
        loader: '.score-content__loading-indicator',

        initialize: function () {
            var self = this;
            $(document).on("scoreSending", function(event) {
                self.sendingForm();
            });

            $(document).on("scoreSent", function(event) {
                self.okForm(event);
            });

            $(document).on("scoreSendFailed", function(event) {
                self.failForm(event);
            });

            
        },

        calcDimensions: function() {
            var $dimmer = this.$el.find('.score-sender-dimmer');

            var $sender = this.$el.find('.score-content-wrapper');
            var senderWidth = $sender.width();
            var senderHeight = $sender.height();

            var self = this;
            $(window).resize(function() {
                var windowWidth = $(this).width();
                var windowHeight = $(this).height();

                $dimmer.css({
                    'height': windowHeight + 'px'
                });

                var marginLeft = (windowWidth - senderWidth) / 2;
                var marginTop = (windowHeight - senderHeight) / 2 - 30;
                $sender.css({
                    'margin-left': marginLeft + 'px',
                    'margin-top': marginTop + 'px'
                });
            });
            $(window).resize();

        },

        deleteForm: function() {
            var p = document.getElementById(this.pageId.slice(1));
            if (p !== null)
                p.parentNode.removeChild(p);
        },

        render: function (scoreValue) {
            var p = $(this.template({score: scoreValue}));
            p.attr("id", this.pageId.slice(1));
            p.appendTo(this.$el);
 
            return this;
        },

        show: function (scoreValue) {
            if (this.called)
                return;

            this.called = true;

            this.render(scoreValue);
            this.calcDimensions();
            this.$el.find(this.pageId).show();

            var form = $('#scoreForm');
            form.submit(function(event) {
                var data = {};
                $.each(form.serializeArray(), function (i, input) {
                    data[input.name] = input.value;
                });
                Scoreboard.add(new Player(data));
                event.preventDefault();
            });
        },
        hide: function () {
            this.$el.find(this.pageId).hide();
        },

        blockForm: function() {
            $("input#username").prop('disabled', true);
            $("input#sendScore").prop('disabled', true);
            $(this.loader).show();
        },

        unblockForm: function() {
            $("input#username").prop('disabled', false);
            $("input#sendScore").prop('disabled', false);
            $(this.loader).hide();
        },

        sendingForm: function() {
            console.log("form is sending");
            this.blockForm();
        },

        okForm: function(event) {
            console.log("form is sent successfully");
            this.unblockForm();
            this.hide();
            this.deleteForm();

            this.called = false;
            document.location = '#scoreboard';
        },

        failForm: function(event) {
            console.log("failed to send");
            console.log(event);
            this.unblockForm();

            $error_field = $(this.pageId).find('.error_message');
            $error_field.text("Connection error. Your score saved locally.")
            $error_field.show();

            this.called = false;
            var self = this;
                self.hide();
                ScoreboardView.show();
            
        }

    });

    return new GameFinishedView();
});