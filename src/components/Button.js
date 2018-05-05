import React, { Component } from 'react';

import {
  Text,
  View,
  Platform,
  TouchableHighlight,
  TouchableOpacity,
  TouchableNativeFeedback,
  StyleSheet
} from 'react-native';
import Icon from 'react-native-fa-icons';

const IOS_BLUE = '#007AFF';
const MATERIAL_BLUE = '#2196F3';

const styles = StyleSheet.create({
  button: {
    padding: 20,
    margin: 10
  },
  buttonRaised: {
    borderRadius: 10,
    ...Platform.select({
        ios: {
            backgroundColor: IOS_BLUE,
          },
          android: {
            backgroundColor: MATERIAL_BLUE,
            elevation: 3,
          }
    })
  },
  buttonFlat: {
  },
  buttonLabel: {
    textAlign: 'center',
  },
  buttonLabelRaised: {
    color: '#FFFFFF',
  },
  buttonLabelFlat: {
    ...Platform.select({
        ios: {
            color: IOS_BLUE,
          },
          android: {
            color: MATERIAL_BLUE,
          }
    })
  },
});

const ButtonWrapper = ({ raised, onPress, children }) => {
  // All Android Buttons should have the ripple effect
  if (Platform.OS === 'android') {
    // Raised Android buttons need a white ripple
    if (raised) {
      return (
        <TouchableNativeFeedback
          onPress={onPress}
          background={TouchableNativeFeedback.Ripple('#FFF')}
        >
          <View style={[styles.button, styles.buttonRaised]}>
            {children}
          </View>
        </TouchableNativeFeedback>
      );
    }
    
    // Normal Android buttons get a gray ripple
    return (
      <TouchableNativeFeedback
        onPress={onPress}
        background={TouchableNativeFeedback.Ripple()}
      >
        <View style={[styles.button, styles.buttonFLat]}>
          {children}
        </View>
      </TouchableNativeFeedback>
    );
  }
  
  // iOS raised buttons use TouchableHighlight
  if (raised) {
    return (
      <TouchableHighlight
        style={[styles.button, styles.buttonRaised]}
        underlayColor="#0052AC"
        onPress={onPress}
      >
        {children}
      </TouchableHighlight>
    );
  }
  
  // Normal iOS buttons use TouchableOpacity
  return (
    <TouchableOpacity
      style={[styles.button, styles.buttonFlat]}
      onPress={onPress}
    >
      {children}
    </TouchableOpacity>
  );
};

class Button extends Component {
  renderLabel() {
    const labelStyles = [styles.buttonLabel];
    if (this.props.raised) {
      labelStyles.push(styles.buttonLabelRaised);
    } else {
      labelStyles.push(styles.buttonLabelFlat);
    }

    let labelText = this.props.label;
    if (labelText && Platform.OS === 'android') {
      labelText = labelText.toUpperCase();
    }

    let labelIcon = this.props.icon || 'times';

    if (labelText && !labelIcon) {
        return <Text style={labelStyles}>{labelText}</Text>;
    } else if (labelText && labelIcon) {
        return (
            <Text style={labelStyles}>
                <Icon name={labelIcon} /> {labelText}
            </Text>
        )
    } else {
        return <Icon style={{color: '#FFF'}} name={labelIcon}></Icon>
    }
  }

  render() {
    return (
      <ButtonWrapper {...this.props}>
        {this.renderLabel()}
      </ButtonWrapper>
    );
  }
}

export default Button;