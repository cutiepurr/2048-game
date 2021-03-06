var game;
var gameOptions = {
    tileSize: 200,
    tweenSpeed: 50,
    tileSpacing: 20
}
var musicStatus = true;

if (!localStorage["1st"]) {
    localStorage.setItem("1st", 0)
    localStorage.setItem("2nd", 0)
    localStorage.setItem("3rd", 0)
    localStorage.setItem("4th", 0)
    localStorage.setItem("5th", 0)
}
var score = 0;
window.onload = function () {
    var gameConfig = {
        type: Phaser.CANVAS,
        width: gameOptions.tileSize * 4 + gameOptions.tileSpacing * 5,
        height: gameOptions.tileSize * 5 + gameOptions.tileSpacing * 5,
        backgroundColor: 0xffffff,
        scene: [preloader, startGame, playGame, endGame]
    };
    game = new Phaser.Game(gameConfig);
    window.focus()
    resize();
    window.addEventListener("resize", resize, false);
}
var preloader = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize:
        function preloader() {
            Phaser.Scene.call(this, { key: "Preloader" });
        },
    preload: function () {
        loadingBar(this);
        this.load.spritesheet("tiles", "assets/sprites/tiles-2.png", {
            frameWidth: gameOptions.tileSize,
            frameHeight: gameOptions.tileSize
        });
        this.load.audio("main_audio", "assets/audio.mp3")
        this.load.image("startbg", "assets/startscene.png")
        this.load.image("startbtn", "assets/icons/tiles_start.png")
        this.load.audio("plop", "assets/plop.mp3")
        this.load.image("nav", "assets/icons/tiles_nav.png")
        this.load.image("musicon", "assets/icons/tiles_musicon.png")
        this.load.image("musicoff", "assets/icons/tiles_musicoff.png")
        this.load.image("restart-small", "assets/icons/tiles_restart-18.png")
        this.load.image("score", "assets/icons/tiles_score.png")
        this.load.image("leaderboard", "assets/icons/tiles_leaderboard.png")
        this.load.image("scoreboard", "assets/icons/tiles_highest score.png")
        this.load.image("close", "assets/icons/tiles_close.png")
        this.load.image("restart", "assets/restart_restart.png")
    },
    create: function () {
        this.scene.start("StartGame")
    }
});

var startGame = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize:
        function startGame() {
            Phaser.Scene.call(this, { key: "StartGame" });
        },
    create: function () {
        this.music = this.sound.add("main_audio", { loop: true })
        this.music.play()
        this.add.image(450, 530, "startbg")
        this.startButton = this.add.image(450, 760, "startbtn").setScale(0.7).setInteractive()
        this.startButton.on("pointerdown", function (pointer) {
            this.tweens.add({
                targets: [this.startButton],
                scaleX: 1.005,
                scaleY: 1.005,
                duration: gameOptions.tweenSpeed,
                yoyo: true,
                repeat: 1,
                onComplete: function (tween) {
                    tween.parent.scene.scene.start("PlayGame")
                    }
            });
        }, this)
        
    }
})
var playGame = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize:
        function playGame() {
            Phaser.Scene.call(this, { key: "PlayGame" });
        },
    create: function () {
        this.add.image(450, 990, "nav")
        this.add.image(170, 990, "score")
        this.musicOn = this.add.image(500, 990, "musicon").setInteractive()
        this.musicOff = this.add.image(500, 990, "musicoff").setInteractive()
        this.restartSmall = this.add.image(800, 990, "restart-small").setInteractive()
        this.leaderboard = this.add.image(650, 990, "leaderboard").setInteractive()
        this.closeButton = this.add.image(650, 990, "close").setInteractive()
        this.closeButton.visible = false
        this.restartSmall.on("pointerdown", function () {
            highestScores(score)
            score = 0
            this.scene.start("PlayGame");
        }, this)
        if (musicStatus) {
            this.musicOff.visible = false
        }
        else {
            this.musicOn.visible = false
        }
        this.musicOn.on('pointerdown', function () {
            this.sound.mute = true
            this.musicOff.visible = true
            this.musicOn.visible = false
            musicStatus = false;
        }, this)
        this.musicOff.on('pointerdown', function () {
            this.sound.mute = false
            this.musicOn.visible = true
            this.musicOff.visible = false
            musicStatus = true
        }, this)

        this.storage = localStorage;
        this.leaderboard.on('pointerdown', function () {
            this.closeButton.visible = true
            this.leaderboard.visible = false
            this.scoreboard = this.add.image(450, 450, "scoreboard")
            this.leaderLabel = this.add.text(200, 150, "HIGHEST SCORE", { color: '#ef4966', fontSize: '40px', fontFamily: "font1" })
            this.leaderResults = this.add.text(200, 250, "", { color: '#ef4966', fontSize: '20px', fontFamily: "font1" })
            this.leaderResults.setText(`1st. ${this.storage.getItem("1st")}\n
2nd. ${this.storage.getItem("2nd")}\n
3rd. ${this.storage.getItem("3rd")}\n
4th. ${this.storage.getItem("4th")}\n
5th. ${this.storage.getItem("5th")}`)
        }, this)

        this.closeButton.on('pointerdown', function () {
            this.leaderboard.visible = true;
            this.closeButton.visible = false;

            this.scoreboard.destroy()
            this.leaderResults.destroy()
            this.leaderLabel.destroy()
        }, this)

        this.gameOver = false;
        this.add.text(120, gameOptions.tileSize * 4 + 20 * 7, "SCORE", { color: '#ef4966', fontSize: '20px', fontFamily: "font1" })
        this.scoreText = this.add.text(150, gameOptions.tileSize * 4 + 20 * 9, `${score}`, { color: '#ef4966', fontSize: '50px', fontFamily: "font1", align: "justify" })
        this.fieldArray = [];

        this.plop = this.sound.add("plop")


        this.fieldGroup = this.add.group();
        for (var i = 0; i < 4; i++) {
            this.fieldArray[i] = [];
            for (var j = 0; j < 4; j++) {
                var two = this.add.sprite(this.tileDestination(j), this.tileDestination(i), "tiles");
                two.alpha = 0;
                two.visible = false;
                this.fieldGroup.add(two);
                this.fieldArray[i][j] = {
                    tileValue: 0,
                    tileSprite: two,
                    canUpgrade: true
                }
            }
        }
        // for keyboard use
        this.input.keyboard.on("keydown", this.handleKey, this);
        // for touch use
        this.input.on("pointerup", this.endSwipe, this);

        this.canMove = false;
        this.addTwo();
        this.addTwo();
    },

    endSwipe: function (e) {
        var swipeTime = e.upTime - e.downTime;
        var swipe = new Phaser.Geom.Point(e.upX - e.downX, e.upY - e.downY);
        var swipeMagnitude = Phaser.Geom.Point.GetMagnitude(swipe);
        var swipeNormal = new Phaser.Geom.Point(swipe.x / swipeMagnitude, swipe.y / swipeMagnitude);
        if (swipeMagnitude > 20 && swipeTime < 1000 && (Math.abs(swipeNormal.y) > 0.8 || Math.abs(swipeNormal.x) > 0.8)) {
            if (swipeNormal.x > 0.8) {
                this.handleMove(0, 1);
            }
            if (swipeNormal.x < -0.8) {
                this.handleMove(0, -1);
            }
            if (swipeNormal.y > 0.8) {
                this.handleMove(1, 0);
            }
            if (swipeNormal.y < -0.8) {
                this.handleMove(-1, 0);
            }
        }
    },

    addTwo: function () {
        var emptyTiles = this.emptyCells();
        var chosenTile = Phaser.Utils.Array.GetRandomElement(emptyTiles);
        this.fieldArray[chosenTile.row][chosenTile.col].tileValue = 1;
        this.fieldArray[chosenTile.row][chosenTile.col].tileSprite.visible = true;
        this.fieldArray[chosenTile.row][chosenTile.col].tileSprite.setFrame(0);
        this.tweens.add({
            targets: [this.fieldArray[chosenTile.row][chosenTile.col].tileSprite],
            alpha: 1,
            duration: gameOptions.tweenSpeed,
            onComplete: function (tween) {
                tween.parent.scene.canMove = true;
            },
        });
    },

    handleKey: function (e) {
        if (this.canMove) {
            switch (e.code) {
                case "KeyA":
                case "ArrowLeft":
                    this.handleMove(0, -1);
                    break;
                case "KeyD":
                case "ArrowRight":
                    this.handleMove(0, 1);
                    break;
                case "KeyW":
                case "ArrowUp":
                    this.handleMove(-1, 0);
                    break;
                case "KeyS":
                case "ArrowDown":
                    this.handleMove(1, 0);
                    break;
                case "KeyR":
                    this.scene.start("EndGame");
            }
        }
    },

    handleMove: function (deltaRow, deltaCol) {
        this.canMove = false;
        var somethingMoved = false;
        this.movingTiles = 0;
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                var colToWatch = deltaCol == 1 ? (4 - 1) - j : j;
                var rowToWatch = deltaRow == 1 ? (4 - 1) - i : i;
                var tileValue = this.fieldArray[rowToWatch][colToWatch].tileValue;
                if (tileValue != 0) {
                    var colSteps = deltaCol;
                    var rowSteps = deltaRow;
                    while (this.isInsideBoard(rowToWatch + rowSteps, colToWatch + colSteps)
                        && this.fieldArray[rowToWatch + rowSteps][colToWatch + colSteps].tileValue == 0) {
                        colSteps += deltaCol;
                        rowSteps += deltaRow;
                    }
                    // if change number
                    if (this.isInsideBoard(rowToWatch + rowSteps, colToWatch + colSteps)
                        && (this.fieldArray[rowToWatch + rowSteps][colToWatch + colSteps].tileValue == tileValue)
                        && this.fieldArray[rowToWatch + rowSteps][colToWatch + colSteps].canUpgrade
                        && this.fieldArray[rowToWatch][colToWatch].canUpgrade) {
                        this.fieldArray[rowToWatch + rowSteps][colToWatch + colSteps].tileValue++;
                        this.fieldArray[rowToWatch + rowSteps][colToWatch + colSteps].canUpgrade = false;
                        this.fieldArray[rowToWatch][colToWatch].tileValue = 0;
                        this.moveTile(this.fieldArray[rowToWatch][colToWatch], rowToWatch + rowSteps, colToWatch + colSteps, Math.abs(rowSteps + colSteps), true);
                        somethingMoved = true;
                    }
                    // if not change number
                    else {
                        colSteps = colSteps - deltaCol;
                        rowSteps = rowSteps - deltaRow;
                        if (colSteps != 0 || rowSteps != 0) {
                            this.fieldArray[rowToWatch + rowSteps][colToWatch + colSteps].tileValue = tileValue;
                            this.fieldArray[rowToWatch][colToWatch].tileValue = 0;
                            this.moveTile(this.fieldArray[rowToWatch][colToWatch], rowToWatch + rowSteps, colToWatch + colSteps, Math.abs(rowSteps + colSteps), false);
                            somethingMoved = true;
                        }
                    }
                }
            }
        }
        if (!somethingMoved) {
            this.canMove = true;
        }
    },

    moveTile: function (tile, row, col, distance, changeNumber) {
        this.movingTiles++;
        this.tweens.add({
            targets: [tile.tileSprite],
            x: this.tileDestination(col),
            y: this.tileDestination(row),
            duration: gameOptions.tweenSpeed * distance,
            onComplete: function (tween) {
                tween.parent.scene.movingTiles--;
                if (changeNumber) {
                    tween.parent.scene.transformTile(tile, row, col);
                }
                if (tween.parent.scene.movingTiles == 0) {
                    tween.parent.scene.resetTiles();
                    tween.parent.scene.addTwo();
                }
            }
        })
    },
    transformTile: function (tile, row, col) {
        this.movingTiles++;
        score++;
        this.plop.play()
        tile.tileSprite.setFrame(this.fieldArray[row][col].tileValue - 1);
        this.tweens.add({
            targets: [tile.tileSprite],
            scaleX: 1.1,
            scaleY: 1.1,
            duration: gameOptions.tweenSpeed,
            yoyo: true,
            repeat: 1,
            onComplete: function (tween) {
                tween.parent.scene.movingTiles--;
                if (tween.parent.scene.movingTiles == 0) {
                    tween.parent.scene.resetTiles();
                    tween.parent.scene.addTwo();
                }
            }
        })
    },
    resetTiles: function () {
        var tile;
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                tile = this.fieldArray[i][j]
                tile.canUpgrade = true;
                tile.tileSprite.x = this.tileDestination(j);
                tile.tileSprite.y = this.tileDestination(i);
                if (tile.tileValue > 0) {
                    tile.tileSprite.alpha = 1;
                    tile.tileSprite.visible = true;
                    tile.tileSprite.setFrame(this.fieldArray[i][j].tileValue - 1);
                }
                else {
                    tile.tileSprite.alpha = 0;
                    tile.tileSprite.visible = false;
                }
            }
        }
    },
    isInsideBoard: function (row, col) {
        return (row >= 0) && (col >= 0) && (row < 4) && (col < 4);
    },
    tileDestination: function (pos) {
        return pos * (gameOptions.tileSize + gameOptions.tileSpacing) + gameOptions.tileSize / 2 + gameOptions.tileSpacing
    },
    emptyCells: function () {
        var emptyTiles = [];
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                if (this.fieldArray[i][j].tileValue == 0) {
                    emptyTiles.push({
                        row: i,
                        col: j
                    })
                }
            }
        }
        return emptyTiles;
    },
    cellAvailable: function () {
        return !!this.emptyCells().length
    },
    tileMatchesAvailable: function () {
        // var tile;
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                for (let direction = 0; direction < 4; direction++) {
                    var vector = this.getVector(direction);
                    if (i + vector.x < 4 && i + vector.x >= 0 && j + vector.y < 4 && j + vector.y >= 0) {
                        var neighbor = this.fieldArray[i + vector.x][j + vector.y]
                    }
                    if (neighbor && neighbor.tileValue === this.fieldArray[i][j].tileValue) {
                        return true
                    }
                }
            }
        }
        return false;
    },
    getVector: function (direction) {
        var map = {
            0: { x: 0, y: -1 }, //Up
            1: { x: 1, y: 0 },  //Right
            2: { x: 0, y: 1 },  //Down
            3: { x: -1, y: 0 }  //Left
        };
        return map[direction];
    },
    movesAvailable: function () {
        // return this.cellAvailable();

        return this.cellAvailable() || this.tileMatchesAvailable();
    },
    update() {
        this.scoreText.setText(`${score}`);
        if (score >= 10) {
            this.scoreText.x = 120;
        }
        if (score >= 100) {
            this.scoreText.x = 100;
        }
        if (score >= 1000) {
            this.scoreText.x = 70;
        }
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                if (this.fieldArray[i][j].tileValue == 11) {
                    // this.result.setText("You win!")
                    this.scene.start("EndGame")
                }
            }
        }
        //Game over
        if (!this.movesAvailable()) {
            this.scene.start("EndGame")
            // this.music.stop()
        }
    }
});
var endGame = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize:
        function endGame() {
            Phaser.Scene.call(this, { key: "EndGame" });
        },
    create: function () {
        this.result = this.add.text(gameOptions.tileSize * 2 - 90, gameOptions.tileSize * 2 - 100, "", { color: "#000", fontSize: "30px", fontFamily: 'font1', align: 'center' })
        this.result.setText(`GAME OVER!\n\nScore: ${score}`)


        highestScores(score);

        this.restartButton = this.add.image(gameOptions.tileSize * 2 + 50, gameOptions.tileSize * 2 + 200, "restart").setInteractive();
        this.restartButton.on("pointerdown", function (pointer) {
            score = 0;
            this.tweens.add({
                targets: [this.restartButton],
                scaleX: 1.05,
                scaleY: 1.05,
                duration: gameOptions.tweenSpeed,
                yoyo: true,
                repeat: 1,
                onComplete: function (tween) {
                    tween.parent.scene.scene.start("PlayGame")
                    }
            });
        }, this);
    }
});
// for visual use
function resize() {
    var canvas = document.querySelector("canvas");
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    var windowRatio = windowWidth / windowHeight;
    var gameRatio = game.config.width / game.config.height;
    if (windowRatio < gameRatio) {
        canvas.style.width = windowWidth + "px";
        canvas.style.height = (windowWidth / gameRatio) + "px";
    }
    else {
        canvas.style.width = (windowHeight * gameRatio) + "px";
        canvas.style.height = windowHeight + "px";
    }
}

function highestScores(score) {
    var first = localStorage.getItem("1st") || 0;
    var second = localStorage.getItem("2nd") || 0;
    var third = localStorage.getItem("3rd") || 0;
    var fourth = localStorage.getItem("4th") || 0;
    var fifth = localStorage.getItem("5th") || 0;
    if (score > first) { fifth = fourth; fourth = third; third = second; second = first; first = score }
    else if (score > second) { fifth = fourth; fourth = third; third = second; second = score }
    else if (score > third) { fifth = fourth; fourth = third; third = score }
    else if (score > fourth) { fifth = fourth; fourth = score }
    else if (score > fifth) { fifth = score }
    localStorage.setItem("1st", first)
    localStorage.setItem("2nd", second)
    localStorage.setItem("3rd", third)
    localStorage.setItem("4th", fourth)
    localStorage.setItem("5th", fifth)
}

var loadingBar = function (game) {
    var width = game.cameras.main.width;
    var height = game.cameras.main.height;
    var progressBar = game.add.graphics();
    var progressBox = game.add.graphics();
    progressBox.fillStyle(0xef4996, 0.8);
    progressBox.fillRect(width / 2 - 165, height / 3 * 2, 320, 50);

    var loadingText = game.make.text({
        x: width / 2,
        y: height / 2 - 50,
        text: 'Loading...',
        style: { color: '#ef4966', fontSize: '20px', fontFamily: "font1" }
    });
    loadingText.setOrigin(0.5, 0.5);

    var percentText = game.make.text({
        x: width / 2,
        y: height / 2 - 5,
        text: '0%',
        style: { color: '#ef4966', fontSize: '20px', fontFamily: "font1" }
    });
    percentText.setOrigin(0.5, 0.5);

    var assetText = game.make.text({
        x: width / 2,
        y: height / 2 + 50,
        text: '',
        style: { color: '#ef4966', fontSize: '20px', fontFamily: "font1" }
    });

    assetText.setOrigin(0.5, 0.5);

    game.load.on('progress', function (value) {
        percentText.setText(parseInt(value * 100) + '%');
        progressBar.clear();
        progressBar.fillStyle(0x000000, 1);
        progressBar.fillRect(width / 2 - 165 + 10, height / 3 * 2 + 10, 300 * value, 30);
    });

    game.load.on('fileprogress', function (file) {
        assetText.setText('Loading asset: ' + file.key);
    });

    game.load.on('complete', function () {
        progressBar.destroy();
        progressBox.destroy();
        loadingText.destroy();
        percentText.destroy();
        assetText.destroy();
    });
}