const { LastFmNode } = require("lastfm");
const plugin = {}

module.exports.init = function(nodecg) {
    plugin.lastfm = new LastFmNode({
        api_key: nodecg.bundleConfig.lastFm.apiKey,
        secret: nodecg.bundleConfig.lastFm.apiSecret,
        useragent: "URF-Overlay/v0.1.0"
    });

    plugin.stream = plugin.lastfm.stream(nodecg.bundleConfig.lastFm.username);
    plugin.nowplaying = nodecg.Replicant("urf:nowplaying", { defaultValue: null });

    plugin.stream.on("nowPlaying", (track) => {
        plugin.nowplaying.value = track;
    });

    plugin.stream.on("stoppedPlaying", (track) => {
        plugin.nowplaying.value = null;
    });

    plugin.stream.on("error", (err) => {
        // ignore errors
    });

    plugin.stream.start();
}
