const playButton = document.getElementById('play-stop');
const emitter = document.getElementById('source');
const animatedListener = document.getElementById('listener2');
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

function computeNewFrequency(frequency, sourceVelocity, mode) {
    let factor = 1;
    if(mode === 'coming') {
        factor = speedOfSound / (speedOfSound - sourceVelocity);
    }
    else if(mode === 'going') {
        factor = speedOfSound / (speedOfSound + sourceVelocity);
    }
    else {
        console.log('invalid mode value: ' + mode);
    }

    return factor * frequency;
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

function disableAllListeners() {
    $('.listener-button').each(function() {
        $(this).css('background-color', 'red');
    });
}

window.onload = () => {
    let audioData;
    let buffer;
    let isReady = false;
    let isPlaying = false;
    let started = false;
    let emitterAnimation;
    let listenerAnimation;
    let currentFrequency = baseFrequency;
    let animator = {
        targets: [emitter, animatedListener],
        duration: 3000,
        translateX: (el) => el.parentElement.clientWidth,
        easing: 'linear',
        loop: true
    };
    
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    oscillator.frequency = baseFrequency;
    oscillator.type = 'sine';
    oscillator.connect(ctx.destination);
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
    
    $('input[type=radio][name=source]').change(function() {
        disableAllListeners();
        $('#' + this.value).css('background-color', 'green');

        if (this.value === 'listener3')
            mode = 'coming';
        else if (this.value === 'listener1')
            mode = 'going';
        
        if (this.value !== 'listener2') {
            currentFrequency = computeNewFrequency(baseFrequency, 30, mode);
            oscillator.frequency.value = currentFrequency;
        }
        else {
            oscillator.frequency.value = baseFrequency;
        }
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

