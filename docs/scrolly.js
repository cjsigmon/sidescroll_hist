$(document).ready(function() {
    'use strict';
    const canvas = document.getElementById("canvas-scroll");
    const ctx = canvas.getContext("2d");

    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    const middleX = WIDTH/2;
    const middleY = canvas.height/2;
    var canvasVerticalOffset = 0;
    const spriteSheet = document.getElementById("spritesheet");
    const pixBg = document.getElementById("pixBg");
    const bgWidthSegment = pixBg.width/10;
    // vars for drawing rectangles
    var rectX = bgWidthSegment - bgScrollX + middleX;
    var rectY = canvas.height - 30; // Y-coordinate of the top-left corner
    const rectHeight = 30; 
    const rectWidth = 2*bgWidthSegment;
    const redStyle = "rgba(255, 0, 0, 0.5)";
    const greenStyle = "rgba(0, 255, 0, 0.5)"; 
    const blueStyle = "rgba(0, 0, 255, 0.5)";
    const whiteStyle = "rgba(255, 255, 255, 0.5)";
    var rectStyle = redStyle;
    // sprite sheet animation variables
    const frameWidth = 64; // Width of a single player frame
    const frameHeight = 64; // Height of player frame
    const frameCount = 2; // Number of frames in the player spritesheet
    let timeFrame = 0;
    let currentFrame = 0; // The current frame to display (on row)
    var frameRow = 0;
    var walkingRow = 1;
    var idleRow = 0;
    var bgScrollX = 0;
    var bgScrollY = 0;
    let breakPoints = new Set();
    // keys for user input
    const keys = {};
    var nextButton = document.getElementById('mynext');
    var prevButton = document.getElementById('myback');
    paper.install(window);
    // SLIDE 2 VARIABLES
    var playerXRange = document.getElementById("playerXRange");
    var playerXRangeValue =  5;
    // SLIDE 3 VARIABLES
    ctx.lineWidth = 10;
    ctx.strokeStyle = whiteStyle;
    var windowRectX;
    var windowRectY = 10;
    var windowRectWidth = 200;
    var windowRectHeight = canvas.height;
    var playerWindow = false;
    var windowOffsetX = 0;
    // SLIDE 4 VARIABLES
    var platformX;
    var platformY = middleY + 3/4*rectHeight;
    const platformWidth = bgWidthSegment/6;
    const platformHeight = rectHeight/4;
    // SLIDE 6 VARIABLES
    const switchAnimationRowsButton = document.getElementById("switchAnimationRowsButton");
    // SLIDE 7 VARIABLES
    var FPS = 10;
    const frameBufferRange = document.getElementById("frameBufferRange");


    const player = {
        x: middleX,
        y: middleY - 64,
        width: 64,
        height: 64,
        fallSpeed: 2,
        jumpSpeed: 64,
        walkSpeed: 6,
        defaultSpeed: 8
    };


    function skipBgAhead(iterations, dir) {
        let count = 0;
      
        const intervalId = setInterval(function() {      
          bgScrollX += dir * bgWidthSegment/iterations;
          count++;
      
          if (count >= iterations) {
            clearInterval(intervalId); // Stop the interval when the desired number of iterations is reached
          }
        }, 1);
      }
    // Add event listeners to the buttons
    nextButton.addEventListener('click', function () {
        if (bgScrollX < pixBg.width-bgWidthSegment) {
            bgScrollX+= 4
            skipBgAhead(8, 1);
        }
    });
    prevButton.addEventListener('click', function () {
        if (bgScrollX > bgWidthSegment) {
            bgScrollX+= 1;
            skipBgAhead(8, -1);
        }
    });
    for (let i = 0; i < 8; i++) {
        breakPoints.add(bgWidthSegment*(i+1));
        breakPoints.add(bgWidthSegment*(i+1)+1);
        breakPoints.add(bgWidthSegment*(i+1)+2);
        breakPoints.add(bgWidthSegment*(i+1)+3);
        breakPoints.add(bgWidthSegment*(i+1)+4);
        breakPoints.add(bgWidthSegment*(i+1)-1);
        breakPoints.add(bgWidthSegment*(i+1)-2);
        breakPoints.add(bgWidthSegment*(i+1)-3);
        breakPoints.add(bgWidthSegment*(i+1)-4);
        breakPoints.add(bgWidthSegment*(i+1)-5);
        breakPoints.add(bgWidthSegment*(i+1)-6);
        breakPoints.add(bgWidthSegment*(i+1)-7);
        breakPoints.add(bgWidthSegment*(i+1)-8);






    }

function switchAnimationRows() {
    frameRow = frameRow===1? 0 : 1;
    let tempRow = idleRow;
    idleRow = walkingRow;
    walkingRow = tempRow;
}
switchAnimationRowsButton.addEventListener("click", switchAnimationRows);

frameBufferRange.oninput = function() {
    if (this.value > 2) {
        FPS = 30-this.value;
    } else {
        FPS = 120- 30*this.value;
    }
}


// this controls the animation for player from their spritesheet
function updatePlayerFrame() {
    if (timeFrame <= FPS) {
        timeFrame++;
    } else {
        currentFrame = (currentFrame + 1) % frameCount;
        timeFrame = 0;
    }
}

// user input for keys
document.addEventListener('keydown', (event) => {
    keys[event.key] = true;
    if (keys['w'] || keys['W'] || keys['ArrowUp'] || keys[' ']) {
        if (player.y > 0) {
            player.y -= player.jumpSpeed;
        }
        frameRow = idleRow;
    }
  });
  
document.addEventListener('keyup', (event) => {
    keys[event.key] = false;
    frameRow = idleRow;
});



function playerIsInRectRange() {
    return player.x > rectX-player.width/2 && player.x < rectX+rectWidth 
    || (player.x > platformX-player.width/2 && player.x < platformX+platformWidth);
}
function playerIsAboveRect() {
    return (player.y <= rectY - player.height && player.x > rectX-player.width/2 && player.x < rectX+rectWidth
        || (player.y <= platformY - player.height && player.x > platformX-player.width/2 && player.x < platformX+platformWidth));
}
function playerIsOnRect() {
    return (player.y <= rectY - player.height + player.fallSpeed && player.y >= rectY - player.height - player.fallSpeed
        && player.x > rectX-player.width && player.x < rectX+rectWidth 
        || (player.x > platformX-player.width && player.x < platformX+platformWidth 
        && player.y < platformY-player.height+player.fallSpeed 
        && player.y > platformY-player.height-player.fallSpeed));
}

function playerIsAboveGround() {
    return player.y <= HEIGHT - player.height - player.fallSpeed;
}


function whichSlideIsPlayerOn() {
    if (player.x < rectX) {
        return 1;
    }
    for (let i = 0; i < 8; i++) {
        const segmentStart = rectX + i * bgWidthSegment;
        const segmentEnd = rectX + (i + 1) * bgWidthSegment;
    
        if (player.x > segmentStart && player.x < segmentEnd) {
            return i + 2;
        }
    }
    
}

function playerIsOnLeftWindowEdge() {
    return player.x < windowRectX;
}
function playerIsOnRightWindowEdge() {
    return player.x > windowRectX + windowRectWidth - player.width + player.walkSpeed;
}
  
// updates player's position RELATIVE TO THE CANVAS
function updatePlayerPosition() {
    // handle how far the player falls
    rectStyle = redStyle;
    playerWindow = false;
    if (playerIsInRectRange()) {
        if (playerIsAboveRect()) {
            player.y+= player.fallSpeed;
        }
    } else if (playerIsAboveGround()) {
        player.y+= player.fallSpeed;
    }

        switch(whichSlideIsPlayerOn()) {
            case 1:
                break;
            case 2:
                break;
            case 3:
                rectStyle = greenStyle;
                playerWindow = true;

                break;
            case 4:
                if (playerIsOnRect()) {
                    rectStyle = blueStyle;
                    canvasVerticalOffset = platformY-canvas.height+ctx.lineWidth;
                } else {
                    if (!playerIsAboveGround()) {
                        canvasVerticalOffset = 0;
                    }
                    rectStyle = redStyle;
                }
                break;
            case 5:
                break;
            case 6:
                break;
            case 7:
                break;
            case 8:
                break;
            case 9:
                break;
        }
    // end player y positioning, start player x-positioning
    playerXRangeValue = playerXRange.value;
    player.x = playerXRangeValue * (middleX/5) + windowOffsetX;


}

// x - moving
function updateBGPosition() {
    if (keys['a'] || keys['A'] || keys['ArrowLeft']) {
        frameRow = walkingRow; 
        // if there is still room to scroll
        if (bgScrollX > 0) {
            if (whichSlideIsPlayerOn() === 3) {
                if(playerIsOnLeftWindowEdge()) {
                    bgScrollX-= player.walkSpeed;
                } else {
                    windowOffsetX -= player.walkSpeed;
                }
            } else {
                bgScrollX-= 6;
            }
        }
    }
    if (keys['d'] || keys['D'] || keys['ArrowRight']) {
        frameRow = walkingRow;
        // if there is still room for the bg to scroll
        if (bgScrollX < pixBg.width-canvas.width) {
            if (whichSlideIsPlayerOn() === 3) {
                if(playerIsOnRightWindowEdge()) {
                    bgScrollX+= player.walkSpeed;
                } else {
                    windowOffsetX += player.walkSpeed;
                }
            }
            else if (whichSlideIsPlayerOn() === 2 && (playerIsAboveRect() || playerIsOnRect())) {
                bgScrollX+= 6;
            } 
            else {
                bgScrollX+= 6;
            }
        }
    }

    if (breakPoints.has(bgScrollX)) {
        let index = bgScrollX/bgWidthSegment;
        evalSlideIndex(index);
        // this is a function in slides.js
        // go tell slides to update content
    }
} // end function updatePlayerPosition()

    function playFrames() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        updatePlayerFrame();
        updateBGPosition();
        updatePlayerPosition();

        
        // draw the background
        ctx.drawImage(
            pixBg,
            bgScrollX,
            bgScrollY + canvasVerticalOffset,
            1200,
            160,
            0,
            0,
            canvas.width,
            canvas.height
        );

        // draw a rectangle for slide 2,3
        rectX = bgWidthSegment - bgScrollX + middleX;
        ctx.fillStyle = rectStyle;
        ctx.fillRect(rectX, rectY - canvasVerticalOffset, rectWidth, rectHeight);

        // draw a platform for slide 4
        platformX = 3*bgWidthSegment - bgScrollX + 1.5*middleX;
        ctx.fillRect(platformX, platformY - canvasVerticalOffset, platformWidth, platformHeight);


        //  draw the player
        ctx.drawImage(
            spriteSheet,
            currentFrame * frameWidth + 2,
            frameRow * frameHeight,
            frameWidth,
            frameHeight,
            player.x,
            player.y - canvasVerticalOffset,
            player.width,
            player.height
        );

        // if we are on slide 3 with player window, draw that window
        if (playerWindow) {
            ctx.beginPath();
            windowRectX = (playerXRangeValue * (middleX/5)) - windowRectWidth/2 + player.width/2;
            ctx.moveTo(windowRectX, windowRectY);
            ctx.lineTo(windowRectX, 100);
            ctx.moveTo(windowRectX + windowRectWidth, windowRectY);
            ctx.lineTo(windowRectX + windowRectWidth, 100);
            ctx.stroke();

        }

        requestAnimationFrame(playFrames); // continue the animation loop

    }

    // start the animation loop
    requestAnimationFrame(playFrames);
})

