export class BotTurnController {
  constructor({ setTimer, clearTimer } = {}) {
    this.setTimer = setTimer ?? ((callback, delay) => globalThis.setTimeout(callback, delay));
    this.clearTimer = clearTimer ?? ((timer) => globalThis.clearTimeout(timer));
    this.timer = null;
    this.generation = 0;
  }

  schedule(callback, delay) {
    this.cancel();
    const scheduledGeneration = this.generation;
    this.timer = this.setTimer(() => {
      this.timer = null;
      if (scheduledGeneration === this.generation) callback();
    }, delay);
  }

  cancel() {
    this.generation += 1;
    if (this.timer !== null) this.clearTimer(this.timer);
    this.timer = null;
  }
}
