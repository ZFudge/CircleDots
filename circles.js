const board = {
  canvas: document.getElementById('canv'),
  img: new Image(),
  active: true,
  color: '#CCC',
  speed: 15,
  flexSpeed: 250,
  inverted: false,
  cross: false,
  centerSize: 5,
  flexStability: false,
  setFlex: () => {
    setTimeout(() => {
      board.inverted = !board.inverted;
      if (board.flexStability) board.setFlex();
    }, board.flexSpeed);
  },
  adjust: () => {
    board.canvas.width = window.innerWidth;
    board.canvas.height = window.innerHeight;
  },
  drawBoard: () => {
    board.context.drawImage(board.img, 0,0,board.img.width,board.img.height,0,0,board.canvas.width, board.canvas.height);
  }
}
board.context = board.canvas.getContext('2d');
board.img.src = 'images/mirrored-mountains.png';

const dot = {
  solidLine: false,
  speed: 7,
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
  createDot: (x,y) => {
    dot.dots.push({
      color: dot.colors[Math.floor(Math.random() * dot.colors.length)],
      radius: Math.floor(Math.random() * 4 + 4),
      clockwise: Math.random() > 0.5,
      x: x-8,
      y: y-8,
      h: 0,
      v: 0
    });
  },
  lineCheck: () => {
    if (!dot.solidLine) board.drawBoard();
  },
  drawCenter: () => {
    board.context.fillStyle = 'white';
    board.context.beginPath();
    board.context.arc(board.canvas.width/2, board.canvas.height/2, board.centerSize, 0, 2*Math.PI);
    board.context.fill();
  },
  boundaryCheck: (dt) => {
    if (dt.x < 0 && dt.y < 0 || dt.x > board.canvas.width && dt.y < 0 || 
      dt.x > board.canvas.width && dt.y > board.canvas.height || dt.x < 0 && dt.y > board.canvas.height) {
      const removeIndex = dot.dots.indexOf(dt);
      dot.dots.splice(removeIndex,1);
    }
  },
  allDots: () => {
    dot.lineCheck();
    dot.drawCenter();
    dot.dots.forEach((d) => {
      dot.adjust(d);
      dot.drawDot(d.x, d.y, d.radius, d.color);
      dot.boundaryCheck(d);
    });
  },
  adjust: (dt) => {
    (board.cross) ? dot.cross(dt) : dot.curve(dt);
    dt.x += dt.h;
    dt.y += dt.v;
  },
  setCounter: () => {
    dot.dots.forEach((d) => (d.clockwise) ? d.clockwise = false : null);
  },
  setRandom: () => {
    dot.dots.forEach((d) => d.clockwise = Math.random() < 0.5);
  },
  setClockwise: () => {
    dot.dots.forEach((d) => (!d.clockwise) ? d.clockwise = true : null);
  },
  curve: (dt) => {
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
    let zd = xd + yd;
    const unit = 10 / zd;
    dt.h = unit * yd;
    dt.v = unit * xd;
    if (dt.x < board.canvas.width/2) dt.v *= -1; // LEFT
    if (dt.y > board.canvas.height/2) dt.h *= -1; // BOTTOM
    if (!dt.clockwise) {
      dt.h *= -1;
      dt.v *= -1;
    }
  },
  cross: (dt) => {
    (dt.x < board.canvas.width / 2) ? dt.h += 0.25 : dt.h -= 0.25; //dot.speed * 0.045
    (dt.y < board.canvas.height / 2) ? dt.v += 0.25 : dt.v -= 0.25;
  },
  drawDot: (x,y,s,c) => {
    board.context.fillStyle = dot.hexCodes[c];
    board.context.beginPath();
    board.context.arc(x, y, s, 0, 2 * Math.PI);
    board.context.fill();
  }
};

function logCor(clik) {
  if (clik.clientY < board.canvas.height &&
    clik.clientX > (window.innerWidth/2 - board.canvas.width/2) && 
    clik.clientX < (window.innerWidth/2 + board.canvas.width/2)
      ) {
    dot.createDot(clik.clientX - (window.innerWidth/2 - board.canvas.width/2), clik.clientY);

  }
}

function looper() {
  dot.allDots();
  if (sprinkles.active) sprinkles.adjust();
}

let loop = setInterval(looper, board.speed);

const sprinkles = {
  active: false,
  passingThrough: true,
  vertical: true,
	speedrange: 4, // range of vertical speed possible when creating sprinkles
  setUpLeft: () => {
    sprinkles.drops.forEach((s) => (s.speed > 0) ? s.speed *= -1 : null);
  },
  setRandom: () => {
    sprinkles.drops.forEach((s) => (Math.random() > 0.5) ? s.speed *= -1 : null);
  },
  setDownRight: () => {    
    sprinkles.drops.forEach((s) => (s.speed < 0) ? s.speed*=-1 : null);
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
	adjust: () => {
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
    if (sprinkles.drops.length > 0) sprinkles.drops.forEach((s) => [s.x,s.y,s.width,s.height] = [s.y,s.x,s.height,s.width]);
  }
}

async function imageRewrite(img) {
  clearInterval(loop);
  board.img.src = `images/${img}.png`;
  board.drawBoard();
  dot.allDots();
  sprinkles.adjust();
  loop = setInterval(looper, board.speed);
}

async function detImgWrite(img) {
  await imageRewrite(img);
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 49:1 50:2 ... 57:9 48:0
function keyPushes(btn) {
  if (btn.keyCode == 32) { // SPACE
    (board.active) ? clearInterval(loop) : loop = setInterval(looper, board.speed);
    board.active = !board.active;
  }
  if (btn.keyCode == 49) detImgWrite('mirrored-mountains');
  if (btn.keyCode == 50) detImgWrite('smoke-cream-mirror');
  if (btn.keyCode == 51) detImgWrite('smoke-white');
  if (btn.keyCode == 52) detImgWrite('tower-rose');
  if (btn.keyCode == 53) detImgWrite('tower-blue');
  if (btn.keyCode == 54) detImgWrite('grass');
  if (btn.keyCode == 55) detImgWrite('tri-golden');
  if (btn.keyCode == 56) detImgWrite('tri-orange');
  if (btn.keyCode == 57) detImgWrite('tri-layered');
  if (btn.keyCode == 48) detImgWrite('prism');

  if (btn.keyCode == 71) board.cross = !board.cross;
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
    if (board.flexStability) board.setFlex();
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
  if (btn.keyCode === 84) {
    dot.dots = [];
    board.drawBoard();
    sprinkles.adjust();
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
