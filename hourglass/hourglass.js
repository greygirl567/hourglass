    document.addEventListener('DOMContentLoaded', () => {
      // 获取DOM元素
      const hoursInput = document.getElementById('hours');
      const minutesInput = document.getElementById('minutes');
      const secondsInput = document.getElementById('seconds');
      const timeDisplay = document.getElementById('timeDisplay');
      const startBtn = document.getElementById('startBtn');
      const resetBtn = document.getElementById('resetBtn');
      const statusDot = document.getElementById('statusDot');
      const statusText = document.getElementById('statusText');
      const completedMessage = document.getElementById('completedMessage');
      const progressBar = document.getElementById('progressBar');
      const sandFlow = document.getElementById('sandFlow');
      
      // 沙粒元素
      const upperSand = document.getElementById('upperSand');
      const lowerSand = document.getElementById('lowerSand');
      const sandPile = document.getElementById('sandPile');
      const sandParticles = document.getElementById('sandParticles');
      
      // 状态变量
      let totalSeconds = 60; // 默认1分钟（60秒）
      let timer = null;
      let isRunning = false;
      let originalTime = 60;
      let startTime = 0;
      let animationFrame = null;
      let particleInterval = null;
      
      // 初始化时间显示
      updateTimeDisplay();
      
      // 输入事件监听器
      hoursInput.addEventListener('input', handleTimeInput);
      minutesInput.addEventListener('input', handleTimeInput);
      secondsInput.addEventListener('input', handleTimeInput);
      
      // 按钮事件监听器
      startBtn.addEventListener('click', startTimer);
      resetBtn.addEventListener('click', resetTimer);
      
      // 处理时间输入
      function handleTimeInput() {
        const hours = parseInt(hoursInput.value) || 0;
        const minutes = parseInt(minutesInput.value) || 0;
        const seconds = parseInt(secondsInput.value) || 0;
        
        // 确保值在合理范围内
        hoursInput.value = Math.max(0, Math.min(23, hours));
        minutesInput.value = Math.max(0, Math.min(59, minutes));
        secondsInput.value = Math.max(0, Math.min(59, seconds));
        
        // 计算总秒数
        totalSeconds = hours * 3600 + minutes * 60 + seconds;
        
        // 只在非计时状态下更新原始时间
        if (!isRunning) {
          originalTime = totalSeconds;
        }
        
        updateTimeDisplay();
        
        // 如果不在计时中，更新沙漏显示
        if (!isRunning) {
          updateSandDisplay(0);
        }
      }
      
      // 更新时间显示
      function updateTimeDisplay() {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        timeDisplay.textContent = 
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
      
      // 更新沙粒显示
      function updateSandDisplay(progress) {
        // 上半部沙粒高度从上向下减少
        upperSand.style.height = `${Math.max(0, 100 - progress * 100)}%`;
        
        // 下半部沙粒高度从底部向上堆积
        lowerSand.style.height = `${Math.min(100, progress * 100)}%`;
        
        // 沙堆高度
        sandPile.style.height = `${Math.min(30, progress * 33)}px`;
      }
      
      // 创建沙粒粒子效果
      function createSandParticles() {
        if (particleInterval) clearInterval(particleInterval);
        
        particleInterval = setInterval(() => {
          if (!isRunning) return;
          
          // 创建多个粒子
          for (let i = 0; i < 4; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            
            // 随机位置
            const left = Math.random() * 25 - 12.5;
            particle.style.left = `calc(50% + ${left}px)`;
            particle.style.top = '45%';
            
            // 随机大小
            const size = 1 + Math.random() * 4;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            // 随机下落时间
            const duration = 0.5 + Math.random() * 0.4;
            particle.style.animation = `falling-particle ${duration}s linear forwards`;
            
            sandParticles.appendChild(particle);
            
            // 移除粒子
            setTimeout(() => {
              if (sandParticles.contains(particle)) {
                sandParticles.removeChild(particle);
              }
            }, duration * 1000);
          }
        }, 150);
      }
      
      // 启动计时器
      function startTimer() {
        if (isRunning) return;
        
        // 检查时间是否有效
        if (totalSeconds <= 0) {
          alert('Please set a valid time (at least 1 second)');
          return;
        }
        
        // 停止任何正在运行的计时器
        if (timer) clearInterval(timer);
        if (animationFrame) cancelAnimationFrame(animationFrame);
        
        // 重置状态
        isRunning = true;
        completedMessage.style.display = 'none';
        
        // 更新状态指示器
        statusDot.className = 'status-dot active';
        statusText.textContent = 'In Motion';
        
        // 显示沙流
        sandFlow.style.display = 'block';
        
        // 记录开始时间
        startTime = Date.now();
        
        // 禁用输入框
        hoursInput.disabled = true;
        minutesInput.disabled = true;
        secondsInput.disabled = true;
        
        // 开始倒计时
        timer = setInterval(() => {
          if (totalSeconds > 0) {
            totalSeconds--;
            updateTimeDisplay();
            
            if (totalSeconds === 0) {
              clearInterval(timer);
              isRunning = false;
              
              // 动画完成后更新状态
              setTimeout(() => {
                // 在计时完成后将时间设置清零
                hoursInput.value = 0;
                minutesInput.value = 0;
                secondsInput.value = 0;
                
                statusText.textContent = 'Completed';
                statusDot.className = 'status-dot completed';
                completedMessage.style.display = 'block';
                progressBar.style.width = '100%';
                
                // 停止粒子效果
                if (particleInterval) clearInterval(particleInterval);
                sandFlow.style.display = 'none';
                
                // 启用输入框
                hoursInput.disabled = false;
                minutesInput.disabled = false;
                secondsInput.disabled = false;
              }, 100);
            }
          }
        }, 1000);
        
        // 启动沙粒流动动画
        animateSand();
        
        // 创建沙粒粒子效果
        createSandParticles();
      }
      
      // 沙粒流动动画
      function animateSand() {
        if (!isRunning) return;
        
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / (originalTime * 1000));
        
        // 更新沙粒显示
        updateSandDisplay(progress);
        
        // 更新进度条
        progressBar.style.width = `${progress * 100}%`;
        
        if (progress < 1) {
          animationFrame = requestAnimationFrame(animateSand);
        }
      }
      
      // 重置计时器
      function resetTimer() {
        // 停止计时器
        if (timer) clearInterval(timer);
        if (animationFrame) cancelAnimationFrame(animationFrame);
        if (particleInterval) clearInterval(particleInterval);
        
        // 隐藏沙流
        sandFlow.style.display = 'none';
        
        // 清除所有粒子
        sandParticles.innerHTML = '';
        
        // 重置状态
        isRunning = false;
        
        // 启用输入框
        hoursInput.disabled = false;
        minutesInput.disabled = false;
        secondsInput.disabled = false;
        
        if (!isRunning) {
          // 非计时状态下重置：将所有输入框设为0
          hoursInput.value = 0;
          minutesInput.value = 0;
          secondsInput.value = 0;
          
          // 重置时间
          totalSeconds = 0;
          originalTime = 0;
          
          updateTimeDisplay();
          updateSandDisplay(0);
        } else {
          // 计时状态下重置：重置为原始设置值
          const hours = parseInt(hoursInput.value) || 0;
          const minutes = parseInt(minutesInput.value) || 0;
          const seconds = parseInt(secondsInput.value) || 0;
          totalSeconds = hours * 3600 + minutes * 60 + seconds;
          originalTime = totalSeconds;
          updateTimeDisplay();
          updateSandDisplay(0);
        }
        
        // 更新状态指示器
        statusText.textContent = 'Ready';
        statusDot.className = 'status-dot';
        
        // 隐藏完成消息
        completedMessage.style.display = 'none';
        
        // 重置进度条
        progressBar.style.width = '0%';
      }
    });