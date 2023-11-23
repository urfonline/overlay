const got = require("got");
const EventEmitter = require("events");
const plugin = {};

class AbstractApiClient {
    constructor(client, pageName, lastId) {
        this.client = client;
        this.pageName = pageName;
        this.events = new EventEmitter();
    }

    fetchDonations() {}
    fetchTotal() {}
}

class FundraisingApiClient extends AbstractApiClient {    
    fetchDonations() {
        this.client.get(`fundraising/pages/${this.pageName}/donations`).then((res) => res.body.donations).then((donations) => {
            for (var i = 0; i < donations.length; i++) {
                var donation = donations[i];

                if (donation.id == this.lastId.value) break;
                this.events.emit("new-donation", {
                    amount: parseFloat(donation.amount),
                    donorDisplayName: donation.donorDisplayName,
                    message: donation.message
                });
            }

            this.lastId.value = donations[0].id;
        });
    }

    fetchTotal() {
        this.client.get(`fundraising/pages/${this.pageName}`).then((res) => res.body).then((info) => {
            this.events.emit("update-total", info.grandTotalRaisedExcludingGiftAid);
        });
    }

}

class CrowdfundingApiClient extends AbstractApiClient {
    fetchDonations() {
        this.client.get(`crowdfunding/pages/${this.pageName}/pledges`).then(res => res.body.pledges).then(pledges => {
            for (var i = 0; i < pledges.length; i++) {
                var pledge = pledges[i];

                if (pledge.donationId == this.lastId.value) break;
                this.events.emit("new-donation", {
                    amount: pledge.donationAmount,
                    donorDisplayName: pledge.donationName,
                    message: pledge.message
                });
            }

            this.lastId.value = pledges[0].donationId;
        });
    }

    fetchTotal() {
        this.client.get(`crowdfunding/pages/${this.pageName}`).then(res => res.body).then(info => {
            this.events.emit("update-total", info.raised.amount);
        });
    }
}

class JustGivingClient {
    constructor(nodecg) {
        var httpClient = got.extend({
            baseUrl: "http://api.justgiving.com/v1/",
            headers: {
                "x-api-key": nodecg.bundleConfig.donations.apiKey,
                "Accept": "application/json"
            },
            json: true
        });

        this.pageType = nodecg.bundleConfig.donations.pageType || "fundraising";
        var pageName = nodecg.bundleConfig.donations.pageName;

        this.lastId = nodecg.Replicant("urf:last-donation-id", { defaultValue: null });
        this.totalRaised = nodecg.Replicant("urf:total-raised", { defaultValue: 0 });

        if (this.pageType === "fundraising") {
            this.client = new FundraisingApiClient(httpClient, pageName, lastId);
        } else if (this.pageType === "crowdfunding") {
            this.client = new CrowdfundingApiClient(httpClient, pageName, lastId);
        }

        this.client.events.on("new-donation", donation => {
            nodecg.sendMessage("urf:donation", donation);
        });

        this.client.events.on("update-total", total => {
            this.totalRaised.value = total;
        });
    }

    fetchDonations() {
        this.client.fetchDonations();
    }

    fetchTotal() {
        this.client.fetchTotal();
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
