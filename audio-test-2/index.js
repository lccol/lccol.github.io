const playButton = document.getElementById('play-stop');
const emitter = document.getElementById('source');
const listener = document.getElementById('listener');
const animatedListener = document.getElementById('listener');
const volumeControl = document.getElementById('volume');
const speedControl = document.getElementById('speed');
const speedDisplay = document.getElementById('speed-display');
const speedOfSound = 340;
const baseFrequency = 440;
const dopplerFactor = 1.5;

function computePlaybackFactor(listenerVelocity, sourceVelocity) {
    let scaledSpeedOfSound = speedOfSound / dopplerFactor;

    listenerVelocity = Math.min(listenerVelocity, scaledSpeedOfSound);
    sourceVelocity = Math.min(sourceVelocity, scaledSpeedOfSound);

    let factor = ((speedOfSound - dopplerFactor * listenerVelocity) / (speedOfSound - dopplerFactor * sourceVelocity));
    return factor;
}

function computeNewFrequency(frequency, listenerVelocity, mode) {
    let factor = 1;
    if(mode === 'coming') {
        factor = 1 + (listenerVelocity / speedOfSound);
    }
    else if(mode === 'going') {
        factor = 1 - (listenerVelocity / speedOfSound);
    }
    else {
        console.log('invalid mode value: ' + mode);
    }

    return factor * frequency;
}

function kmhToms(speed) {
    return speed / 3.6;
}

function computeMode(listenerPosition, emitterPosition) {
    if (listenerPosition <= emitterPosition)
        return 'coming';
    else
        return 'going';
}

function msTokmh(speed) {
    return speed * 3.6;
}

function stop(audioContext, animation1, animation2, playButton) {
    audioContext.suspend();
    animation1.pause();
    animation2.pause();
    playButton.textContent = 'Play';
}

function start(audioContext, animation1, animation2, playButton) {
    audioContext.resume();
    animation1.play();
    animation2.play()
    playButton.textContent = 'Stop';
}

function getPosition(id) {
    let offset = $('#' + id).position().left;
    let width = $('#' + id).width();

    console.log('offset: ' + offset);
    console.log('width: ' + width);

    return offset + width / 2;
}

window.onload = () => {
    // let audioData;
    // let buffer;
    // let isReady = false;
    let isPlaying = false;
    let started = false;
    let emitterAnimation;
    let listenerAnimation;
    let currentFrequency = baseFrequency;
    let gainNode;
    let speed = 30;

    function animationFunc(anim) {
        let listenerPos = getPosition('listener');
        let emitterPos = getPosition('source');
        let mode = computeMode(listenerPos, emitterPos);

        currentFrequency = computeNewFrequency(baseFrequency, speed, mode);
        oscillator.frequency.value = currentFrequency;
    }

    let animator = {
        targets: animatedListener,
        duration: 3000,
        translateX: (el) => el.parentElement.clientWidth,
        easing: 'linear',
        loop: true,
        update: animationFunc
    };
    
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    oscillator.frequency = baseFrequency;
    oscillator.type = 'sine';

    gainNode = ctx.createGain();
    gainNode.gain.value = volumeControl.value;
    
    volumeControl.addEventListener('input', function() {
	    gainNode.gain.value = this.value;
    }, false);

    oscillator.connect(gainNode).connect(ctx.destination);
    // let source = ctx.createBufferSource();
    if(ctx.state === 'suspended'){
        var resume = function () {
            ctx.resume();
        
            setTimeout(function () {
              if (ctx.state === 'running') {
                document.body.removeEventListener('touchend', resume, false);
              }
            }, 0);
          };

        document.body.addEventListener('touchend', resume, false);
    }

    // const request = new XMLHttpRequest();
    // request.open('GET', 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/858/outfoxing.mp3', true);
    // request.responseType = 'arraybuffer';

    // request.onload = function () {
    //     audioData = request.response;

    //     ctx.decodeAudioData(audioData, (buffer) => {
    //         buffer = buffer;
    //         source.buffer = buffer;
    //         source.connect(ctx.destination);
    //         source.loop = true;
    //         // source.start(0);
    //         isReady = true;
    //         console.log(ctx.state);
    //         if(isPlaying){
    //             ctx.resume();
    //         }
    //     },
    //     function (e) { console.log('error decoding audio data') });
    // };
    
    // request.send();

    speedControl.addEventListener('input', function() {
        speedDisplay.textContent = "Velocit\u00E0: " + this.value + " km/h:";
        let listenerPos = getPosition('listener');
        let emitterPos = getPosition('source');
        let mode = computeMode(listenerPos, emitterPos);

        speed = kmhToms(parseInt(this.value));

        // currentFrequency = computeNewFrequency(baseFrequency, speed, mode);
        // oscillator.frequency.value = currentFrequency;
    });

    playButton.onclick = () => {
        console.log('Before: ' + ctx.state);
        if(isPlaying){
            stop(ctx, emitterAnimation, listenerAnimation, playButton);
        }
        else{
            if(!started){
                started = true;
                // source.start(0);
                oscillator.start();
                console.log('Invoking start');

                listenerAnimation = anime(animator);
                emitterAnimation = anime(animator);
                playButton.textContent = 'Stop';
            }
            else{
                start(ctx, emitterAnimation, listenerAnimation, playButton);
            }
        }
        console.log('After: ' + ctx.state);
        isPlaying = !isPlaying;
    }

}

