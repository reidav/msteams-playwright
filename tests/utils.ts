export class TimeHelper {
    static pause(ms: number) {
        return new Promise(f => setTimeout(f, ms));
    }
}