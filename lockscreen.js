'use strict'

//scripts
var b, t, su, d;
//window
var OFF_SCREEN = -100;
var state, windowWidth, windowHeight,
  windowWidthHalf, windowHeightHalf, scaleFactor;
//RENDERING
var renderer, stage;
//time
var elapsedTime = 0, time;
//CID
var CID_SCALE = 1 / 3;
var CENTER_CID_SPEED = 0.3; //in seconds
var CID_SQUAT = 50;
var EYES_Y_OFFSET = -30;
var VIBRATE_SPEED = 2;
var CID_X_LIMIT = 200;
var cid, head, eyes, body, leftArm, rightArm, headContainer, mouthTrack,
  headTrack, face, faceFrames, cidPosY;
//bug var
var BUG_THRESHOLD = 3000;
var BUG_SIZE = 2/3;
var BUG_MOVE_STEP_INIT = 7;
var bugFrames, bugContainer, numBugs = 1, bugsSearching = 0,
  splatContainer, bugMoveStep, bugTimer;
//environment
var LIFT_DESK_SPEED = 0.2; //in seconds
var FLIP_DESK_SPEED = 0.4; // in seconds
var LIFT_DESK_HEIGHT = 120;
var background, desk, deskOffset, deskContainer;
//interaction
var TOUCH_SLOP = 20;
var UNLOCK_THRESHOLD = 3;
var touchLayer, touchInit, touchDiff, touchMove, mSlideInd,
  touching, touchChangeX, touchChangeY, movingCid = false,
  unlocking = false, stunned = false, tappingButton = false;
//collision
var mouthCollider;
//DONUTs
var INITIAL_DONUT_INTERVAL = 2000;
var INITIAL_DONUT_SPEED = 300, TOP_DONUT_SPEED = 300;
var DONUT_SCALE = 3 / 5;
var MIN_DONUT_INTERVAL = 500;
var donutContainer, dragDonut, donutInterval = INITIAL_DONUT_INTERVAL,
donutSpeed = INITIAL_DONUT_SPEED;
//splash
var splashArt, splashBG, splashContainer, splashMask;
//text Graphics
var shipIt, gameOver, baconText, ewwwText, quickEatBaconText;
//score
var MAX_SCORE_FOR_TOP_SPEED = 20000;
var scoreText, scoreLabel, score = 0, hiScore, scoreLabelStyle, scoreTextStyle;
var POPUP_VISIBLE_TIME = 2; //inseconds
var scorePopupStyle, scorePopupContainer;
//multiplier text
var multiplierLabel, multiplierText, multiplier = 0,
  multiplierLabelStyle, multiplierTextStyle;
//text size
var smallTextSize, largeTextSize;
//bacon
var INITIAL_BACON = 5;
var BACON_INITIAL_SCALE = 0.42;
var BACON_SPEED = 0.15;
var BACON_TEXT_SPEED = 0.5;
var baconContainer, baconOriginX, baconOriginY,
  baconQuantity = INITIAL_BACON, baconTrigger, eatingBacon = false;
//donuts
var DONUT_SLIDE_DIST = 200;
var DONUTS_FLIPPED_PER_AXIS = 6;
var DONUT_SOURCE_WIDTH = 1 / 6;
var DONUT_FLY_SPEED = 30;
var DONUT_FLY_SPEED_RANGE = 15;
var DONUT_FLY_SCALE_MULT = 3;
var donutTimeIncrement = 50;
var nextDonutTime = donutInterval;
//unlocking
var centerCid, flipDonutContainer ,donutsFlipped;
//platform
var isMobile = false;
//game over
var isGameOver = false;
//Aliases
var Container = PIXI.Container,
  autoDetectRenderer = PIXI.autoDetectRenderer,
  loader = PIXI.loader,
  resources = PIXI.loader.resources,
  Sprite = PIXI.Sprite,
  Text = PIXI.Text,
  Rect = PIXI.Rectangle,
  g = PIXI.Graphics,
  tick = PIXI.ticker.Ticker;

checkMobile();

function checkMobile(){
  if(typeof EVENTS == 'undefined'){
    console.log('events is UNdefined, set to desktop');
    //Create the renderer
    //this is only used for previewing on desktop
    renderer = autoDetectRenderer(360, 640);
    renderer.backgroundColor = 0xFF00FF;
    renderer.view.style.position = 'absolute';
    renderer.view.style.display = 'block';
    renderer.autoResize = true;
    renderer.resize(window.innerWidth, window.innerHeight);

    //Add the canvas to the HTML document
    document.body.appendChild(renderer.view);

    loadAssets();

    //Create a container object called the 'stage'
    stage = new Container();

  } else {
    console.log('events are DEFINED, we are go for mobile and to wait for init');
    isMobile = true;
  }
}

//Load all image assets
function loadAssets(){
  loader
    .add([
      'img/head.png',
      'img/donut.png',
      'img/background.png',
      'img/desk.png',
      'img/eyes.png',
      'img/left_arm.png',
      'img/right_arm.png',
      'img/body.png',
      'img/cid_face.png',
      'img/crumb.png',
      'img/bug_frames.png',
      'img/splashArt.png',
      'img/splashBG.png',
      'img/shipIt.png',
      'img/bacon.png',
      'img/baconText.png',
      'img/gameOver.png',
      'img/splat.png',
      'img/ewww.png',
      'img/quickEatBacon.png',
      'img/arrow.png'
    ])
    .on('progress', loadProgressHandler)
    .load(getScripts); //after completing load all scripts
}

//after each image is loaded, fire off this function as a progress indicator
function loadProgressHandler(){
  console.log('loading');
}

//side load all required script files
function getScripts(){
  //list all scripts needed
  console.log('loading scripts');
  var scriptsToLoad = [
    'libs/Charm.js',
    'libs/bump.js',
    'libs/spriteUtilities.js',
    'libs/dust.js',
    'libs/TweenLite.js',
    'libs/TimelineLite.js'];
  scriptsToLoad.forEach(function(src) {
    var script = document.createElement('script');
    script.src = src;
    script.async = false;

    //if we are at the end of the array, run the setup function
  	if (scriptsToLoad[scriptsToLoad.length - 1] == src) {
  		script.onload = function () {
        //we finished loading all of the scripts, start the setup
  			setup();
  		}
  	}
    document.head.appendChild(script);
  });
}

//////////////////////////////////////////////////////////////////// SETUP

//init is called from live lock screen source, it will replace the stage and
//renderer with its own versions
function init(s, r){
  console.log('init');
  stage = s;
  renderer = r;

  ACTIONS.setInteractivity(true);

  // ACTIONS.collapseNotification(true);

  EVENTS.onPause = setPause;

  EVENTS.onResume = setResume;

  EVENTS.onLockScreenDismissed = startOver;

  loadAssets();

}

function setup(){
  //bump is used for collision detection
  b = new Bump(PIXI);
  //sprite utilities makes frame animation with sprite sheets very simple
  su = new SpriteUtilities(PIXI);
  //Dust is used to create particle bursts
  d = new Dust(PIXI);

  //setup ticker to keep track of time
  time = new tick();

  //changing the state variable will change what happens during the game loop
  state = play;

  hiScore = getHiScore();

  time.start();

  //get window dimensions, used everywhere for varying screen sizes
  windowWidth = window.innerWidth;
  windowHeight = window.innerHeight;
  windowWidthHalf = windowWidth / 2;
  windowHeightHalf = windowHeight / 2;

  //setup a multiplier to ensure all sizes the same on all screen sizes
  scaleFactor = getScaleFactor();

  smallTextSize = 40 * scaleFactor;
  largeTextSize = 120 * scaleFactor;

  bugMoveStep = BUG_MOVE_STEP_INIT * scaleFactor;

  TOUCH_SLOP *= scaleFactor;

  makeBackground();

  makeCid();

  donutContainer = new Container();
  stage.addChild(donutContainer);

  initBugs();

  makeDesk();

  makeBacon();

  makeFlipDonuts();

  splatContainer = new Container();
  stage.addChild(splatContainer);

  makeScorePopup();

  makeScoreMultText();

  makeTouch();

  makeBaconTouch();

  makeTextGraphics();

  makeSplashScreen();

  //test filter
  //var pixFilter = new PIXI.filters.PixelateFilter();

  //var pixel = new PIXI.Point(5, 5);
  //pixFilter.size = (pixel);

  //stage.filters = [pixFilter];

  //Tell the 'renderer' to 'render' the 'stage'
  renderer.render(stage);

  gameLoop();

}

//////////////////////////////////////////////////////////////////// SETUP FUNCTIONS

function makeBackground(){
  background = createSprite('img/background.png');
  background.anchor.set(0.5,0.5);
  background.position.set(windowWidth/2, windowHeight/2);
  background.width = getBackgroundSize();
  background.height = getBackgroundSize();
  stage.addChild(background);
}

function makeCid(){
  CID_X_LIMIT *= scaleFactor;

  cidPosY = windowHeight / 7 * 6;

  cid = new Container();

  body = createSprite('img/body.png');
  cid.addChild(body);

  leftArm = createSprite('img/left_arm.png');
  rightArm = createSprite('img/right_arm.png');
  leftArm.pivot.set(22 * 3, 14.3 * 3);
  leftArm.position.set(108 * 3 , 130 * 3);
  leftArm.rotation = getRadians(20.5);
  rightArm.pivot.set(3 * 3, 14.3 * 3);
  rightArm.position.set(172.5 * 3 , 130 * 3);
  rightArm.rotation = getRadians(-20.5);
  cid.addChild(leftArm);
  cid.addChild(rightArm);

  head = createSprite('img/head.png');
  faceFrames = su.filmstrip('img/cid_face.png', 300, 300);
  face = su.sprite(faceFrames);
  face.states = {
    eatDonut: [0, 15],
    eatDonutBug: [17, 25]
  };
  face.loop = false;
  face.anchor.set(0.5, 0.5);
  face.position.set(face.width / 2, face.height / 2);
  face.position.y += EYES_Y_OFFSET;
  face.fps = 30;

  eyes = createSprite('img/eyes.png');
  eyes.position.y = EYES_Y_OFFSET;
  headContainer = new Container();
  headContainer.addChild(head);
  headContainer.addChild(face);
  headContainer.position.set(cid.width/2, 324);
  headContainer.pivot.set(150, 324);
  cid.addChild(headContainer);

  //create collider
  mouthTrack = new g;
  mouthTrack.drawRect(0,0,10, 10);
  mouthTrack.alpha = 0.5;
  headContainer.addChild(mouthTrack);
  mouthTrack.position.set(50, 150);

  cid.vx = 0;
  cid.vy = 0;
  cid.pivot.set(cid.width/2, cid.height/2);
  cid.position.set(windowWidth/2, cidPosY);
  cid.scale.set(scaleFactor, scaleFactor);

  mouthCollider = new g;
  mouthCollider.drawRect(0,0,200 * scaleFactor, 100 * scaleFactor);
  mouthCollider.alpha = 0.5;
  stage.addChild(mouthCollider);

  stage.addChild(cid);
}

function resetCid(){
  cid.position.x = windowWidthHalf;

  moveCidWithDrag();
}

function initBugs(){
  bugFrames = su.filmstrip('img/bug_frames.png', 300, 300);
  bugContainer = new Container();
  stage.addChild(bugContainer);

  startBugTimer();
}

function startBugTimer(){
  bugTimer = setInterval(function(){
    sendBug();
  }, 4000);
}

function resetBugTimer(){
  clearInterval(bugTimer);
  startBugTimer();
}

function makeDesk(){
  deskContainer = new Container();
  deskContainer.pivot.set(windowWidthHalf, windowHeightHalf);
  deskContainer.position.set(windowWidthHalf, windowHeightHalf);

  deskOffset = windowHeight - (windowHeight/12);
  desk = createSprite('img/desk.png');
  desk.anchor.set(0.5,0.5);
  desk.position.set(windowWidth/2, deskOffset);
  desk.scale.set(scaleFactor, scaleFactor);
  deskContainer.addChild(desk);
  stage.addChild(deskContainer);
}

function resetDesk(){
  TweenLite.killTweensOf(deskContainer);

  deskContainer.position.set(windowWidthHalf, windowHeightHalf);
  deskContainer.scale.set(1, 1);
}

function makeBacon(){
  baconContainer = new Container();
  baconOriginX = desk.x + (desk.width / 5);
  baconOriginY = desk.y + (desk.height / 13);

  for(var i = 0; i < INITIAL_BACON; i++){
    var bacon = createSprite('img/bacon.png');
    bacon.anchor.set(0.5, 0.5);
    baconContainer.addChild(bacon);
  }

  deskContainer.addChild(baconContainer);
  placeBacon();


}

function placeBacon(){
  for(var i = 0; i < INITIAL_BACON; i++){
    var bacon = baconContainer.children[i];
    bacon.visible = true;
    bacon.rotation = getRadians(15);
    bacon.position.set(baconOriginX + ((35 * scaleFactor) * i), baconOriginY);
    bacon.scale.set(BACON_INITIAL_SCALE * scaleFactor, BACON_INITIAL_SCALE * scaleFactor);
    if(i % 2 == 0){
      bacon.rotation = getRadians(195);
    }
    bacon.rotation += getRadians(getRandomArbitrary(-15, 15));
    bacon.position.y += (getRandomArbitrary(-10, 10)) * scaleFactor;
  }
}

function makeFlipDonuts(){
  flipDonutContainer = new Container();
  stage.addChild(flipDonutContainer);

  donutsFlipped = DONUTS_FLIPPED_PER_AXIS * DONUTS_FLIPPED_PER_AXIS;
  for (var i = 0; i < donutsFlipped; i++){
    var donut = createSprite('img/donut.png');
    donut.anchor.set(0.5,0.5);
    donut.scale.set(scaleFactor * DONUT_SCALE , scaleFactor * DONUT_SCALE);

    // var sourceWidth = windowWidth * DONUT_SOURCE_WIDTH;
    // var xRange = sourceWidth / donutsFlipped;
    // var sourceOffset = (windowWidth - sourceWidth) / 2;
    // var randomX = sourceOffset + getRandomArbitrary(xRange * i, (xRange * i) + xRange);
    var randomX = getRandomX(i);
    donut.position.set(randomX, windowHeight + donut.height);

    flipDonutContainer.addChild(donut);
  }
}

function getRandomX(i){
  var sourceWidth = windowWidth * DONUT_SOURCE_WIDTH;
  var xRange = sourceWidth / donutsFlipped;
  var sourceOffset = (windowWidth - sourceWidth) / 2;

  return sourceOffset + getRandomArbitrary(xRange * i, (xRange * i) + xRange);
}

function resetFlipDonuts(){
  for(var i = 0; i < flipDonutContainer.children.length; i++){
    var donut = flipDonutContainer.children[i];
    TweenLite.killTweensOf(donut);

    donut.scale.set(scaleFactor * DONUT_SCALE , scaleFactor * DONUT_SCALE);

    var randomX = getRandomX(i);
    donut.position.set(randomX, windowHeight + donut.height);

    // console.log('donut y: ' + donut.y);
  }
}

function makeScorePopup(){
  scorePopupStyle = {
    font : 'bold ' + largeTextSize + 'px sans-serif',
    fill : 'white',
    stroke : '#00b1e5',
    strokeThickness : 4,
    align : 'center'
  }

  scorePopupContainer = new Container();
  stage.addChild(scorePopupContainer);
}

function makeScoreMultText(){
  scoreLabelStyle = {
    font : 'bold ' + smallTextSize + 'px sans-serif',
    fill : '#e3faff',
    stroke : '#00b1e5',
    strokeThickness : 2,
  }

  scoreTextStyle = {
    font : 'bold ' + largeTextSize + 'px sans-serif',
    fill : '#e3faff',
    stroke : '#00b1e5',
    strokeThickness : 2,
  }

  scoreLabel = new Text('HI-SCORE: ' +
    hiScore.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), scoreLabelStyle);
  scoreLabel.position.set(40 * scaleFactor, 80 * scaleFactor);

  scoreText = new Text('', scoreTextStyle);
  setScore(0);
  scoreText.position.set(40 * scaleFactor, 120 * scaleFactor);

  multiplierLabelStyle = {
    font : 'bold ' + smallTextSize + 'px sans-serif',
    fill : '#e3faff',
    stroke : '#00b1e5',
    strokeThickness : 2,
    align : 'right'
  }

  multiplierTextStyle = {
    font : 'bold ' + largeTextSize + 'px sans-serif',
    fill : '#e3faff',
    stroke : '#00b1e5',
    strokeThickness : 2,
    align : 'right'
  }

  multiplierLabel = new Text('MULTIPLIER:', multiplierLabelStyle);
  multiplierLabel.position.set
    (windowWidth - multiplierLabel.width - (40 * scaleFactor), 80 * scaleFactor);

  multiplierText = new Text('\n ', multiplierTextStyle);
  setMultiplier(1);
  multiplierText.position.set
    (windowWidth - (40 * scaleFactor) - multiplierText.width, 120 * scaleFactor);

  stage.addChild(scoreText);
  stage.addChild(scoreLabel);
  stage.addChild(multiplierText);
  stage.addChild(multiplierLabel);
}

function makeTouch(){
  touchLayer = new g;
  touchLayer.beginFill(0x00ff00);
  touchLayer.drawRect(0,0,windowWidth, windowHeight);
  touchLayer.alpha = 0;
  touchLayer.interactive = true;
  stage.addChild(touchLayer);

  touchLayer
    .on('mousedown', onTouchStart)
    .on('touchstart',onTouchStart)

    .on('touchend', onTouchEnd)
    .on('touchendoutside', onTouchEnd)
    .on('mouseup', onTouchEnd)
    .on('mouseupoutside', onTouchEnd)

    .on('mousemove', onTouchMove)
    .on('touchmove', onTouchMove);
}

function makeBaconTouch(){
  baconTrigger = new g;
  baconTrigger.beginFill(0x00ff00);
  baconTrigger.drawRect(0, 0, 400 * scaleFactor, 220 * scaleFactor);
  baconTrigger.alpha = 0;
  baconTrigger.interactive = true;
  stage.addChild(baconTrigger);

  baconTrigger.position.set(
    windowWidthHalf + 150 * scaleFactor,
    windowHeight - baconTrigger.height
  );

  baconTrigger
    .on('touchstart', buttonStart)
    .on('mousedown', buttonStart)
    .on('touchend', tapBacon)
    .on('mouseup', tapBacon);
}

function makeTextGraphics(){
  shipIt = createSprite('img/shipIt.png');
  shipIt.anchor.set(0.5, 0.5);
  shipIt.position.set(windowWidthHalf, (windowHeightHalf) + windowHeight);
  shipIt.scale.set(scaleFactor, scaleFactor);
  stage.addChild(shipIt);

  gameOver = createSprite('img/gameOver.png');
  gameOver.anchor.set(0.5, 0.5);
  gameOver.position.set(windowWidthHalf, -windowHeightHalf);
  gameOver.scale.set(scaleFactor, scaleFactor);
  stage.addChild(gameOver);
  gameOver.interactive = true;

  gameOver
    .on('touchstart', buttonStart)
    .on('mousedown', buttonStart)
    .on('touchend', tapReset)
    .on('mouseup', tapReset);

  baconText = createSprite('img/baconText.png');
  baconText.anchor.set(0.5, 0.5);
  baconText.position.set(windowWidthHalf, -windowHeightHalf);
  baconText.scale.set(scaleFactor, scaleFactor);
  stage.addChild(baconText);

  ewwwText = createSprite('img/ewww.png');
  ewwwText.anchor.set(0.5, 0.5);
  ewwwText.position.set(windowWidthHalf, -windowHeightHalf);
  ewwwText.scale.set(scaleFactor, scaleFactor);
  stage.addChild(ewwwText);

  quickEatBaconText = createSprite('img/quickEatBacon.png');
  quickEatBaconText.anchor.set(0.5, 0.5);
  desk.addChild(quickEatBaconText);
  quickEatBaconText.position.set(300, -150);
  quickEatBaconText.alpha = 0;
  quickEatBaconText.scale.set(0.1, 0.1);

}

function resetEwww(){
  ewwwText.position.set(windowWidthHalf, -windowHeightHalf);
}

function resetEatDonut(){
  quickEatBaconText.position.set(300, -150);
  quickEatBaconText.alpha = 0;
  quickEatBaconText.scale.set(0.1, 0.1);
}

function makeSplashScreen(){
  splashContainer = new Container();
  splashBG = createSprite('img/splashBG.png');
  splashArt = createSprite('img/splashArt.png');

  splashContainer.addChild(splashBG);
  splashContainer.addChild(splashArt);

  splashArt.width = windowHeight;
  splashArt.height = windowHeight;
  splashArt.anchor.set(0.5, 0.5);

  var splashPos;
  if(windowWidth < windowHeight){
    splashBG.height = windowHeight;
    splashBG.width = windowHeight;
    splashPos = (windowHeight - windowWidth) / 2;
    splashContainer.position.set(-splashPos, 0);
    splashArt.position.set(windowWidthHalf + splashPos, windowHeightHalf);
  } else {
    splashBG.width = windowWidth;
    splashBG.height = windowWidth;
    splashPos = (windowWidth - windowHeight) / 2;
    splashContainer.position.set(0, -splashPos);
    splashArt.position.set(windowWidthHalf, windowHeightHalf + splashPos);
  }

  stage.addChild(splashContainer);

  splashMask = new g;
  splashMask.beginFill(0x00ff00);
  splashMask.position.set(windowWidthHalf, windowHeightHalf);
  splashMask.drawCircle(windowWidthHalf, windowHeightHalf, radiusScreen());
  splashMask.pivot.set(windowWidthHalf, windowHeightHalf);

  stage.addChild(splashMask);

  splashContainer.mask = splashMask;

  setDelay(wipeSplash, 600);
}

//////////////////////////////////////////////////////////////////// STATES

function play(){
  donutEmitter();
  checkDonutCollision();
  updateMouthColliderPosition();
  spinDonuts();
  // checkBugs();
  moveBugs();
}

function pause(){

}

function gameOverPause(){
  spinDonuts();
}

function setPause(){
  console.log('set pause');
  state = pause;
}

function setResume(){
  console.log('set resume');
  state = play;
}

function reset(){
  console.log('reset everything!!!');
  startOver();
}

//////////////////////////////////////////////////////////////////// LOOP

function gameLoop(){
  time.update();
  timeUpdate();

  state();

  d.update();

  renderer.render(stage);
  requestAnimationFrame(gameLoop);
}

//////////////////////////////////////////////////////////////////// TOUCH

function onTouchStart(event){
  this.data = event.data;
  touching = true;
  touchInit = this.data.getLocalPosition(this.parent);
  touchDiff = touchInit;
}

function onTouchMove(){
  var newPosition = this.data.getLocalPosition(this.parent);
  touchChangeX = newPosition.x - touchDiff.x;
  touchChangeY = newPosition.y - touchDiff.y;

  checkSlop('x', newPosition, touchInit);

  if(!eatingBacon){
    if (movingCid){
      cid.position.x += touchChangeX * 1.7;
      if(cid.x > windowWidth - CID_X_LIMIT){
        cid.position.x = windowWidth - CID_X_LIMIT;
      }
      if(cid.x < CID_X_LIMIT){
        cid.position.x = CID_X_LIMIT;
      }
      moveCidWithDrag();
    }
    if(unlocking){
      unlockBehavior();
    }
  }

  touchDiff = newPosition;
}

function onTouchEnd(){
  // console.log('touch status: stunned: ' + stunned + '  isGameOver: ' + isGameOver + '  movingCid: ' + movingCid + '  unlocking: ' + unlocking);
  if(!eatingBacon){
    if(!movingCid && !unlocking){
      checkBugTap(this);
      unlocking = false;
    }

    if(unlocking){
      if(Math.abs(touchChangeY) > UNLOCK_THRESHOLD){
        //time to unlock
        flipDeskUnlock();
      } else {
        putDownDesk();

        unlocking = false;
      }
    }
  }

  movingCid = false;
  centerCid = false;

  this.data = null;
}

function checkSlop(axis, pos, init){
  var changeX = Math.abs(pos.x - init.x);
  var changeY = init.y - pos.y;

  if (changeX > TOUCH_SLOP || changeY < -TOUCH_SLOP){
    if(changeX > changeY && !unlocking){
      movingCid = true;
    } else {
      if (!movingCid){
        unlocking = true;
      }
    }
  }
}

function buttonStart(){
  tappingButton = true;
}

function tapBacon(){
  if(tappingButton && baconQuantity > 0){
    eatBacon();
  }
  tappingButton = false;
}

function tapReset(){
  if(tappingButton){
    startOver();
  }
  tappingButton = false;
}
//////////////////////////////////////////////////////////////////// CID

function moveCidWithDrag(){
  // console.log('moving Cid!');
  cid.rotation = rangeMapper(cid.position.x, 0, windowWidth,
    getRadians(-20), getRadians(20));
  leftArm.rotation = rangeMapper(cid.position.x, 0, windowWidth,
    getRadians(35), getRadians(5));
  rightArm.rotation = rangeMapper(cid.position.x, 0, windowWidth,
    getRadians(-5), getRadians(-35));
  headContainer.rotation = rangeMapper(cid.position.x, 0, windowWidth,
    getRadians(-15), getRadians(15));
  eyes.position.x = rangeMapper(cid.position.x, 0, windowWidth, 20, -20);
}

function liftDesk(){
  cancelCidAnim();
  cid.tweenPos = TweenLite.to(cid, CENTER_CID_SPEED, {x:windowWidthHalf, y:cidPosY + (CID_SQUAT * scaleFactor)});
  cid.tweenRot = TweenLite.to(cid, CENTER_CID_SPEED, {rotation: 0});
  headContainer.tween = TweenLite.to(headContainer, CENTER_CID_SPEED, {rotation: 0});
  eyes.tween = TweenLite.to(eyes, CENTER_CID_SPEED, {x: 0});
  leftArm.tween = TweenLite.to(leftArm, CENTER_CID_SPEED, {rotation: getRadians(40.5)});
  rightArm.tween = TweenLite.to(rightArm, CENTER_CID_SPEED, {rotation: getRadians(-40.5)});
  // desk.tween = TweenLite.to(desk, LIFT_DESK_SPEED, {y: windowHeight - (250 * scaleFactor)});
  deskContainer.tween = TweenLite.to(deskContainer, LIFT_DESK_SPEED, {y: deskContainer.y - (LIFT_DESK_HEIGHT * scaleFactor)});

  face.show(16);
}

function putDownDesk(){
  cancelCidAnim();
  deskContainer.tween = TweenLite.to(deskContainer, LIFT_DESK_SPEED, {y: windowHeightHalf});
  leftArm.tween = TweenLite.to(leftArm, CENTER_CID_SPEED, {rotation: getRadians(20.5)});
  rightArm.tween = TweenLite.to(rightArm, CENTER_CID_SPEED, {rotation: getRadians(-20.5)});
  cid.tweenPos = TweenLite.to(cid, CENTER_CID_SPEED, {y: cidPosY});

  if(!stunned){
    face.gotoAndStop(15);
  } else {
    face.playAnimation(face.states.eatDonutBug);
  }

}

function cancelCidAnim(){
  // console.log('cancel ALL ANIM!!!!!');

  var cancelArray = [
    cid.tweenPos,
    cid.tweenBlink,
    leftArm.tween,
    rightArm.tween,
    desk.tween
  ]

  for(var i = 0; i < cancelArray.length; i++){
    var t = cancelArray[i];

    if(t == undefined){
      // console.log('tween is undefined');
    } else {
      // t.pause();
      // console.log('t is: ' + t);
      // t.kill();
    }
  }

  face.stopAnimation();
  cid.alpha = 1.0;
}

function unStunCid(){
  cancelCidAnim();
  stunned = false;

  leftArm.tween = TweenLite.to(leftArm, CENTER_CID_SPEED, {rotation: getRadians(20.5)});
  rightArm.tween = TweenLite.to(rightArm, CENTER_CID_SPEED, {rotation: getRadians(-20.5)});

  cid.alpha = 1.0;
  face.gotoAndStop(15);
  head.tint = 0xFFFFFF;
  leftArm.tint = 0xFFFFFF;
  rightArm.tint = 0xFFFFFF;
  body.tint = 0xFFFFFF;
}

function stunCid(){
  cancelCidAnim();

  leftArm.tween = TweenLite.to(leftArm, CENTER_CID_SPEED, {rotation: getRadians(110)});

  rightArm.tween = TweenLite.to(rightArm, CENTER_CID_SPEED, {rotation: getRadians(-110)});

  // cid.tweenBlink = c.pulse(cid, 4, 0.85);
  head.tint = 0xcdffdb;
  leftArm.tint = 0xcdffdb;
  rightArm.tint = 0xcdffdb;
  body.tint = 0xcdffdb;

  if(baconQuantity == 0){
    runGameOver();
    return;
  } else {
    TweenLite.to(ewwwText, 0.5, {y: windowHeight / 3, ease: Quad.easeOut});
    addScaleXYProperties(quickEatBaconText);
    TweenLite.to(quickEatBaconText, 0.5, {scaleX: 1, scaleY: 1, alpha: 1});
  }
  //show bacon message
}

function updateMouthColliderPosition(){
  mouthCollider.position.set(
    head.parent.toGlobal(mouthTrack.position).x,
    head.parent.toGlobal(mouthTrack.position).y
  );
  mouthCollider.rotation = headContainer.rotation + cid.rotation;
}

//////////////////////////////////////////////////////////////////// UNLOCK

function unlockBehavior(){
  //check to see if we have already called for cid to center
  if(!centerCid || centerCid === undefined){

    // console.log('centering? : ' + centerCid);

    centerCid = true;

    liftDesk();
  }
}

function flipDeskUnlock(){
  cancelCidAnim();
  cid.tweenPos = TweenLite.to(cid, CENTER_CID_SPEED, {x: windowWidthHalf, y: cidPosY - (CID_SQUAT * scaleFactor)});
  leftArm.tween = TweenLite.to(leftArm, CENTER_CID_SPEED, {rotation: getRadians(120)});
  rightArm.tween = TweenLite.to(rightArm, CENTER_CID_SPEED, {rotation: getRadians(-120)});

  addScaleXYProperties(deskContainer);

  var tl = new TimelineLite();

  tl.to(deskContainer, FLIP_DESK_SPEED, {y: deskContainer.y - (windowHeight * 0.75), scaleX: 1.2, scaleY: 1.8, ease: Quad.easeOut});

  tl.to(deskContainer, FLIP_DESK_SPEED, {y: 0, scaleX: 1.4, scaleY: 3, ease: Quad.easeIn});

  setDelay(flipDonuts, 200);
  //Unlock the device
  setDelay(unlockDevice, 600);
  setDelay(shipItAnimation, 200);

  TweenLite.to(ewwwText, 0.5, {y: -windowHeightHalf, ease: Quad.easeIn});
  TweenLite.to(quickEatBaconText, 0.5, {scaleX: 0, scaleY: 0, alpha: 0});
}

function flipDonuts(){
  for(var i = 0; i < donutsFlipped; i++){
    flipOneDonut(i);
  }
}

function flipOneDonut(i){
  var donut = flipDonutContainer.children[i];

  var randomSpeed = getRandomArbitrary(DONUT_FLY_SPEED - DONUT_FLY_SPEED_RANGE,
    DONUT_FLY_SPEED + DONUT_FLY_SPEED_RANGE);

  var iOffsetX = i % DONUTS_FLIPPED_PER_AXIS;
  var iOffsetY = Math.floor(i / DONUTS_FLIPPED_PER_AXIS);

  var destXRange = windowWidth / DONUTS_FLIPPED_PER_AXIS;
  var destX = getRandomArbitrary(destXRange * iOffsetX, (destXRange * iOffsetX) + destXRange);

  var destYRange = windowHeight / DONUTS_FLIPPED_PER_AXIS;
  var destY = getRandomArbitrary(destYRange * iOffsetY, (destYRange * iOffsetY) + destYRange);

  var randomRotate = getRandomArbitrary(0, 6);

  addScaleXYProperties(donut);

  TweenLite.to(donut, randomSpeed, {useFrames: true, x: destX, y: destY,
    scaleX: donut.scale.x * DONUT_FLY_SCALE_MULT,
    scaleY: donut.scale.y * DONUT_FLY_SCALE_MULT,
    rotation: randomRotate, onComplete: complete});

  function complete(){
    TweenLite.to(donut, randomSpeed * 5, {useFrames: true,
      x: destX, y: destY + (DONUT_SLIDE_DIST * scaleFactor)});
  }
}

function unlockDevice(){
  checkHiScore();
  // state = gameOverPause;
  if(isMobile){
    ACTIONS.unlock();
  } else {
    setTimeout(startOver, 1000);
  }
}

function shipItAnimation(){
  TweenLite.to(shipIt, 30, {useFrames: true, y: windowHeightHalf, ease: Quad.easeOut});
  TweenLite.to(gameOver, 30, {useFrames: true, y: -windowHeightHalf, ease: Quad.easeIn});
}

function resetShipIt(){
  TweenLite.killTweensOf(shipIt);
  shipIt.position.set(windowWidthHalf, (windowHeightHalf) + windowHeight);
}

//////////////////////////////////////////////////////////////////// DONUTS

function donutEmitter(){
  if(elapsedTime > nextDonutTime){
    sendDonut();

    donutInterval = rangeMapper(score, 0, MAX_SCORE_FOR_TOP_SPEED,
      INITIAL_DONUT_INTERVAL, MIN_DONUT_INTERVAL, true);

    // console.log('donutInterval: ' + donutInterval);
    nextDonutTime = elapsedTime + donutInterval;
  }
}

function sendDonut(){
  var donut = findFreshDonut();
  var ranX = getRandomArbitrary(donut.width, windowWidth - donut.width);
  donut.position.set(ranX, OFF_SCREEN);
  donut.visible = true;
  donutSpeed = rangeMapper(score, 0, MAX_SCORE_FOR_TOP_SPEED, INITIAL_DONUT_SPEED, TOP_DONUT_SPEED, true);
  donut.tween = TweenLite.to(donut, donutSpeed, {useFrames: true,
    x: ranX, y: windowHeight + donut.width, ease: Quad.easeIn});
}

function createDonut(i){
  var donut = createSprite('img/donut.png');
  donut.anchor.set(0.5,0.5);
  donut.scale.set(scaleFactor * DONUT_SCALE , scaleFactor * DONUT_SCALE);
  donut.position.set(50 * i, OFF_SCREEN);
  //set a random rotation
  donut.rotation = getRadians(getRandomArbitrary(0, 360));
  //give donut a personal random rotation amount
  donut.rotRate = getRadians(getRandomArbitrary(-2, 2));
  donutContainer.addChild(donut);
  donut.circular = true;
  donut.bugRiding = null;
}

function findFreshDonut(){
  if(donutContainer.children.length == 0){
    console.log('no donuts, creating first');
    createDonut();
  }

  for (var i = 0; i < donutContainer.children.length; i++){
    var donut = donutContainer.children[i];
    // console.log('Searching: ' + i);
    if (donut.position.y == OFF_SCREEN){
      // console.log('found donut at: ' + i);
      return donut;
      break;
    }
    if(i == donutContainer.children.length - 1){
      // console.log('ran out of donuts, creating a new one');
      createDonut();
    }
  }
}

function checkDonutCollision(){
  if(!unlocking){
    // console.log('donutContainerSize: ' + donutContainer.children.length);
    for (var i = 0; i < donutContainer.children.length; i++){
      var donut = donutContainer.children[i];
      if (donut.y > windowHeight){
        resolveDonutCollision(donut, false);
      }

      //TODO check for why bump may be causing slow down, investigate writing own collision detection
      if(!stunned && donut.y != OFF_SCREEN){
        // console.log('check for collide');
        if(b.hit({x: donut.position.x, y: donut.position.y}, mouthCollider)){
          emitCrumbs(donut.position);
          resolveDonutCollision(donut, true);
        }
      }
    }
  }
}

function resolveDonutCollision(donut, eaten){
  donut.tween.pause();

  if(eaten){
    if(donut.bugRiding == null){

      setScore(10 * multiplier);
      sendScorePopup(donut.position);
      setMultiplier(1);

      face.playAnimation(face.states.eatDonut);
    } else {
      removeBug(donut.bugRiding);
      donut.bugRiding = null;
      stunned = true;
      stunCid();


      face.playAnimation(face.states.eatDonutBug);
    }
  } else {
    setMultiplier(0);

    if(donut.bugRiding == null){
      // console.log('no bug!');
    } else {
      // console.log('had a bug: ' + donut.bugRiding);
      removeBug(donut.bugRiding);
      donut.bugRiding = null;
    }
  }

  donut.y = OFF_SCREEN;
  donut.bugTracking = false;
}

function spinDonuts(){
  for (var i = 0; i < donutContainer.children.length; i++){
    var donut = donutContainer.children[i];
    donut.rotation += donut.rotRate;
  }
}

function emitCrumbs(pos){
  var crumbs = d.create(
    pos.x, pos.y,
    () => su.sprite('img/crumb.png'),
    stage,
    30,
    0.2 * scaleFactor,
    true,
    0, 180,
    40 * scaleFactor, 90 * scaleFactor
  );
}

//////////////////////////////////////////////////////////////////// SCORE POPUP

function sendScorePopup(pos){

  var popup = getPopup();

  popup.alpha = 1.0;

  var newPoints = 10 * multiplier;
  popup.text = newPoints.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  popup.position.set(pos.x, pos.y);

  popup.anim = TweenLite.to(popup, POPUP_VISIBLE_TIME,
    {x: pos.x, y: pos.y - (300 * scaleFactor), alpha:0, ease: Strong.easeOut});
  popup.animating = true;

  popup.anim.onComplete = () =>
    popup.animating = false;
}

function getPopup(){
  if(scorePopupContainer.children.length == 0){
    createPopup();
  }

  for(var i = 0; i < scorePopupContainer.children.length; i++){
    var popup = scorePopupContainer.children[i];
    if(!popup.animating){
      return popup;
    }

    if(i == scorePopupContainer.children.length - 1){
      //we are out of popups, create a new one
      createPopup();
    }
  }
}

function createPopup(){
  // console.log('creating popup');

  var popup = new Text('', scorePopupStyle);
  popup.animating = false;
  popup.anchor.set(0.5, 0.5);

  scorePopupContainer.addChild(popup);
}

//////////////////////////////////////////////////////////////////// BACON

function eatBacon(){

  eatingBacon = true;

  var bacon = baconContainer.children[baconQuantity - 1];
  var target = face.getGlobalPosition();
  var baconYOffset = 50 * scaleFactor;

  var midPoint = {
    x: bacon.x - (bacon.x - target.x) / 2,
    y: target.y * 0.8
  };

  if(!stunned){
    baconTextAppear();
  } else {
    TweenLite.to(ewwwText, 0.5, {y: -windowHeightHalf, ease: Quad.easeIn});
    TweenLite.to(quickEatBaconText, 0.5, {scaleX: 0, scaleY: 0, alpha: 0});
  }

  addScaleXYProperties(bacon);

  var tl = new TimelineLite({onComplete: eatBaconResult, onCompleteParams: [bacon]});

  tl.to(bacon, BACON_SPEED,
    {x: midPoint.x, ease: Quad.easeIn});

  tl.to(bacon, BACON_SPEED, {y: midPoint.y, scaleX: (0.8 * scaleFactor),
    scaleY: (0.8 * scaleFactor), ease: Quad.easeOut}, "-=" + BACON_SPEED);

  tl.to(bacon, BACON_SPEED,
    {x: target.x, ease: Quad.easeOut});

  tl.to(bacon, BACON_SPEED, {y: target.y, scaleX: (BACON_INITIAL_SCALE * scaleFactor),
    scaleY: (BACON_INITIAL_SCALE * scaleFactor), ease: Quad.easeIn}, "-=" + BACON_SPEED);

  baconQuantity --;

}

function eatBaconResult(bacon){

  if(!stunned){
    for(var i = 0; i < bugContainer.children.length; i++){
      var bug = bugContainer.children[i];

      bug.searching = false;
      bug.x = OFF_SCREEN;
    }
    for(var i = 0; i < donutContainer.children.length; i++){
      var donut = donutContainer.children[i];
      donut.bugTracking = false;
      if(donut.bugRiding != null){
        donut.bugRiding = null;
      }
    }
    clearSplats();
    resetBugTimer();
  } else {
    unStunCid();
  }

  face.playAnimation(face.states.eatDonut);
  emitCrumbs(bacon.position);
  bacon.visible = false;
  eatingBacon = false;

}

function baconTextAppear(){

  var tl = new TimelineLite();

  tl.to(baconText, BACON_TEXT_SPEED, {y: windowHeight / 3, ease: Power4.easeOut});

  tl.to(baconText, BACON_TEXT_SPEED, {y: -windowHeightHalf, ease: Power4.easeIn}, "+=0.1");
}

//////////////////////////////////////////////////////////////////// BUGS

function sendBug(){
  // console.log('Total DOnuts: ' + donutContainer.children.length);

  numBugs = Math.floor(score / BUG_THRESHOLD) + 1;

  var count = 0
  for(var i = 0; i < bugContainer.children.length; i++){
    var bug = bugContainer.children[i];
    if(bug.searching){
      count++;
    }
  }
  bugsSearching = count;

  if(bugsSearching < numBugs){
    var bug = findFreshBug();
    var randomSideX = Math.random() < 0.5 ?  -bug.width : windowWidth + bug.width;
    var ranY = getRandomArbitrary(bug.width, windowHeight - (windowHeight / 3));
    bug.position.set(randomSideX, ranY);
    bug.visible = true;
    bug.searching = true;
  }
}

function createBug(){
  var bug = su.sprite(bugFrames);
  bug.states = {
    walk: [0, 7],
    stand: 0
  };
  bug.loop = true;
  bug.anchor.set(0.5, 0.5);
  bug.scale.set(BUG_SIZE * scaleFactor, BUG_SIZE * scaleFactor);
  bug.position.x = OFF_SCREEN;
  bug.fps = 30;
  bug.playAnimation(bug.states.walk);
  bug.searching = false;
  bug.target = undefined;

  bugContainer.addChild(bug);
}

function findFreshBug(){
  if(bugContainer.children.length == 0){
    createBug();
  }

  for (var i = 0; i < bugContainer.children.length; i++){
    var bug = bugContainer.children[i];
    if (!bug.searching){
      return bug;
      break;
    }
    if(i == bugContainer.children.length - 1){
      createBug();
    }
  }
}

function moveBugs(){
  for (var i = 0; i < bugContainer.children.length; i++){
    var bug = bugContainer.children[i];
    // console.log('bug position: ' + i + '   target: ' + bug.target);
    if(bug.searching){
      if(bug.target == undefined || !bug.target.bugTracking){
        // console.log('no target, trying to find one');
        bug.target = pickDonut();
      } else {
        //get Current Position
        var cPos = bug.position;
        //get target Position
        var tPos = bug.target.position;

        var xDist = tPos.x - cPos.x;
        var yDist = tPos.y - cPos.y;
        var dist = Math.sqrt((xDist * xDist) + (yDist * yDist));

        //check to see if bug is close enough to donut to attach
        if(dist < bugMoveStep * 5){
          //within the threshold, start matching movement to donut
          // bug.position = tPos;
          bug.position.x += xDist;
          bug.position.y += yDist;
          // console.log('x: ' + bug.target.position.x + '   y: ' + bug.target.position.y);
          bug.target.bugRiding = bug;
        } else {
          var mult = bugMoveStep / dist;

          bug.position.x += xDist * mult;
          bug.position.y += yDist * mult;
        }

        //turn bug towards target donut
        bug.rotation = bugRotation(bug, bug.target);
      }
    }
  }
}

function pickDonut(){
  for (var i = 0; i < donutContainer.children.length; i++){
    var donut = donutContainer.children[i];
    // console.log('checking out position: ' + i);
    if(donut.position.y > OFF_SCREEN + 10 && donut.bugTracking == false){
      // console.log('y pos: ' + donut.y + '  OFFSCREEN: ' + OFF_SCREEN);
      donut.bugTracking = true;
      return donut;
      break;
    }
    // return null;
    if(i == donutContainer.children.length - 1){
      // console.log('ran out of donuts');
      return null;
    }
  }
}

function bugRotation(bug, bugTarget){

  var xDiff = bugTarget.x - bug.x;
  var yDiff = bugTarget.y - bug.y;

  var angle = Math.atan(xDiff / yDiff);

  if(xDiff == 0){
    if(yDiff > 0){
      angle = getRadians(180);
    }
  }

  if(yDiff == 0){
    if(xDiff < 0){
      angle = getRadians(-90);
    }
  }

  if(yDiff < 0){
    angle *= -1;
  }

  if(yDiff > 0){
    angle = getRadians(180) - angle;
  }

  return angle;
}

function checkBugTap(o){
  // console.log('checking bug tap');
  var tap = o.data.getLocalPosition(o.parent);

  for(var i = 0; i < bugContainer.children.length; i++){
    var bug = bugContainer.children[i];

    // console.log('bugPos: ' + bug.x + ', ' + bug.y + '   tapPos: ' + tap.x + ', ' + tap.y);

    if(bugHit(tap, bug)){
      // console.log('tapped on the bug!');
        // emitCrumbs(bug.position);
        createSplat(bug.position);
        removeBug(bug);

    } else {
      // console.log('no hit');
    }
  }
}

function createSplat(pos){

  var splat = createSprite('img/splat.png');

  splat.anchor.set(0.5, 0.5);
  splat.scale.set(0.01, 0.01);
  splat.rotation = getRadians(getRandomArbitrary(0, 360));
  splat.position.set(pos.x, pos.y);
  splatContainer.addChild(splat);

  var ranScale = getRandomArbitrary(0.5, 1) * scaleFactor;

  addScaleXYProperties(splat);
  TweenLite.to(splat, 5, {useFrames: true, scaleX: ranScale, scaleY: ranScale, ease: Cubic.easeOut});
}

function bugHit(tap, bug){
  var radius = bug.width;
  var bugX = [bug.x - radius, bug.x + radius];
  var bugY = [bug.y - radius, bug.y + radius];
  if(tap.x >= bugX[0] && tap.x <= bugX[1]){
    if(tap.y >= bugY[0] && tap.y <= bugY[1]){
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

function removeBug(bug){
  //turn off search mode so we know we can grab this bug next
  bug.searching = false;
  bug.x = OFF_SCREEN;

  //check the bugs target and see if the bug was attached, if it was, turn off the attach var
  // console.log('removeBug: ' + bug.target.bugRiding);
  if(bug.target.bugRiding != null){
    // console.log('had a rider');
    bug.target.bugRiding = null;
  } else {
    // console.log('no rider');
  }

  //delay next bug
  setDelay(sendBug, 5000);
}

//////////////////////////////////////////////////////////////////// GAME OVER

function runGameOver(){
  checkHiScore();
  isGameOver = true;
  state = gameOverPause;
  TweenLite.to(gameOver, 30, {useFrames: true, y: windowHeight / 3, ease: Cubic.easeOut});
}

function startOver(){
  console.log('startingOver!');
  removeAllDonuts();
  clearSplats();
  cancelCidAnim();
  isGameOver = false;
  resetScore();
  placeBacon();
  TweenLite.to(gameOver, 30, {useFrames: true, y: -windowHeightHalf, ease: Cubic.easeIn});
  unStunCid();
  baconQuantity = INITIAL_BACON;
  donutInterval = INITIAL_DONUT_INTERVAL;
  numBugs = 1;
  setMultiplier(0);
  resetBugTimer();
  resetFlipDonuts();
  resetDesk();
  resetEwww();
  resetCid();
  resetEatDonut();
  resetShipIt();
  unlocking = false;
  state = play;
  console.log('container: ' + donutContainer.children.length);
  console.log('start over complete');
}

function clearSplats(){
  splatContainer.removeChildren();
}

function removeAllDonuts(){
  for(var i = donutContainer.children.length - 1; i > 1; i--){
    var donut = donutContainer.children[i];
    donut.tween.pause();
    donut.y = OFF_SCREEN;

    donut.bugTracking = false;
    // console.log('donut: ' + donut);

    if(donut.bugRiding != null){
      // donut.bugRiding.searching = false;
      // removeBug(donut.bugRiding);
      donut.bugRiding = null;
    }
    donut.destroy();
    // donut.destroy(true);

  }

  donutContainer.removeChildren();

  // console.log('bugQuantity: ' + bugContainer.children.length);
  for(var i = 0; i < bugContainer.children.length; i++){
    var bug = bugContainer.children[i];

    bug.searching = false;
    bug.target = undefined;
    bug.x = OFF_SCREEN;

  }
}

//////////////////////////////////////////////////////////////////// SCORE

function setScore(points){
  score += points;
  scoreText.text = score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function resetScore(){
  score = 0;
  scoreText.text = score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function setMultiplier(addMult){
  if(addMult == 0){
    multiplier = 1;
  } else {
    multiplier += addMult;
  }
  multiplierText.text = 'x' + multiplier;
  multiplierText.position.set(windowWidth - 20 - multiplierText.width, multiplierText.y);
}

function getHiScore(){
  var hs;
  if(isMobile){
    hs = SETTINGS.getNumber('score', 0);

  } else {
    hs = parseInt(getCookie('score'), 10);
  }
  return hs;
}

function putHiScore(){
  if(isMobile){
    SETTINGS.putNumber('score', score);
  } else {
    setCookie('score', '' + score, 4);
  }

  hiScore = score;

  scoreLabel.text = 'HI-SCORE: ' +
    hiScore.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getCookie(cookieName){
  var name = cookieName + '=';
  var cookieArray = document.cookie.split(';');
  for(var i = 0; i < cookieArray.length; i++){
    // console.log('looping through cookie');
    var cookie = cookieArray[i];
    while(cookie.charAt(0) == ' ') cookie = cookie.substring(1);
    if(cookie.indexOf(name) == 0) return cookie.substring(name.length, cookie.length);

  }
  return '0';
}

function setCookie(cName, cValue, exDays){
  var d = new Date();
  d.setTime(d.getTime() + (exDays * 24 * 60 * 60 * 1000));
  var expires = 'expires=' + d.toUTCString();
  document.cookie = cName + '=' + cValue + '; ' + expires;
  // console.log('setCookie:' + document.cookie);
}

function checkHiScore(){
  if(score > hiScore){
    putHiScore();
  }
}

//////////////////////////////////////////////////////////////////// UTILS

function getRadians(degrees){
  return degrees * Math.PI /180;
}

function getScaleFactor(){
  //original design was created with a 1080x1920 resolution so we divide by
  //1920 to get an adjusted unit size
  var scale = windowHeight / 1920;
  return scale;
}

function getBackgroundSize(){
  //ensure the background scales properly for varying screen sizes
  if (windowHeight > windowWidth){
    return windowHeight;
  } else {
    return windowWidth;
  }
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function timeUpdate(){
  elapsedTime += time.elapsedMS;
}

function createSprite(path){
  // console.log('creating sprite: resources path: ' + resources[path] + '   texture: ' + resources[path].texture);
  return new Sprite(
    resources[path].texture
  );
}

function addScaleXYProperties(sprite){
  if (!sprite.scaleX && sprite.scale.x) {
    Object.defineProperty(sprite, "scaleX", {
      get: function get() {
        return sprite.scale.x;
      },
      set: function set(value) {
        sprite.scale.x = value;
      }
    });
  }
  if (!sprite.scaleY && sprite.scale.y) {
    Object.defineProperty(sprite, "scaleY", {
      get: function get() {
        return sprite.scale.y;
      },
      set: function set(value) {
        sprite.scale.y = value;
      }
    });
  }
}

function rangeMapper(source, minSource, maxSource, minTarget, maxTarget, clamp){
  var sourceRange = maxSource - minSource;
  var targetRange = maxTarget - minTarget;

  var value = (source - minSource) * targetRange / sourceRange + minTarget;

  if (clamp){
    if(source >= maxSource){
      value = maxTarget;
    }

    if(source <= minSource){
      value = minTarget;
    }
  }

  return value;
}

function setDelay(func, delay){
  if(delay == undefined){
    delay = 1000;
  }
  setTimeout(function(){func();}, delay);
}

function wipeSplash(){
  addScaleXYProperties(splashMask);
  TweenLite.to(splashMask, 30, {useFrames: true, scaleX: 0, scaleY: 0,
    ease: Cubic.easeIn, onComplete: complete});

  function complete () {
    splashContainer.visible = false;
  }
}

function radiusScreen(){
  return (Math.sqrt(Math.pow(windowWidth, 2) + Math.pow(windowHeight, 2))) / 2;;
}
