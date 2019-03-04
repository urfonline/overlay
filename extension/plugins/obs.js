const OBSWebSocket = require("obs-websocket-js");

const plugin = {};

plugin.fetchScenes = function() {
    plugin.obs.send("GetSceneList").then((data) => {
        plugin.sceneList.value = data.scenes;
        plugin.currentScene.value = data.currentScene;

        return plugin.obs.send("GetPreviewScene")
    }).then((data) => {
        plugin.previewScene.value = data.name;
    }).catch((err) => {
        console.error(err);
    });
}

module.exports.init = function(nodecg) {
    plugin.obs = new OBSWebSocket();

    plugin.sceneList = nodecg.Replicant("obs:scenes", { defaultValue: [] });
    plugin.currentScene = nodecg.Replicant("obs:currentScene", { defaultValue: "", persist: false });
    plugin.previewScene = nodecg.Replicant("obs:currentPreview", { defaultValue: "", persist: false });

    let obs = plugin.obs;

    function connect() {
        obs.connect(nodecg.bundleConfig.obsRemote).then(() => {
            plugin.fetchScenes();
        }).catch((err) => {
    		console.error("Failed to connect to OBS.");
    		// console.error(err);
    	});
    }

    connect();

	obs.on("ScenesChanged", function() {
        plugin.fetchScenes();
	});

    obs.on("SwitchScenes", function(data) {
        plugin.currentScene.value = data.sceneName;
    });

    obs.on("PreviewSceneChanged", function(data) {
        plugin.previewScene.value = data.sceneName;
    });

    obs.on("error", function(err) {
        // pass
    });

    obs.on("ConnectionClosed", function(err) {
        setTimeout(function() {
            connect();
        }, 5000); // Reconnect after 5 seconds
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
