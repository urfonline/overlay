const got = require("got");
const plugin = {};

class JustGivingClient {
    constructor(nodecg) {
        this.client = got.extend({
            baseUrl: "http://api.justgiving.com/v1/",
            headers: {
                "x-api-key": nodecg.bundleConfig.donations.apiKey,
                "Accept": "application/json"
            },
            json: true
        });

        this.pageName = "urf-24hbroadcast";
        this.totalRaised = nodecg.Replicant("urf:total-raised", { defaultValue: 0 });
        this.lastId = null;

        this.sendDonation = (donation) => {
            console.log(donation);
            nodecg.sendMessage("urf:donation", donation);
        }
    }

    fetchDonations() {
        this.client.get(`fundraising/pages/${this.pageName}/donations`).then((res) => res.body.donations).then((donations) => {
            for (var i = 0; i < donations.length; i++) {
                var donation = donations[i];

                if (donation.id == this.lastId) break;
                this.sendDonation(donation);
            }

            this.lastId = donations[0].id;
        });
    }

    fetchTotal() {
        this.client.get(`fundraising/pages/${this.pageName}`).then((res) => res.body).then((info) => {
            this.totalRaised.value = info.grandTotalRaisedExcludingGiftAid;
        });
    }
}

module.exports.init = function(nodecg) {
    plugin.client = new JustGivingClient(nodecg);

    plugin.timer = setInterval(function() {
        plugin.client.fetchDonations();
    }, 60000);

    plugin.totalTimer = setInterval(function() {
        plugin.client.fetchTotal();
    }, 30000);
}
