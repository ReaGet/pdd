const Timer = {
  timer: null,
  seconds: 0,
  minutes: 0,
  hours: 0,
  start: function() {
    this.seconds = 0;
    this.minutes = 0;
    this.hours = 0;
    this.stop();
    this.timer = setInterval(this.tick.bind(this), 1000);
  },
  stop: function() {
    clearInterval(this.timer);
  },
  tick: function() {
    this.seconds++;
    if (this.seconds >= 60) {
      this.seconds = 0;
        this.minutes++;
        if (this.minutes >= 60) {
          this.minutes = 0;
          this.hours++;
        }
    }
  },
  getTime: function() {
    let time = '';
    if (this.hours > 0)
      time += this.hours > 9 ? this.hours : `0${this.hours}` + ':';

    time += this.minutes > 9 ? this.minutes : `0${this.minutes}` + ':';
    time += this.seconds > 9 ? this.seconds : `0${this.seconds}`;

    return time;
  },
};

export default Timer;