const { Atem } = require("atem-connection")
const plugin = {}

module.exports.init = function(nodecg) {
    plugin.atem = new Atem()

    plugin.atem.connect(nodecg.bundleConfig.atemAddress)

    nodecg.listenFor("atem:cut", function() {
        plugin.atem.cut();
    });

    nodecg.listenFor("atem:set-preview", function(index) {
        plugin.atem.changePreviewInput(index);
    });

    nodecg.listenFor("atem:set-program", function(index) {
        plugin.atem.changeProgramInput(index);
    });
}
