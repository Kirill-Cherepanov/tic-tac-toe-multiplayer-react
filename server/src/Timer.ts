export default class Timer {
  private TIMERINTERVAL: number;
  private _time: number; // current time
  private _maxTime: number;
  private timer: NodeJS.Timer | undefined;
  private callback!: Function;

  constructor() {
    this.TIMERINTERVAL = 200;
    this._maxTime = 0;
    this._time = 0;
  }

  get time(): number {
    return this._time;
  }

  get maxTime(): number {
    return this._maxTime;
  }

  reset() {
    if (this.timer !== undefined) clearInterval(this.timer);

    this.timer = undefined;
    this._time = 0;
    this._maxTime = 0;
  }

  start(maxTime: number, callback: Function) {
    this._maxTime = maxTime;
    this.callback = callback;
    this.timer = setInterval(() => {
      if (this._time >= this._maxTime) {
        this.reset();
        console.log('time: ' + this._time + ' maxTime: ' + this._maxTime);
        callback();
      }
      this._time += this.TIMERINTERVAL;
    }, this.TIMERINTERVAL);
  }

  pause() {
    clearInterval(this.timer);
    this.timer = undefined;
    this._maxTime = this._maxTime - this._time;
    this._time = 0;
  }

  resume() {
    if (this.timer !== undefined) return;

    this.start(this._maxTime, this.callback);
  }
}
