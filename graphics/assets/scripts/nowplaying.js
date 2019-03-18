(function() {
    const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const nowformatter = new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });

    function getCurrentHour() {
        let now = new Date();

        now.setMinutes(0);
        now.setSeconds(0);

        let day = (now.getDay() + 6) % 7;
        return { h: nowformatter.format(now), d: day };
    }

    const app = new Vue({
        el: "#app-mount",
        data: {
            nowplaying: null,
            allShows: [],
            currentPromo: null
        },
        computed: {
            currentShow: function() {
                // if (!this.allShows.find) return null;

                let now = moment();
                let slot = Array.prototype.find.call(this.allShows, (slot) => {
                    let start = moment(slot.startTime, "HH:mm:ss").day(slot.day + 1);
                    let end = moment(slot.endTime, "HH:mm:ss").day(slot.day + 1);

                    return now.isBetween(start, end);
                });

                if (slot) return slot.show;
                else return null;
            },
            promoImage: function() {
                if (this.currentPromo == null) return null;

                var banner = this.currentPromo.show.banner;
                var resource = (banner != "") ? banner : this.currentPromo.show.cover.resource;

                if (resource == "") return "";

                return 'https://urf.imgix.net/' + resource + '?w=1280&h=592&auto=format&q=80&fit=crop&crop=faces';
            }
        },
        methods: {
            formatHour: function(hour) {
                let suffix = (hour > 11 ? "PM" : "AM");
                let prefix = hour % 12;

                if (prefix == 0) prefix = 12;

                return `${prefix}${suffix}`
            },
            formatPromoTime: function() {
                if (this.currentPromo == null) return "";

                let hour = parseInt(this.currentPromo.startTime.split(":")[0]);
                let halfHour = this.formatHour(hour);
                let day = weekdays[this.currentPromo.day];

                return `${day} at ${halfHour}`;
            }
        }
    });

    nodecg.Replicant("urf:nowplaying").on("change", function(track) {
        if (track == null) {
            app.nowplaying = null;
            return;
        }

        app.nowplaying = {
            title: track.name,
            artist: track.artist["#text"],
            album: track.album["#text"]
        };
    });

    let shows = nodecg.Replicant("urf:shows");
    let i = 0;
    shows.on("change", function(allSlots) {
        app.allShows = allSlots;

        i = Math.floor(Math.random() * allSlots.length);
        app.currentPromo = allSlots[i];
    });

    setInterval(function() {
        app.currentPromo = app.allShows[i];
        i = (i + 1) % app.allShows.length;
    }, 20000);

    window.setPromo = function(i) {
        app.currentPromo = app.allShows[i];
    }

    window.__app = app;
})();
