import Voice from 'react-native-voice';
import Tts from 'react-native-tts';
import Sound from 'react-native-sound';

let completeSound = new Sound('recognitionComplete.m4a', Sound.MAIN_BUNDLE);
let startSound = new Sound('startRecognition.m4a', Sound.MAIN_BUNDLE);

class VoiceRecognition {
    constructor() {
        this.recognizedText = '';
        this.resultPromise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });

        Voice.onSpeechStartHandler = this.onSpeechStartHandler.bind(this);
        Voice.onSpeechPartialResults = this.onSpeechPartialResultsHandler.bind(this);
        Voice.onSpeechError = this.onSpeechErrorHandler.bind(this);
    }

    startRecognitionTimeout() {
        this.speechTimeout = setTimeout(() => this.resolveWithText(), 2000);
    }

    onSpeechStartHandler() {
        this.startRecognitionTimeout();
    }

    onSpeechPartialResultsHandler(e) {
        clearTimeout(this.speechTimeout);
        this.recognizedText = e.value[0];
        this.startRecognitionTimeout();
    }

    onSpeechResultsHandler(e) {
        this.recognizedText = e.value[0];
        this.resolveWithText();
    }

    onSpeechErrorHandler(e) {
       Tts.speak('Pri rozpoznávaní hlasu došlo k chybe.')
    }

    recordPhotoName(text, timeout = 4500) {
        Tts.speak(text);
        setTimeout(() => {
            startSound.play();
            Voice.start('sk-SK');
        }, timeout);

        return this.resultPromise;
    }

    resolveWithText() {
        Voice.stop();
        completeSound.play();

        setTimeout(() => this.resolve(this.recognizedText), 1000);
    }
}

export default VoiceRecognition;