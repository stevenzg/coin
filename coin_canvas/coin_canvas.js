window.requestAnimFrame = (function(){
  return window.requestAnimationFrame       ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    window.oRequestAnimationFrame      ||
    window.msRequestAnimationFrame     ||
    function( callback ){
      window.setTimeout(callback, 1000 / 60);
    };
})();


var helloWorldImage = new Image();
helloWorldImage.src = 'ele.png';

var Coin = {

  // canvas的实际宽度和高度
  WIDTH: 320,
  HEIGHT: 480,

  // 根据屏幕的大小resize后的缩放比例
  scale: 1,

  // canvas相对于屏幕的位置
  offset: {
    top: 0,
    left: 0
  },

  // 存储所有的金币，点击效果，金币碎片
  elements: [],

  // 游戏计时器，隔多久出来新的硬币
  tick: 100,

  // 用户的得分情况
  score: {
    tabs: 0,
    hit: 0,
    escaped: 0,
    accuracy: 0
  },

  // 长宽比例
  RATIO:  null,

  // resize后的canvas的宽度和高度
  currentWidth:  null,
  currentHeight:  null,

  // canvas对象
  canvas: null,

  // canvas context
  context:  null,

  init: function () {
    Coin.RATIO = Coin.WIDTH / Coin.HEIGHT;

    Coin.currentWidth = Coin.WIDTH;
    Coin.currentHeight = Coin.HEIGHT;

    Coin.canvas = document.getElementsByTagName('canvas')[0];

    Coin.canvas.width = Coin.WIDTH;
    Coin.canvas.height = Coin.HEIGHT;

    Coin.context = Coin.canvas.getContext('2d');

    window.addEventListener('click', function (e) {
      console.log('click');
      e.preventDefault();
      Coin.Event.add(e);
    }, false);

    window.addEventListener('touchstart', function(e) {
      console.log('touchstart');
      e.preventDefault();
      Coin.Event.add(e.touches[0]);
    }, false);

    window.addEventListener('touchmove', function(e) {
      console.log('touchmove');
      e.preventDefault();
    }, false);

    window.addEventListener('touchend', function(e) {
      console.log('touchend');
      e.preventDefault();
    }, false);

    Coin.resizeCanvas();

    Coin.falling();
  },

  resizeCanvas: function () {
    // 将canvas的高度设置成窗口的高度
    Coin.currentHeight = window.innerHeight;
    // 按照长宽比例缩放宽度
    Coin.currentWidth = Coin.currentHeight * Coin.RATIO;

    Coin.canvas.style.height = Coin.currentHeight + 'px';
    Coin.canvas.style.width = Coin.currentWidth + 'px';

    Coin.scale = Coin.currentWidth / Coin.WIDTH;
    Coin.offset.top = Coin.canvas.offsetTop;
    Coin.offset.left = Coin.canvas.offsetLeft;
  },

  repaintCanvas: function () {
    var i, isCollision = false;

    Coin.tick -= 1;

    if (Coin.tick < 0) {
      Coin.elements.push(new Coin.RMB());
      Coin.tick = ( Math.random() * 100 ) + 100;
    }

    if (Coin.Event.tabbed) {
      Coin.score.taps += 1;
      Coin.elements.push(new Coin.Touch(Coin.Event.x, Coin.Event.y));
      Coin.Event.tabbed = false;
      isCollision = true;
    }

    for (i = 0; i < Coin.elements.length; ++i) {
      Coin.elements[i].updateElement();

      if (Coin.elements[i].type === 'rmb' && isCollision) {
        hit = Coin.collide(Coin.elements[i], {x: Coin.Event.x, y: Coin.Event.y, radius: 7});
        // 当击中后，显示一些碎片
        if (hit) {
          for (var n = 0; n < 5; ++n) {
            Coin.elements.push(new Coin.Particle(Coin.elements[i].x, Coin.elements[i].y
            ));
          }
          Coin.score.hit += 1;
        }
        Coin.elements[i].remove = hit;
      }

      if (Coin.elements[i].remove) {
        Coin.elements.splice(i, 1);
      }
    }
  },

  render: function () {
    // 整个canvas的颜色
    Coin.Draw.rect(0, 0, Coin.WIDTH, Coin.HEIGHT, '#1e89e0');
    for (var i = 0, len = Coin.elements.length; i < len; ++i) {
      Coin.elements[i].render();
    }
  },

  falling: function () {
    requestAnimFrame(Coin.falling);
    Coin.repaintCanvas();
    Coin.render();
  }
};

Coin.Draw = {
  clear: function() {
    Coin.context.clearRect(0, 0, Coin.WIDTH, Coin.HEIGHT);
  },

  rect: function(x, y, w, h, color) {
    Coin.context.fillStyle = color;
    Coin.context.fillRect(x, y, w, h);
  },

  circle: function(x, y, r, color) {
    Coin.context.fillStyle = color;
    Coin.context.beginPath();
    Coin.context.arc(x, y + 5, r, 0,  Math.PI * 2, true);
    Coin.context.closePath();
    Coin.context.fill();
  },

  text: function(string, x, y, size, color) {
    Coin.context.font = 'bold '+size+'px Monospace';
    Coin.context.fillStyle = color;
    Coin.context.fillText(string, x, y);
  },

  image: function (dx, dy, radius) {
    Coin.context.drawImage(helloWorldImage, dx, dy, radius, radius);
  }
};


// 点击后的碎片效果
Coin.Particle = function(x, y) {
  this.x = x;
  this.y = y;
  this.radius = 2;
  this.color = 'rgba(255,255,255,'+Math.random()*1+')';

  // 碎片的方向，向左或者向右，1向右，-1向左
  this.direction = (Math.random() * 2 > 1) ? 1 : -1;

  // x,y方向的变化速度
  this.xSpeed = ~~(Math.random() * 4) * this.direction;
  this.ySpeed = ~~(Math.random() * 7);
  this.remove = false;

  this.updateElement = function() {
    // 更新碎片的位置
    this.x += this.xSpeed;
    this.y += this.ySpeed;

    // 改变速速，减速
    this.xSpeed *= 0.99;
    this.ySpeed *= 0.99;

    // 避免y方向速度太慢
    this.ySpeed += 0.25;

    // 超出屏幕后，移除
    if (this.y > Coin.HEIGHT + 10) {
      this.remove = true;
    }
  };

  this.render = function() {
    Coin.Draw.circle(this.x, this.y, this.radius, this.color);
  };

};

// 生成金币
Coin.RMB = function () {
  this.type = 'rmb';

  // 半径大小
  this.radius = (Math.random() * 20) + 10;

  // 下降的速度
  this.speed = (Math.random() * 3) + 1;

  // 水平方向的位置
  this.x = (Math.random() * (Coin.WIDTH) - this.radius * 2);
  if (this.x < this.radius) {
    this.x = this.radius;
  }

  this.y = 0;

  this.remove = false;

  this.updateElement = function () {
    this.y += this.speed;

    if (this.y > Coin.HEIGHT + 10) {
      Coin.score.escaped += 1;
      this.remove = true;
    }
  };

  this.render = function () {
    Coin.Draw.image(this.x, this.y, this.radius * 2);
  };
};

// 点击后显示一个点击的效果
Coin.Touch = function (x, y) {
  this.type = 'touch';
  this.x = x;
  this.y = y;
  this.radius = 5;
  this.opacity = 1;
  this.fade = 0.05;

  this.updateElement = function () {
    this.opacity -= this.fade;
    this.remove = (this.opacity < 0) ? true : false;
  };

  this.render = function () {
    Coin.Draw.circle(this.x, this.y, this.radius, 'rgba(255,0,0,'+this.opacity+')');
  }
};

// 检查有没有产生碰撞
Coin.collide = function(a, b) {
  var distance_squared = ( ((a.x - b.x) * (a.x - b.x)) + ((a.y - b.y) * (a.y - b.y)));

  var radii_squared = (a.radius + b.radius) * (a.radius + b.radius);

  if (distance_squared < radii_squared) {
    return true;
  } else {
    return false;
  }
};

// 事件
Coin.Event = {
  x: 0,
  y: 0,
  tabbed: false,
  add: function (event) {
    // MouseEvent.pageX
    this.x = (event.pageX - Coin.offset.left) / Coin.scale;

    // MouseEvent.pageY
    this.y = (event.pageY - Coin.offset.top) / Coin.scale;
    this.tabbed = true;
  }
};

window.addEventListener('load', Coin.init, false);
window.addEventListener('resize', Coin.resizeCanvas, false);
