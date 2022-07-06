const Timer = {
  timer: null,
  seconds: 0,
  minutes: 0,
  hours: 0,
  duration: 0,
  count: 0,
  display: null,
  start: function() {
    this.seconds = 0;
    this.minutes = 0;
    this.hours = 0;
    this.stop();
    this.timer = setInterval(this.tick.bind(this), 1000);
  },
  startCountdown: function(h, m, s, display) {
    this.seconds = s || 0;
    this.minutes = m || 0;
    this.hours = h || 0;
    this.duration = this.hours * 60 * 60 + this.minutes * 60 + this.seconds + 1;
    this.count = this.duration;
    this.stop();
    this.timer = setInterval(this.tickCountdown.bind(this), 1000);
    this.display = display;
    this.display.innerHTML = this.getTime();
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
  tickCountdown: function() {
    this.count--;
    
    this.hours = Math.max(0, parseInt(this.count / 60 / 60, 10));
    this.minutes = Math.max(0, parseInt(this.count / 60, 10));
    this.seconds = Math.max(0, parseInt(this.count % 60, 10));
    this.display.innerHTML = this.getTime();

    if (!this.hours && !this.minutes && !this.seconds) {
      this.onTimeout();
      this.stop();
    }
  },
  onTimeout: function() {

  },
  bindToTimeout: function(handler) {
    this.onTimeout = handler;
  },
  getRemainingTime: function() {
    const diff = this.duration - this.count;
    let time = '';

    let hours = Math.max(0, parseInt(diff / 60 / 60, 10));
    let minutes = Math.max(0, parseInt(diff / 60, 10));
    let seconds = Math.max(0, parseInt(diff % 60, 10));
    if (hours > 0)
      time += hours > 9 ? hours : `0${hours}` + ':';
  
    time += (minutes > 9 ? minutes : `0${minutes}` + ':');
    time += seconds > 9 ? seconds : `0${seconds}`;
  
    return time;
  },
  getTime: function() {
    let time = '';
    if (this.hours > 0)
      time += this.hours > 9 ? this.hours : `0${this.hours}` + ':';

    time += (this.minutes > 9 ? this.minutes : `0${this.minutes}` + ':');
    time += (':' + this.seconds > 9 ? this.seconds : `0${this.seconds}`);
    
    return time;
  },
};

export default Timer;