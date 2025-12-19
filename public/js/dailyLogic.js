export class DailyLogic {
    constructor(catsData) {
        this.cats = catsData;
        this.todayKey = this.getTodayKey();
        this.yesterdayKey = this.getYesterdayKey();
    }

    getTodayKey() {
        const now = new Date();
        const utcHours = now.getUTCHours();

        // 17:00 UTC = 11:00 AM CST (standard time)
        // 16:00 UTC = 11:00 AM CDT (daylight time)
        const resetUTC = 17; // Switch to 17 after spring, 16 for fall (maybe keep it as 1 setting later)

        if (utcHours < resetUTC) {
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            const todayKey = yesterday.toISOString().split('T')[0];
            return todayKey;
        }
        const todayKey = now.toISOString().split('T')[0];
        return todayKey;
    }

    getYesterdayKey() {
        const today = new Date(this.todayKey);
        today.setDate(today.getDate() - 1);
        return today.toISOString().split('T')[0];
    }

    generateSeed(dateKey) {
        let seed = 0;
        for (let i = 0; i < dateKey.length; i++) {
            seed = (seed << 5) - seed + dateKey.charCodeAt(i);
            seed = seed & seed;
        }
        return seed;
    }

    seededRandom(seed) {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }

    getTodaysAnswer() {
        const seed = this.generateSeed(this.todayKey);
        const randomIndex = Math.floor(this.seededRandom(seed) * this.cats.length);
        return this.cats[randomIndex];
    }

    getTimeUntilNextReset() {
        const now = new Date();
        const utcHours = now.getUTCHours();
        const utcMinutes = now.getUTCMinutes();
        const utcSeconds = now.getUTCSeconds();
        const resetUTC = 17; // Change in case of Daylight savings vice versa

        let secondsUntilReset;
        if (utcHours < resetUTC) {
            // Reset today
            secondsUntilReset = (resetUTC - utcHours) * 3600 - utcMinutes * 60 - utcSeconds;
        } else {
            // Reset tomorrow
            secondsUntilReset = (24 - utcHours + resetUTC) * 3600 - utcMinutes * 60 - utcSeconds;
        }

        const hours = Math.floor(secondsUntilReset / 3600);
        const minutes = Math.floor((secondsUntilReset % 3600) / 60);
        const seconds = secondsUntilReset % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}