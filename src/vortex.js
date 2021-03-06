const vortex = {
  canvas: document.getElementById('vortex-canvas'),
  active: false,
  color: '#CCC',
  ms: 15,
  flexSpeed: 250,
  inverted: false,
  cross: false,
  centerSize: 5,
  flexStability: false,
  loop: null,
  setFlex() {
    vortex.flexStability = !vortex.flexStability;
    if (vortex.flexStability) vortex.inverted = !vortex.inverted;
    setTimeout(() => vortex.setFlex(), vortex.flexSpeed);
  },
  adjust() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  },
  clearvortex() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
  mainFunction() {
    dot.allDots();
    if (sprinkles.active) sprinkles.adjust();
  },
  click(click) {
    if (!vortex.loop) vortex.pauseUnpause(false);
    if (vortex.active) {
      if (document.body.scrollHeight > document.body.clientHeight) {
        if (window.scrollY > 0) {
          dot.createDot(click.clientX - (window.innerWidth/2 - vortex.canvas.width/2), click.clientY - (window.innerHeight/2 - vortex.canvas.height/2));
        } else {
          dot.createDot(click.clientX - (window.innerWidth/2 - vortex.canvas.width/2), click.clientY - (window.innerHeight/2 - vortex.canvas.height/2));
        }
      } else {
        dot.createDot(click.clientX - (window.innerWidth/2 - vortex.canvas.width/2), click.clientY - (window.innerHeight/2 - vortex.canvas.height/2));
      }
    }
  },
  pauseUnpause(btn) {
      vortex.active = !vortex.active;
      (vortex.active) ? vortex.loop = setInterval(vortex.mainFunction, vortex.ms) : clearInterval(vortex.loop);
      if (btn) vortex.setActivatedClass(btn);
  },
  reset() {
    if (this.active) {
      this.pauseUnpause(false);
    } else {
      this.setActivatedClass(document.getElementById("pause"));
    }
    this.loop = false;
    dot.dots = [];
    sprinkles.drops = [];
    vortex.clearvortex();
  },
  directionSwitch() {
    this.inverted = !this.inverted;
  },
  elipticSwitch(btn) {
    this.cross = !this.cross;
    this.setActivatedClass(btn);
  },
  solidSwitch(btn) {
    dot.solidLine = !dot.solidLine;
    if (btn) this.setActivatedClass(btn);
    if (!dot.solidLine && !this.active) {
      dot.allDots();
      sprinkles.adjust();
    }
  },
  setActivatedClass(btn) {
    (Array.from(btn.classList).includes("activated")) ? btn.classList.remove("activated") : btn.classList.add("activated");
  },
  coordinates: {
    x: document.getElementById("x"),
    y: document.getElementById("y"),
    log(event) {
      const x = event.clientX - (window.innerWidth/2 - vortex.canvas.width/2) - vortex.canvas.width/2;
      const y = event.clientY - (window.innerHeight/2 - vortex.canvas.height/2) - vortex.canvas.height/2;
      this.update(x.toFixed(0),y.toFixed(0));
    },
    update(x,y) {
      this.x.innerHTML = x;
      this.y.innerHTML = y;
    },
    clear() {
      this.x.innerHTML = "";
      this.y.innerHTML = "";
    }
  }
}
vortex.context = vortex.canvas.getContext('2d');

const dot = {
  solidLine: false,
  ms: 7,
  dots: [],
  colors: ['blue','red','green','cyan','yellow','pink','lightBlue','orange','purple','magenta'],
  hexCodes: {
    red: '#E8001F', green: '#0F0', blue: '#00F', cyan: '#00FFB7', yellow: '#E8E800', pink: '#F0F', lightBlue: '#00BABA', orange: '#E85900', purple: '#7B00D9', magenta: '#D9007E'
  },
  createDot: (x,y) => {
    dot.dots.push({
      color: dot.colors[Math.floor(Math.random() * dot.colors.length)],
      radius: Math.floor(Math.random() * 4 + 4),
      clockwise: Math.random() > 0.5,
      x: x - 8,
      y: y - 8 + window.pageYOffset,
      h: 0,
      v: 0
    });
  },
  clearCheck() {
    if (!this.solidLine) vortex.clearvortex();
  },
  drawCenter() {
    vortex.context.fillStyle = 'white';
    vortex.context.beginPath();
    vortex.context.arc(vortex.canvas.width/2, vortex.canvas.height/2, vortex.centerSize, 0, 2*Math.PI);
    vortex.context.fill();
  },
  boundaryCheck(dt) {
    if (dt.x < 0 && dt.y < 0 || dt.x > vortex.canvas.width && dt.y < 0 || 
      dt.x > vortex.canvas.width && dt.y > vortex.canvas.height || dt.x < 0 && dt.y > vortex.canvas.height) {
      const removeIndex = this.dots.indexOf(dt);
      this.dots.splice(removeIndex,1);
    }
  },
  allDots() {
    this.clearCheck();
    this.drawCenter();
    this.dots.forEach((d) => {
      this.adjust(d);
      this.drawDot(d.x, d.y, d.radius, d.color);
      this.boundaryCheck(d);
    });
  },
  adjust(dt) {
    (vortex.cross) ? this.cross(dt) : this.curve(dt);
    dt.x += dt.h;
    dt.y += dt.v;
  },
  setCounter() {
    this.dots.forEach((d) => (d.clockwise) ? d.clockwise = false : null);
  },
  setRandom() {
    this.dots.forEach((d) => d.clockwise = Math.random() < 0.5);
  },
  setClockwise() {
    this.dots.forEach((d) => (!d.clockwise) ? d.clockwise = true : null);
  },
  curve(dt) {
    let xd,yd;
    // determines whether balls curve inwards or outwards
    if (vortex.inverted) {
      xd = Math.abs(vortex.canvas.width / 2 - (dt.x + dt.h));
      yd = Math.abs(vortex.canvas.height / 2 - (dt.y + dt.v));
    } else {
      xd = Math.abs(vortex.canvas.width / 2 - dt.x);
      yd = Math.abs(vortex.canvas.height / 2 - dt.y);
    }
    (xd === 0) ? xd = 0.1 : (yd === 0) ? yd = 0.1 : null;
    let zd = xd + yd;
    const unit = 10 / zd;
    dt.h = unit * yd;
    dt.v = unit * xd;
    if (dt.x < vortex.canvas.width/2) dt.v *= -1; // LEFT
    if (dt.y > vortex.canvas.height/2) dt.h *= -1; // BOTTOM
    if (!dt.clockwise) {
      dt.h *= -1;
      dt.v *= -1;
    }
  },
  cross: (dt) => {
    (dt.x < vortex.canvas.width / 2) ? dt.h += 0.25 : dt.h -= 0.25; //dot.speed * 0.045
    (dt.y < vortex.canvas.height / 2) ? dt.v += 0.25 : dt.v -= 0.25;
  },
  drawDot(x,y,s,c) {
    vortex.context.fillStyle = this.hexCodes[c];
    vortex.context.beginPath();
    vortex.context.arc(x, y, s, 0, 2 * Math.PI);
    vortex.context.fill();
  }
};

const sprinkles = {
  active: false,
  passingThrough: true,
  vertical: true,
	speedrange: 4, // range of vertical speed possible when creating sprinkles
  setUpLeft() {
    this.drops.forEach((s) => (s.speed > 0) ? s.speed *= -1 : null);
  },
  setRandom() {
    this.drops.forEach((s) => (Math.random() > 0.5) ? s.speed *= -1 : null);
  },
  setDownRight() {    
    this.drops.forEach((s) => (s.speed < 0) ? s.speed*=-1 : null);
  },
	hexCodes: {
    red: '#E8001F',
    green: '#0F0',
    blue: '#00F',
    cyan: '#00FFB7',
    yellow: '#E8E800',
    pink: '#F0F',
    lightBlue: '#00BABA',
    orange: '#E85900',
    purple: '#7B00D9',
    magenta: '#D9007E'
	},
	colors: ['blue','red','green','cyan','yellow','pink','lightBlue','orange','purple','magenta'],
	drops: [], 
	dripFrequency: 0.2,
	drip() {
		let wth = 2 + Math.floor(Math.random() * 8);
		let hgt = 10 + Math.floor(Math.random() * 10);
		const spd = 2 + Number((Math.random() * this.speedrange).toFixed(1));
    let xPos = Math.floor(Math.random() * vortex.canvas.width-wth);
    let yPos = -hgt;
    if (!this.vertical) {
      [wth,hgt,xPos,yPos] = [hgt,wth,yPos,xPos];
    }
		this.drops.push({
			color: this.colors[Math.floor(Math.random() * this.colors.length)],
			width: wth,
			height: hgt,
			x: xPos, 
			y: yPos,
			speed: spd,
			trueSpeed: spd
		});
	},
	adjust() {
    if (Math.random() * 10 < this.dripFrequency && this.drops.length < 30) this.drip();
		const removals = [];
    this.drops.forEach(function(drop) {
      (sprinkles.vertical) ? drop.y += drop.speed : drop.x += drop.speed;
      if (drop.y >= vortex.canvas.height || drop.y + drop.height*2 < 0 || drop.x + drop.width*2 < 0 || drop.x > vortex.canvas.width) {
        const index = sprinkles.drops.indexOf(drop);
        removals.push(index);
      }
      vortex.context.fillStyle = sprinkles.hexCodes[drop.color];
      vortex.context.fillRect(drop.x, drop.y, drop.width, drop.height);
      if (!sprinkles.passingThrough) {
        let sprinkPos, center;
        if (sprinkles.vertical) {
          sprinkPos = drop.y + drop.height / 2;
          center = vortex.canvas.height / 2;
        } else {
          sprinkPos = drop.x + drop.width / 2;
          center = vortex.canvas.width / 2;
        }
        if (sprinkPos > center) {
          if (drop.speed > -drop.trueSpeed) drop.speed -= drop.trueSpeed * 0.01;
        } else {
          if (drop.speed < drop.trueSpeed) drop.speed += drop.trueSpeed * 0.01;
        }
      }
    });
    
		if (removals.length > 1) {
      for (let i = 0; i < removals.length; i++) {
        this.drops.splice(removals[0],1);
      }
    } else if (removals.length == 1) {
      this.drops.splice(removals[0],1);
    }
	},
  flipAll() {
    sprinkles.vertical = !sprinkles.vertical;
    if (this.drops.length > 0) this.drops.forEach((s) => [s.x,s.y,s.width,s.height] = [s.y,s.x,s.height,s.width]);
  },
  activeSwitch(btn) {
    this.active = !this.active;
    if (btn) vortex.setActivatedClass(btn);
    if (this.drops.length > 0) this.drops = [];
    if (!vortex.active) {
      vortex.clearvortex();
      dot.allDots();
    }
  },
  oscillationSwitch(btn) {
    if (this.active) {
      this.passingThrough = !this.passingThrough;
      vortex.setActivatedClass(btn);
    }
  }
}

function changeBackground(img) {
  vortex.canvas.style.backgroundImage = `url(images/${img}-sm.jpg)`;
  const mediumImg = new Image();
  mediumImg.onload = () => vortex.canvas.style.backgroundImage = `url(images/${img}-md.jpg)`;
  mediumImg.src = `images/${img}-md.jpg`;
  const largeImg = new Image();
  largeImg.onload = () => vortex.canvas.style.backgroundImage = `url(images/${img}.png)`;
  largeImg.src = `images/${img}.png`
  console.log(largeImg);
}

function keyPushes(btn) {
  const key = btn.keyCode;
  if (key == 49 || key == 97) changeBackground('mountains');
  if (key == 50 || key == 98) changeBackground('smoke-cream');
  if (key == 51 || key == 99) changeBackground('smoke-white');
  if (key == 52 || key == 100) changeBackground('grass');
  if (key == 53 || key == 101) changeBackground('tri-orange');
  if (key == 54 || key == 102) changeBackground('prism');
  if (key == 55 || key == 103) changeBackground('moss');
  if (key == 84) sprinkles.activeSwitch(document.getElementById("rectangle"));  // T
  if (key == 89) sprinkles.oscillationSwitch(document.getElementById("osc"));   // Y
  if (key == 85) sprinkles.flipAll();                                           // U
  if (key == 73) sprinkles.setUpLeft();                                         // I
  if (key == 79) sprinkles.setRandom();                                         // O
  if (key == 80) sprinkles.setDownRight();                                      // P

  if (key == 68) {                                                              // D
    dot.dots = [];
    vortex.clearvortex();
    sprinkles.adjust();
  }
  if (key == 70) vortex.directionSwitch();                                      // F
  if (key == 71) vortex.setFlex();                                              // G
  if (key == 72) vortex.elipticSwitch(document.getElementById("eliptic"));      // H
  if (key == 74) dot.setCounter();                                              // J
  if (key == 75) dot.setRandom();                                               // K
  if (key == 76) dot.setClockwise();                                            // L

  if (key == 90) vortex.pauseUnpause(document.getElementById("pause"));         // Z
  if (key == 88) vortex.reset();                                                // X
  if (key == 67) vortex.solidSwitch(document.getElementById("solid"));          // C
}

vortex.canvas.addEventListener('click', vortex.click);
document.addEventListener('keydown', keyPushes);

window.addEventListener("DOMContentLoaded", function() {
  changeBackground('mountains');
})