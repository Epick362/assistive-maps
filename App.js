import React, { Component } from "react";
import {
    View,
} from "react-native";
import _ from 'lodash';
import Tts from 'react-native-tts';
import RNShakeEvent from 'react-native-shake-event';
import CaptureView from './src/components/CaptureView';

export default class App extends Component {
    componentDidMount() {
        Tts.voices().then(voices => {
            let skVoice = _.find(voices, {language: 'sk-SK'});
            let czVoice = _.find(voices, {language: 'cs-CZ'});
            
            if (skVoice) {
                Tts.setDefaultLanguage('sk-SK');
            } else if (czVoice) {
                Tts.setDefaultLanguage('cs-CZ');
            } else {
                Tts.speak('Error, no suitable language pack found. The application required Slovak or Czech language pack is available on the device.');
            }
        });
        
        Tts.setDucking(true);
    }

    componentWillMount() {
        // Tutorial
        RNShakeEvent.addEventListener('shake', () => {
            Tts.stop();
            Tts.speak('Vitajte v aplikácií Asistívna kamera. Pre odfotenie, kliknite kamkoľvek na obrazovku. Pre otvorenie galérie potiahnite prstom zdola hore, medzi fotkami sa presúvate potiahnutím zprava doľava. Túto nápovedu vyvoláte zahrkaním telefónu');
        });
    }

    componentWillUnmount() {
        RNShakeEvent.removeEventListener('shake');
    }

    render() {
        return <CaptureView />;
    }
}
