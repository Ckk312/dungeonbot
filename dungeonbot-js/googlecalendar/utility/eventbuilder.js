class EventBuilder {
    gCalEvent;

    constructor(gCalEvent = {}) {
        this.gCalEvent = { ...gCalEvent };
        this.gCalEvent.anyoneCanAddSelf = false;
        this.gCalEvent.reminders = {
            useDefault : true,
        }
        return this;
    }

    /**
     * Attaches summary to builder
     * 
     * @param { string } summary
     */
    setSummary(summary) {
        this.gCalEvent.summary = summary;
        return this;
    }

    /**
     * Attaches a description to builder
     * 
     * @param { string } description
     */
    setDescription(description) {
        this.gCalEvent.description = description;
        return this;
    }

    /**
     * Attaches a start time to builder
     * 
     * @param { Date } date
     */
    setStartTime(date) {
        let dateFormat = (date).slice(0, 19) + '-00:00';
        this.gCalEvent.start = {
            dateTime : dateFormat,
            timeZone : 'America/New_York',
        }
        return this;
    }

    /**
     * Attaches an end time to builder
     * 
     * @param { string } date
     */
    setEndTime(date) {
        let dateFormat = (date).slice(0, 19) + '-00:00';
        this.gCalEvent.end = {
            dateTime : dateFormat,
            timeZone : 'America/New_York',
        }
        return this;
    }

    /**
     * DOES NOT INCLUDE START AND END DATE. Only includes other match information.
     * 
     * @param { Object } match 
     * @returns 
     */
    setMatchInfo(match) {
        let description = `UCF Knights vs ${match.opponent} in ${match.eventLeague}.\nBracket found <a href="${match.bracket}">here</a>.`;
        if (match.stream) {
            description += `\nStream <a href="${match.stream}">here</a>.`;
        }
        this.setDescription(description);

        let summary = `[${match.game.toUpperCase()}] Knights vs ${match.opponent}`;
        this.setSummary(summary);

        return this;
    }

    /**
     * DOES NOT INCLUDE START AND END DATE. Only includes summary and description
     * 
     * @param { Object } eventInfo must have summary and description in object
     */
    setEventInfo(eventInfo) {
        this.setSummary(eventInfo.summary);
        this.setDescription(eventInfo.description);
    }

    /**
    * Builds an event object and returns it
    * 
    * @return { gCalEvent }
    */
    toJSON() {
        return { ...this.gCalEvent };
    }
}

module.exports = {
    EventBuilder
}