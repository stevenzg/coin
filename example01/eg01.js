var coinFalling = (function () {
  var totalCoins = 10;
  var intervalTop;
  //var screenWidth = document.body.clientWidth;
  //var screenHeight = document.body.scrollHeight;
  var screenWidth = window.innerWidth;
  var screenHeight = window.innerHeight;

  function caughtCoin(node) {
    console.log('clicked:', node);
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }
    var currentGrade = document.getElementById('caught-coins').innerHTML;
    currentGrade = parseInt(currentGrade);
    console.log('currentGrade:', typeof currentGrade);
    document.getElementById('caught-coins').innerHTML = currentGrade+1;
  }

  function Coin() {
    var leftPosition = Math.floor(Math.random() * ( screenWidth + 1));
    if (leftPosition + 112 >= screenWidth) {
      leftPosition = screenWidth - 112;
    }

    this.topPosition = -60;
    this.img = document.createElement('img');
    this.img.setAttribute('src', 'imgs/coin.png');
    this.img.style.position = 'absolute';
    this.img.style.left = leftPosition + 'px';
    this.img.style.top = '-60px';
    this.img.style.width = '60px';
    this.img.style.height = '60px';
    this.img.addEventListener('click', function () {
      console.log('clicking');
      caughtCoin(this);
    }, false);
  }

  function moveCoin (currentImg) {
    currentImg.topPosition = currentImg.topPosition + 15;
    if(currentImg.topPosition > screenHeight-60) {
      clearInterval(currentImg.interval);
      var node = currentImg.img;
      if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
    } else {
      currentImg.img.style.top = currentImg.topPosition + 'px';
    }
  }

  function displayImg (imgObj) {
    document.getElementById('container').appendChild(imgObj.img);
    var interval = window.setInterval(function() {
      imgObj.interval = interval;
      moveCoin(imgObj);
    }, 100);
  }

  function generateCoins() {
    var popCount = Math.floor(Math.random() * ( 2 + 1)) + 1;

    console.log('totalCoins:xxx:', totalCoins);
    if (totalCoins === 0) {
      var imgChildNodes = document.getElementById('container').childNodes.length;
      if (imgChildNodes === 0) {
        document.getElementById('total-grades').innerHTML = document.getElementById('caught-coins').innerHTML;
        document.getElementById('final-grades').style.display = 'block';
        document.getElementById('grades').style.display = 'none';
        clearInterval(intervalTop);
      }
      return;
    } else if (totalCoins - popCount > 0) {
      totalCoins = totalCoins - popCount;
    } else if (totalCoins - popCount <= 0) {
      popCount = totalCoins;
      totalCoins = 0;
    }
    console.log('remainCoins:xxx:', totalCoins);
    console.log('popCount:xxx:', popCount);
    for (var i = 0; i < popCount; i++) {
      var image = new Coin();
      displayImg(image);
    }
  }

  return function() {
    generateCoins();
    intervalTop = setInterval(generateCoins, 2000);
  }

}());






