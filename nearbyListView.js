import React from "react";
import { View, FlatList, StyleSheet, Text } from "react-native";

class NearbyListView extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
        <FlatList
            style={styles.container}
            data={this.props.data}
            keyExtractor={(item, index) => item.id}
            renderItem={data => (
                <View style={styles.nearbyItem}>
                    <Text>{ data.item.name }</Text>
                    <Text>Theta {data.item.theta}</Text>
                    <Text>ThetaHeading {data.item.thetaHeading}</Text>
                </View>
            )}
        />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 5
  },
  nearbyItem: {
    padding: 20
  }
});

export default NearbyListView;
