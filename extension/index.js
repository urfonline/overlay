const got = require("got");

const obs = require("./plugins/obs");
const atem = require("./plugins/atem");
const lastfm = require("./plugins/lastfm");

module.exports = function (nodecg) {
	obs.init(nodecg);
	atem.init(nodecg);
	lastfm.init(nodecg);

	got("https://api.urfonline.com/graphql?query={currentSlate{slots{id startTime endTime day show{name shortDescription longDescription banner cover{resource}brandColor category{name color}emojiDescription}}}}", {
		json: true
	}).then((res) => {
		return res.body.data.currentSlate.slots;
	}).then((slots) => {
		nodecg.Replicant("urf:shows", { defaultValue: slots }).value = slots;
	}).catch((err) => {
		console.log(err);
	});
};
