(function() {
    let app = new Vue({
        el: "#app-mount",
        data: {
            managerMode: false,
            jingles: []
        },
        methods: {
            rename: function(jingle) {
                jingle.name = "blob stop";
            },
            trigger: function(jingle) {
                nodecg.sendMessage("urf:trigger-jingle", jingle);
            }
        }
    });

    var jingles = nodecg.Replicant("assets:jingles");

    jingles.on("change", (val) => app.jingles = val);
})();
