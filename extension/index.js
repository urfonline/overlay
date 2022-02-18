const got = require("got");

const obs = require("./plugins/obs");
const atem = require("./plugins/atem");
const lastfm = require("./plugins/lastfm");
const donations = require("./plugins/donations");

const GRAPH_QUERY = `{stream(slug:"urf-online"){slate{slots{id startTime endTime day show{name shortDescription \
longDescription banner cover{resource}brandColor category{name color}emojiDescription}}}}}`;

module.exports = function (nodecg) {
	obs.init(nodecg);
	atem.init(nodecg);
	lastfm.init(nodecg);
	donations.init(nodecg);

	got(`https://api.urfonline.com/graphql?query=${GRAPH_QUERY}`, {
		json: true
	}).then((res) => {
		return res.body.data.stream.slate.slots;
	}).then((slots) => {
		nodecg.Replicant("urf:shows", { defaultValue: slots }).value = slots;
	}).catch((err) => {
		console.log(err);
	});
};
