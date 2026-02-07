import { ANSWER_LIST } from './answers.js';

export class DailyLogic {
    static LAUNCH_DATE = new Date(Date.UTC(2026, 0, 28, 17, 0, 0)); // 11 AM CST
    static RESET_HOUR_UTC = 17;

    constructor(catsData) {
        this.cats = catsData;
    }

    findCatByIdAndForm(unitId, form) {
        return this.cats.find(cat =>
            cat.unitId === unitId && cat.form === form
        );
    }

    getDaysSinceLaunch() {
        const now = new Date();
        const launch = DailyLogic.LAUNCH_DATE;
        const msSinceLaunch = now.getTime() - launch.getTime();
        const msPerDay = 1000 * 60 * 60 * 24;

        return Math.max(0, Math.floor(msSinceLaunch / msPerDay));
    }

    getCurrentGameDay() {
        const nowUTC = new Date();
        const currentUTCHour = nowUTC.getUTCHours();

        if (currentUTCHour < DailyLogic.RESET_HOUR_UTC) {
            const yesterday = new Date(nowUTC);
            yesterday.setUTCDate(yesterday.getUTCDate() - 1);
            return this.getUTCDateString(yesterday);
        } else {
            return this.getUTCDateString(nowUTC);
        }
    }

    getUTCDateString(date) {
        return date.toISOString().split('T')[0];
    }

    getYesterdayGameDay() {
        const today = new Date(this.getCurrentGameDay() + 'T12:00:00Z');
        today.setUTCDate(today.getUTCDate() - 1);
        return this.getUTCDateString(today);
    }

    getTodaysAnswer() {
        const dayIndex = this.getDaysSinceLaunch();

        if (dayIndex < 0 || dayIndex >= ANSWER_LIST.length) {
            return this.getFallbackAnswer();
        }

        const answerEntry = ANSWER_LIST[dayIndex];
        const cat = this.findCatByIdAndForm(answerEntry.unitId, answerEntry.form);

        if (!cat) {
            console.warn(`Cat not found for day ${dayIndex}: unitId ${answerEntry.unitId}, form ${answerEntry.form}`);
            return this.getFallbackAnswer();
        }

        return cat;
    }

    getYesterdaysAnswer() {
        const dayIndex = this.getDaysSinceLaunch() - 1;

        if (dayIndex < 0) {
            return this.getPlaceholderCat();
        }

        if (dayIndex >= ANSWER_LIST.length) {
            return this.getFallbackAnswer();
        }

        const answerEntry = ANSWER_LIST[dayIndex];
        const cat = this.findCatByIdAndForm(answerEntry.unitId, answerEntry.form);

        return cat || this.getPlaceholderCat();
    }

    getAnswerRefByDay(dayIndex) {
        if (dayIndex < 0) {
            return null;
        }

        const safeIndex = dayIndex % ANSWER_LIST.length;
        return ANSWER_LIST[safeIndex] || null;
    }

    getFallbackAnswer() {
        const randomIndex = Math.floor(Math.random() * this.cats.length);
        return this.cats[randomIndex];
    }

    lookupCat(answerRef) {
        if (!answerRef) {
            return null;
        }

        if (answerRef.unitId !== undefined) {
            const catById = this.unitIdMap.get(answerRef.unitId);
            if (catById) {
                return catById;
            }
        }

        if (answerRef.name) {
            const catByName = this.nameMap.get(answerRef.name);
            if (catByName) {
                return catByName;
            }
        }

        return null;
    }

    getPlaceholderCat() {
        return this.findCatByIdAndForm(1, "Normal Form") || this.cats[0];
    }

    getTimeUntilNextReset() {
        const now = new Date();
        const utcHours = now.getUTCHours();
        const utcMinutes = now.getUTCMinutes();
        const utcSeconds = now.getUTCSeconds();

        const resetUTC = DailyLogic.RESET_HOUR_UTC;
        let secondsUntilReset;

        if (utcHours < resetUTC) {
            secondsUntilReset = (resetUTC - utcHours) * 3600 - utcMinutes * 60 - utcSeconds;
        } else {
            secondsUntilReset = (24 - utcHours + resetUTC) * 3600 - utcMinutes * 60 - utcSeconds;
        }

        const hours = Math.floor(secondsUntilReset / 3600);
        const minutes = Math.floor((secondsUntilReset % 3600) / 60);
        const seconds = secondsUntilReset % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}