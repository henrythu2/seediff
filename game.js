const LEVELS = [
    {
        bg: 'https://cdn.pixabay.com/photo/2017/08/06/12/52/woman-2592247_1280.jpg',
        pigs: 10,
        time: 60
    },
    {
        bg: 'https://cdn.pixabay.com/photo/2017/08/06/12/52/woman-2592247_1280.jpg',
        pigs: 10,
        time: 50
    },
    {
        bg: 'https://cdn.pixabay.com/photo/2017/08/06/12/52/woman-2592247_1280.jpg',
        pigs: 10,
        time: 40
    }
];

class Game {
    constructor() {
        this.gameArea = document.getElementById('gameArea');
        this.startButton = document.getElementById('startButton');
        this.restartButton = document.getElementById('restartButton');
        this.nextLevelButton = document.getElementById('nextLevelButton');
        this.timeDisplay = document.getElementById('time');
        this.levelDisplay = document.getElementById('level');
        this.gameOver = document.getElementById('gameOver');
        this.resultMessage = document.getElementById('resultMessage');
        this.hintButton = document.getElementById('hintButton');
        this.rankButton = document.getElementById('rankButton');
        this.hintModal = document.getElementById('hintModal');
        this.hintText = document.getElementById('hintText');
        this.adTimer = document.getElementById('adTimer');
        this.closeHint = document.getElementById('closeHint');
        this.rankModal = document.getElementById('rankModal');
        this.rankList = document.getElementById('rankList');
        this.closeRank = document.getElementById('closeRank');

        this.level = 0;
        this.timeLeft = 0;
        this.foundCount = 0;
        this.totalPigs = 10;
        this.gameStarted = false;
        this.timer = null;
        this.pigs = [];
        this.hintUsed = 0;
        this.rankData = JSON.parse(localStorage.getItem('rankData') || '[]');

        this.startButton.addEventListener('click', () => this.startGame());
        this.restartButton.addEventListener('click', () => this.restartGame());
        this.nextLevelButton.addEventListener('click', () => this.nextLevel());
        this.hintButton.addEventListener('click', () => this.showHint());
        this.rankButton.addEventListener('click', () => this.showRank());
        this.closeHint.addEventListener('click', () => this.hideHint());
        this.closeRank.addEventListener('click', () => this.hideRank());
    }

    startGame() {
        this.level = 0;
        this.loadLevel();
    }

    restartGame() {
        this.loadLevel();
    }

    nextLevel() {
        this.level++;
        if (this.level >= LEVELS.length) {
            this.level = 0;
        }
        this.loadLevel();
    }

    loadLevel() {
        this.clearGame();
        const lv = LEVELS[this.level];
        this.totalPigs = lv.pigs;
        this.timeLeft = lv.time;
        this.foundCount = 0;
        this.hintUsed = 0;
        this.levelDisplay.textContent = this.level + 1;
        this.timeDisplay.textContent = this.timeLeft;
        // this.gameArea.style.backgroundImage = `url('${lv.bg}')`;
        this.startButton.style.display = 'none';
        this.restartButton.style.display = 'inline-block';
        this.nextLevelButton.style.display = 'none';
        this.gameOver.style.display = 'none';
        this.placePigs();
        this.startTimer();
        this.gameStarted = true;
    }

    clearGame() {
        this.pigs.forEach(pig => pig.element.remove());
        this.pigs = [];
        clearInterval(this.timer);
        this.removeAllHint();
    }

    placePigs() {
        const sizes = [100, 80, 70, 60, 50, 45, 40, 35, 30, 25];
        const gameAreaRect = this.gameArea.getBoundingClientRect();
        for (let i = 0; i < this.totalPigs; i++) {
            const size = sizes[i % sizes.length];
            const pig = document.createElement('div');
            pig.className = 'pig';
            pig.style.width = `${size}px`;
            pig.style.height = `${size}px`;
            const maxX = gameAreaRect.width - size;
            const maxY = gameAreaRect.height - size;
            const x = Math.random() * maxX;
            const y = Math.random() * maxY;
            pig.style.left = `${x}px`;
            pig.style.top = `${y}px`;
            const img = document.createElement('img');
            img.src = 'https://cdn-icons-png.flaticon.com/512/3229/3229929.png';
            img.alt = '猪八戒';
            pig.appendChild(img);
            pig.addEventListener('click', () => this.handlePigClick(pig, i));
            this.gameArea.appendChild(pig);
            this.pigs.push({
                element: pig,
                found: false
            });
        }
    }

    handlePigClick(pig, index) {
        if (!this.gameStarted || this.pigs[index].found) return;
        this.pigs[index].found = true;
        pig.classList.add('found');
        this.foundCount++;
        this.removeAllHint();
        if (this.foundCount === this.totalPigs) {
            this.endGame(true);
        }
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.timeDisplay.textContent = this.timeLeft;
            if (this.timeLeft <= 0) {
                this.endGame(false);
            }
        }, 1000);
    }

    endGame(success) {
        clearInterval(this.timer);
        this.gameStarted = false;
        this.gameOver.style.display = 'block';
        if (success) {
            this.resultMessage.textContent = `恭喜你！成功找到所有${this.totalPigs}个猪八戒！`;
            this.nextLevelButton.style.display = (this.level < LEVELS.length - 1) ? 'inline-block' : 'none';
            this.saveRank();
        } else {
            this.resultMessage.textContent = `时间到！你找到了${this.foundCount}个猪八戒，继续加油！`;
            this.nextLevelButton.style.display = 'none';
        }
    }

    showHint() {
        if (!this.gameStarted) return;
        this.removeAllHint();
        const idx = this.pigs.findIndex(p => !p.found);
        if (idx === -1) return;
        const pig = this.pigs[idx].element;
        pig.classList.add('hint');
        this.hintModal.style.display = 'flex';
        if (this.hintUsed === 0) {
            this.hintText.textContent = '已为你高亮一个猪八戒（本次免费）';
            this.adTimer.style.display = 'none';
            this.hintUsed++;
        } else {
            let adSec = 20;
            this.hintText.textContent = '请观看广告20秒后获得提示...';
            this.adTimer.style.display = 'block';
            this.adTimer.textContent = `广告剩余：${adSec}秒`;
            const adInterval = setInterval(() => {
                adSec--;
                this.adTimer.textContent = `广告剩余：${adSec}秒`;
                if (adSec <= 0) {
                    clearInterval(adInterval);
                    this.hintText.textContent = '已为你高亮一个猪八戒';
                    this.adTimer.style.display = 'none';
                }
            }, 1000);
            this.hintUsed++;
        }
    }

    hideHint() {
        this.hintModal.style.display = 'none';
        this.removeAllHint();
    }

    removeAllHint() {
        this.pigs.forEach(p => p.element.classList.remove('hint'));
    }

    showRank() {
        this.rankModal.style.display = 'flex';
        this.renderRank();
    }

    hideRank() {
        this.rankModal.style.display = 'none';
    }

    saveRank() {
        const now = new Date();
        const record = {
            level: this.level + 1,
            found: this.foundCount,
            time: LEVELS[this.level].time - this.timeLeft,
            date: now.toLocaleString()
        };
        this.rankData.push(record);
        this.rankData = this.rankData.slice(-10); // 只保留10条
        localStorage.setItem('rankData', JSON.stringify(this.rankData));
    }

    renderRank() {
        this.rankList.innerHTML = '';
        if (this.rankData.length === 0) {
            this.rankList.innerHTML = '<li>暂无记录</li>';
            return;
        }
        this.rankData.slice().reverse().forEach(r => {
            const li = document.createElement('li');
            li.textContent = `第${r.level}关，${r.found}只，${r.time}秒，${r.date}`;
            this.rankList.appendChild(li);
        });
    }
}

window.addEventListener('load', () => {
    new Game();
});
