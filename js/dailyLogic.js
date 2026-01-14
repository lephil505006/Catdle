import { ANSWER_LIST } from './answers.js';

export class DailyLogic {
    static LAUNCH_DATE = new Date('2026-01-14T17:00:00Z'); // 11 AM CST
    static RESET_HOUR_UTC = 17;

    constructor(catsData) {
        this.cats = catsData;
        this.unitIdMap = new Map();
        this.nameMap = new Map();
        this.cats.forEach(cat => {
            this.unitIdMap.set(cat.unitId, cat);
            this.nameMap.set(cat.name, cat);
        });
    }

    getDaysSinceLaunch() {
        const now = new Date();
        const launch = DailyLogic.LAUNCH_DATE;
        
        const diffMs = now - launch;
        let diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        const currentUTCHour = now.getUTCHours();
        if (currentUTCHour < DailyLogic.RESET_HOUR_UTC) {
            diffDays--;
        }
        
        return Math.max(0, diffDays);
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
        const answerRef = this.getAnswerRefByDay(dayIndex);    
        const cat = this.lookupCat(answerRef);
        
        if (!cat) {
            console.warn(`Cat not found for reference:`, answerRef);
            return this.getPlaceholderCat();
        }
        return cat;
    }

    getYesterdaysAnswer() {
        const dayIndex = this.getDaysSinceLaunch() - 1;       
        if (dayIndex < 0) {
            return this.getPlaceholderCat();
        }
        
        const answerRef = this.getAnswerRefByDay(dayIndex);     
        const cat = this.lookupCat(answerRef);
        
        if (!cat) {
            return this.getPlaceholderCat();
        }
        return cat;
    }

    getAnswerRefByDay(dayIndex) {
        if (dayIndex < 0) {
            return null;
        }
        
        const safeIndex = dayIndex % ANSWER_LIST.length;
        return ANSWER_LIST[safeIndex] || null;
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
        return {
            unitId: 0,
            name: 'Cat',
            img: 'images/cats/Cat.webp',
            rarity: 'Normal',
            form: 'Normal Form',
            role: '',
            traits: '',
            attackType: '',
            abilities: '',
            cost: '0¢',
            version: 'V1.0',
            source: 'Unknown'
        };
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