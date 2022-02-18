const { Atem } = require("atem-connection")
const plugin = {}

module.exports.init = function(nodecg) {
    plugin.atem = new Atem()

    function connect() {
        plugin.atem.connect(nodecg.bundleConfig.atemAddress)
    }

    plugin.atem.on("connected", function() {
        // console.log("Connected to ATEM");
    });

    plugin.atem.on("disconnected", function() {
        console.log("Connection to ATEM failed, retrying");
        connect();
    });

    nodecg.listenFor("atem:cut", function() {
        plugin.atem.cut().catch((err) => console.error(err));
    });

    nodecg.listenFor("atem:set-preview", function(index) {
        plugin.atem.changePreviewInput(index).catch((err) => console.error(err));
    });

    nodecg.listenFor("atem:set-program", function(index) {
        plugin.atem.changeProgramInput(index).catch((err) => console.error(err));
    });

    connect();
}
