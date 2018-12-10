const OBSWebSocket = require("obs-websocket-js");

const plugin = {};

plugin.fetchScenes = function() {
    plugin.obs.send("GetSceneList").then((data) => {
        plugin.sceneList.value = data.scenes;
        plugin.currentScene.value = data.currentScene;
    }).catch((err) => {
        console.error(err);
    });
}

module.exports.init = function(nodecg) {
    plugin.obs = new OBSWebSocket();

    plugin.sceneList = nodecg.Replicant("obs:scenes", { defaultValue: [] });
    plugin.currentScene = nodecg.Replicant("obs:currentScene", { defaultValue: "" });

    let obs = plugin.obs;
	obs.connect(nodecg.bundleConfig.obsRemote).then(() => {
        plugin.fetchScenes();
    }).catch((err) => {
		console.error("Failed to connect to OBS.");
		// console.error(err);
	});

	obs.on("ScenesChanged", function() {
        plugin.fetchScenes();
	});

	nodecg.listenFor("obs:set-preview", function(scene) {
		obs.send("SetPreviewScene", { "scene-name": scene });
	});

	nodecg.listenFor("obs:cut", function() {
		obs.send("TransitionToProgram", {
			"with-transition": { "name": "Cut" }
		});
	});

	nodecg.listenFor("obs:transition", function(transition) {
		obs.send("TransitionToProgram", {
			"with-transition": { "name": transition }
		});
	});
}
