import React, { Component } from "react";
import {
    View,
} from "react-native";
import Tts from 'react-native-tts';

import CaptureView from './src/components/CaptureView'

export default class App extends Component {
    componentDidMount() {
        Tts.setDefaultLanguage('cs-CZ');
        Tts.setDucking(true);
    }

    render() {
        return <CaptureView />;
    }
}
