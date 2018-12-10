const { Atem } = require("atem-connection")
const plugin = {}

module.exports.init = function(nodecg) {
    plugin.atem = new Atem()

    plugin.atem.connect(nodecg.bundleConfig.atemAddress)

    // nodecg.listenFor("")
}
