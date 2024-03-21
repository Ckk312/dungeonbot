const gCalEvent = {
    summary: null,
    description: null,
    location: null,
    start : {
        dateTime: null,
        timeZone : 'America/New York'
    },
    end : {
        dateTime: null,
        timeZone : 'America/New York'
    },
    endTimeUnspecified: true,
    anyoneCanAddSelf : false,
    attendeesOmitted : true,
    reminders : {
        useDefault : true
    }
}

class EventBuilder {
    summary = null;
    description = null;
    start = null;
    end = null;
    /**
     * Attaches summary to builder
     * 
     * @param { string } summary
     */
    setSummary(summary) {
        this.summary = summary;
        return this;
    }

    /**
     * Attaches a description to builder
     * 
     * @param { string } description
     */
    setDescription(description) {
        this.description = description;
        return this;
    }
    /**
     * Attaches a start time to builder
     * 
     * @param { Date } date
     */
    setStartTime(date) {
        if (!(date instanceof Date) || isNaN(date)) {
            throw new Error('not a date');
        }
        this.start = date;
    }

    /**
     * Attaches an end time to builder
     * 
     * @param { Date } date
     */
    setEndTime(date) {
        if (!(date instanceof Date) || isNaN(date)) {
            throw new Error ('not a date');
        }
        this.end = date;
    }

    setMatchInfo(match) {
        this.description = match.description;
        this.setSummary(match.summary);
        this.setStartTime(match.start);
        this.setEndTime(new Date(match.start.getFullYear(), match.start.getMonth(), match.start.getDate(), match.start.getHour() + 1, match.start.getMinute() + 30).toISOString());
    }
    /**
    * Builds an event object and returns it
    * 
    * @return { gCalEvent }
    */
    build() {
        gCalEvent.summary = this.summary;
        gCalEvent.description = this.description;
        gCalEvent.start.dateTime = this.start;
        gCalEvent.end.dateTime = this.end;
        return gCalEvent;
    }
}

module.exports = {
    EventBuilder
}