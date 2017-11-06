const board = {
  canvas: document.getElementById('canv'),
  img: new Image(),
  active: true,
  color: '#CCC',
  speed: 20,
  flexSpeed: 250,
  inverted: false,
  flexStability: false,
  setFlex: () => {
    setTimeout(() => {
      board.inverted = !board.inverted;
      if (board.flexStability) board.setFlex();
    }, board.flexSpeed);
  },
  adjust: function() {
    board.canvas.width = window.innerWidth;
    board.canvas.height = window.innerHeight;
  },
  drawBoard: function() {
    board.context.drawImage(board.img, 0,0, board.img.width, board.img.height, 0,0, board.canvas.width, board.canvas.height);
    //ctx.drawImage(image, innerx, innery, innerWidth, innerHeight, outerx, outery, outerWidth, outerHeight);
    /*
    board.context.fillStyle = board.color;
    let gradient = board.context.createLinearGradient(0,0,board.canvas.width,board.canvas.height);
    gradient.addColorStop(0, 'white');
    gradient.addColorStop(1, board.color);
    board.context.fillStyle = gradient;
    board.context.fillRect(0,0,board.canvas.width,board.canvas.height);
    */
  }
}
board.context = board.canvas.getContext('2d');
board.img.src = 'verge.png';

const dot = {
  solidLine: false,
  size: 8,
  dots: [],
  colors: ['blue','red','green','cyan','yellow','pink','lightBlue','orange','purple','magenta'],
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
  createDot: function(x,y) {
    dot.dots.push({
      color: dot.colors[Math.floor(Math.random() * dot.colors.length)],
      size: Math.floor(Math.random() * 6 + 4),
      clockwise: Math.random() > 0.5,
      x: x-8,
      y: y-8,
      h: 0,
      v: 0
    });
  },
  lineCheck: function() {
    if (!dot.solidLine) {
      board.drawBoard();
    }
  },
  drawCenter: function() {
    board.context.fillStyle = 'white';
    board.context.beginPath();
    board.context.arc(board.canvas.width/2,board.canvas.height/2,10,0,2*Math.PI);
    board.context.fill();
  },
  boundaryCheck: function(dt) {
    if (dt.x < 0 && dt.y < 0 ||
        dt.x > board.canvas.width && dt.y < 0 ||
        dt.x > board.canvas.width && dt.y > board.canvas.height ||
        dt.x < 0 && dt.y > board.canvas.height) {
      const removal = dot.dots.indexOf(dt);
      dot.dots.splice(removal,1);
      return true;
    } else {
      return false;
    }
  },
  allDots: function() {
    dot.lineCheck();
    dot.drawCenter();
    for (let dt of dot.dots) {
      if (dot.boundaryCheck(dt)) {
        return;
      }
      dot.drawDot(dt.x, dt.y, dt.size, dt.color);
      dot.adjust(dt);
    }
  },
  adjust: function(dt) {
    dot.curve(dt);
    dt.x += dt.h;
    dt.y += dt.v;
  },
  setCounter: () => {
    for (const dt of dot.dots) {
      if (dt.clockwise) dt.clockwise = false;
    }
  },
  setRandom: () => {
    for (const dt of dot.dots) {
      dt.clockwise = Math.random() < 0.5;
    }
  },
  setClockwise: () => {
    for (const dt of dot.dots) {
      if (!dt.clockwise) dt.clockwise = true;
    }
  },
  curve: function(dt) {
    let xd,yd;
    // determines whether balls curve inwards or outwards
    if (board.inverted) {
      xd = Math.abs(board.canvas.width / 2 - (dt.x + dt.h));
      yd = Math.abs(board.canvas.height / 2 - (dt.y + dt.v));
    } else {
      xd = Math.abs(board.canvas.width / 2 - dt.x);
      yd = Math.abs(board.canvas.height / 2 - dt.y);
    }
    (xd === 0) ? xd = 0.1 : (yd === 0) ? yd = 0.1 : null;
    let zd = xd + yd; //Math.abs(xd) + Math.abs(yd);
    const unit = 10 / zd;
    dt.h = unit * yd;
    dt.v = unit * xd;
    if (dt.x < board.canvas.width/2) { // LEFT
      dt.v *= -1;
    }
    if (dt.y > board.canvas.height/2) { // BOTTOM
      dt.h *= -1;
    }
    if (!dt.clockwise) {
      dt.h *= -1;
      dt.v *= -1;
    }
  },
  drawDot: function(x,y,s,c) {
    board.context.fillStyle = dot.hexCodes[c];
    board.context.beginPath();
    board.context.arc(x, y, s, 0, 2 * Math.PI);
    board.context.fill();
  }
};

function logCor(clik) {
  dot.createDot(clik.clientX - (window.innerWidth/2 - board.canvas.width/2), clik.clientY);
}

function looper() {
  dot.allDots();
  if (sprinkles.active) sprinkles.adjust();
}

let loop = setInterval(looper, board.speed);

function keyPushes(btn) {
  if (btn.keyCode == 32) { // SPACE
    (board.active) ? clearInterval(loop) : loop = setInterval(looper, board.speed);
    board.active = !board.active;
  }
  if (btn.keyCode == 73) dot.setCounter();
  if (btn.keyCode == 79) dot.setRandom();
  if (btn.keyCode == 80) dot.setClockwise();
  if (btn.keyCode == 74) sprinkles.setUpLeft();
  if (btn.keyCode == 75) sprinkles.setRandom();
  if (btn.keyCode == 76) sprinkles.setDownRight();
  if (btn.keyCode == 65) { // A
    sprinkles.vertical = !sprinkles.vertical;
    sprinkles.flipAll();
  }
  if (btn.keyCode == 69) board.inverted = !board.inverted; // E
  if (btn.keyCode == 70) { // F
    board.flexStability = !board.flexStability;
    if (board.flexStability) {
      board.setFlex();
    }
  }
  if (btn.keyCode == 81) sprinkles.passingThrough = !sprinkles.passingThrough; // Q
  if (btn.keyCode == 82) { // R
    if (!board.active) {
      board.active = true;
      loop = setInterval(looper, board.speed);
    }
    dot.dots = [];
    sprinkles.drops = [];
    board.drawBoard();
  }
  if (btn.keyCode == 86) { // V
    dot.solidLine = !dot.solidLine;
    if (!dot.solidLine && !board.active) {
      dot.allDots();
      sprinkles.adjust();
    }
  }
  if (btn.keyCode == 87) { // W
    sprinkles.active = !sprinkles.active;
    if (sprinkles.drops.length> 0) sprinkles.drops = [];
    if (!board.active) {
      board.drawBoard();
      dot.allDots();
    }
  }
}

document.addEventListener('click',logCor);
document.addEventListener('keydown',keyPushes);

const sprinkles = {
  active: false,
  passingThrough: true,
  vertical: true,
	speedrange: 4, // range of vertical speed possible when creating sprinkles
  setUpLeft: () => {
    for (const sprink of sprinkles.drops) {
      if (sprink.speed > 0) sprink.speed = -sprink.speed;
    }
  },
  setRandom: () => {
    for (const sprink of sprinkles.drops) {
      if (Math.random() < 0.5) sprink.speed *= -1;
    }
  },
  setDownRight: () => {
    for (const sprink of sprinkles.drops) {
      if (sprink.speed < 0) sprink.speed = Math.abs(sprink.speed);
    }
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
	drip: () => {
		let wth = 2 + Math.floor(Math.random() * 8);
		let hgt = 10 + Math.floor(Math.random() * 10);
		const spd = 2 + Number((Math.random() * sprinkles.speedrange).toFixed(1));
    let xPos = Math.floor(Math.random() * board.canvas.width-wth);
    let yPos = -hgt;
    if (!sprinkles.vertical) {
      [wth,hgt,xPos,yPos] = [hgt,wth,yPos,xPos];
    }
		sprinkles.drops.push({
			color: sprinkles.colors[Math.floor(Math.random() * sprinkles.colors.length)],
			width: wth,
			height: hgt,
			x: xPos, 
			y: yPos,
			speed: spd,
			trueSpeed: spd
		});
	},
	adjust: function() {
    if (Math.random() * 10 < sprinkles.dripFrequency && sprinkles.drops.length < 30) sprinkles.drip();
		const removals = [];
    
		for (let drop of sprinkles.drops) {
			(sprinkles.vertical) ? drop.y += drop.speed : drop.x += drop.speed;
			if (drop.y >= board.canvas.height || drop.y + drop.height*2 < 0 || drop.x + drop.width*2 < 0 || drop.x > board.canvas.width) {
				const index = sprinkles.drops.indexOf(drop);
				removals.push(index);
			}
		  board.context.fillStyle = sprinkles.hexCodes[drop.color];
			board.context.fillRect(drop.x, drop.y, drop.width, drop.height);
      if (!sprinkles.passingThrough) {
        let sprinkPos, center;
        if (sprinkles.vertical) {
          sprinkPos = drop.y + drop.height / 2;
          center = board.canvas.height / 2;
        } else {
          sprinkPos = drop.x + drop.width / 2;
          center = board.canvas.width / 2;
        }
        if (sprinkPos > center) {
          if (drop.speed > -drop.trueSpeed) drop.speed -= drop.trueSpeed * 0.01;
        } else {
          if (drop.speed < drop.trueSpeed) drop.speed += drop.trueSpeed * 0.01;
        }
      }
		}
    
		if (removals.length > 1) {
      for (let i = 0; i < removals.length; i++) {
        sprinkles.drops.splice(removals[0],1);
      }
    } else if (removals.length == 1) {
      sprinkles.drops.splice(removals[0],1);
    }
	},
  flipAll: () => {
    if (sprinkles.drops.length > 0) {
      for (const drop of sprinkles.drops) {
        [drop.x,drop.y,drop.width,drop.height] = [drop.y,drop.x,drop.height,drop.width];
      }
    }
  }
}
