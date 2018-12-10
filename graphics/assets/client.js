const app = new Vue({
    el: "#app-mount",
    data: {
        jingles: [],
        notification: null
    },
    methods: {
        randomX: function() {
            return Math.floor(Math.random() * window.innerWidth);
        },
        randomY: function() {
            return Math.floor(Math.random() * window.innerHeight);
        }
    }
});

nodecg.listenFor("urf:trigger-jingle", function(jingle) {
    app.jingles.push(jingle);

    setTimeout(function() {
        app.jingles.splice(app.jingles.indexOf(jingle), 1);
    }, 2000);
});

nodecg.listenFor("urf:trigger-notify", function(notification) {
    app.notification = notification;

    setTimeout(function() {
        app.notification = null;
    }, 8000);
});
