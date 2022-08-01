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
    if (this.timer === undefined)
      throw Error('Can not reset the timer. Timer was not set!');

    clearInterval(this.timer);
    this.timer = undefined;
    this._time = 0;
    this._maxTime = 0;
  }

  restart() {
    const prevTime = this._maxTime;
    this.reset();
    this.start(prevTime, this.callback);
  }

  start(maxTime: number, callback: Function) {
    this._maxTime = maxTime;
    this.callback = callback;
    this.timer = setInterval(() => {
      if (this._time >= this._maxTime) {
        this.reset();
        callback();
      }
      this._time += this.TIMERINTERVAL;
    }, this.TIMERINTERVAL);
  }

  add(addTime: number) {
    const timeLeft = this._maxTime - this._time;
    this.reset();
    if (timeLeft + addTime >= 0) this.start(timeLeft + addTime, this.callback);
  }
}
