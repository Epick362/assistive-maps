import React, { Component } from "react";
import { 
    View,
    FlatList, 
    StyleSheet, 
    Text 
} from "react-native";

class NearbyView extends Component {
  render() {
    return (
        <FlatList
            style={styles.container}
            data={this.props.data}
            keyExtractor={(item, index) => item.id}
            renderItem={data => (
                <View style={styles.nearbyItem}>
                    <Text>{ data.item.name }</Text>
                    <Text>Distance {Math.round(data.item.distance)}m</Text>
                    <Text>Heading {Math.floor(data.item.thetaHeading)}°</Text>
                </View>
            )}
        />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 5
  },
  nearbyItem: {
    padding: 10
  }
});

export default NearbyView;
