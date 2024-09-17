class EventBuilder {
    constructor(gCalEvent = {}) {
        this.gCalEvent = { ...gCalEvent };
        this.gCalEvent.anyoneCanAddSelf = false;
        this.gCalEvent.reminders = {
            useDefault : true,
        };
        this.gCalEvent.general = false;
        return this;
    }

    /**
     * Creates a general boolean to identify as being general
     */
    setGeneral() {
        this.gCalEvent.general = true;
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
        const dateFormat = (date).slice(0, 19) + '-00:00';
        this.gCalEvent.start = {
            dateTime : dateFormat,
            timeZone : 'America/New_York',
        };
        return this;
    }

    /**
     * Attaches an end time to builder
     *
     * @param { string } date
     */
    setEndTime(date) {
        const dateFormat = (date).slice(0, 19) + '-00:00';
        this.gCalEvent.end = {
            dateTime : dateFormat,
            timeZone : 'America/New_York',
        };
        return this;
    }

    /**
     * DOES NOT INCLUDE START AND END DATE. Only includes other match information.
     *
     * @param { Object } match Object that includes match information
     * @returns
     */
    setMatchInfo(match) {
        let description = `${match.fullName}\n${match.team} vs ${match.opponent} in ${match.eventLeague}.\nBracket found <a href="${match.bracket}">here</a>.`;
        if (match.stream) {
            description += `\nStream <a href="${match.stream}">here</a>.`;
        }
        if (match.socials) {
            description += `\n${match.socials}`;
        }
        if (match.hashtags) {
            description += ` ${match.hashtags}`;
        }
        this.setDescription(description);

        let summary = '';
        if (this.gCalEvent.general) {
            summary += `[${match.game.toUpperCase()}] `;
        }

        summary += `UCF vs ${match.opponent}`;
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
        return this;
    }

    /**
    * Builds an event object and returns it
    * KIER WAS STUPID AND CALLED IT TO JSON. IT DOESN'T RETURN A JSON STRING. IT RETURNS AN OBJECT.
    * HE IS TOO LAZY TO GO BACK INTO THE CODE AND RENAME ALL THE toJSON METHODS.
    *
    * @return { gCalEvent }
    */
    toJSON() {
        return { ...this.gCalEvent };
    }
}

module.exports = {
    EventBuilder,
};