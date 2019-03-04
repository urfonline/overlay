const app = new Vue({
    el: "#app-mount",
    data: {
        jingles: [],
        donations: 0,
        donationsTweened: 0,
        notification: null,
        queue: [],
        timer: null
    },
    computed: {
        donationTotal: function() {
            return this.donationsTweened.toFixed(0);
        }
    },
    watch: {
        donations: function(val) {
            TweenLite.to(this.$data, 1.5, { donationsTweened: val });
        }
    },
    methods: {
        randomX: function() {
            return Math.floor(Math.random() * window.innerWidth);
        },
        randomY: function() {
            return Math.floor(Math.random() * window.innerHeight);
        },
        pullDonation: function() {
            var donation = this.queue.shift();
            if (donation == null || this.notification != null) {
                this.timer = setTimeout(this.pullDonation, 10000);
                return;
            }

            var amount = parseInt(donation.amount).toFixed(0);
            this.notification = {
                title: `£${amount} from ${donation.donorDisplayName}`,
                body: "Thank you!"
            };

            this.timer = setTimeout(this.clearDonation, 8000);
        },
        clearDonation: function() {
            this.notification = null;

            this.timer = setTimeout(this.pullDonation, 3000);
        }
    }
});

nodecg.listenFor("urf:trigger-jingle", function(jingle) {
    app.jingles.push(jingle);

    setTimeout(function() {
        app.jingles.splice(app.jingles.indexOf(jingle), 1);
    }, 2000);
});

nodecg.listenFor("urf:trigger-notify", function(notification) {
    app.notification = notification;

    setTimeout(function() {
        app.notification = null;
    }, 8000);
});

nodecg.Replicant("urf:total-raised").on("change", (val) => {
    app.donations = val;
});

nodecg.listenFor("urf:donation", (donation) => {
    app.queue.push(donation);

    if (!app.timer) app.pullDonation();
});
