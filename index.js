window.onload = () => {
    const play = document.getElementById('play-stop');
    const button = document.getElementById('alter');
    const speedOfSound = 340;
    const dopplerFactor = 1.5;
    let audioData;
    let buffer;
    let isReady = false;
    let isPlaying = false;
    let started = false;
    
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    
    const ctx = new AudioContext();
    let source = ctx.createBufferSource();
    // const track = ctx.createMediaElementSource(audioElement);
    
    // const oscillator = ctx.createOscillator();

    const request = new XMLHttpRequest();
    request.open('GET', 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/858/outfoxing.mp3', true);
    request.responseType = 'arraybuffer';

    request.onload = function () {
        audioData = request.response;

        ctx.decodeAudioData(audioData, (buffer) => {
            buffer = buffer;
            source.buffer = buffer;
            source.connect(ctx.destination);
            source.loop = true;
            // source.start(0);
            isReady = true;
            console.log(ctx.state);
            if(isPlaying){
                ctx.resume();
            }
        },
        function (e) { console.log('error decoding audio data') });
    };
    
    request.send();
    
    function computePlaybackFactor(listenerVelocity, sourceVelocity) {
        let scaledSpeedOfSound = speedOfSound / dopplerFactor;
    
        listenerVelocity = Math.min(listenerVelocity, scaledSpeedOfSound);
        sourceVelocity = Math.min(sourceVelocity, scaledSpeedOfSound);
    
        let factor = ((speedOfSound - dopplerFactor * listenerVelocity) / (speedOfSound - dopplerFactor * sourceVelocity));
        return factor;
    }

    button.onclick = () => {
        let factor = computePlaybackFactor(0, 8.3);
        console.log('Multiplier factor: ' + factor);

        console.log(ctx.destination);
        source.playbackRate.value *= factor;

        let newRate = source.playbackRate.value;
        console.log('New playback: ' + newRate);
    }
    play.onclick = () => {
        console.log('Before: ' + ctx.state);
        if(isPlaying){
            if(isReady){
                ctx.suspend();
            }
            play.textContent = 'Play';
        }
        else{
            if(!started){
                started = true;
                source.start(0);
                console.log('Invoking start');
            }
            if(isReady){
                ctx.resume();
            }
            play.textContent = 'Stop';
        }
        console.log('After: ' + ctx.state);
        isPlaying = !isPlaying;
    }

}

