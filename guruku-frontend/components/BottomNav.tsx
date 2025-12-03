import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";

export default function BottomNav() {
  return (
    <View style={styles.container}>
      <TouchableOpacity>
        <Image
          source={require("../assets/dashboard/Home-Icon.png")}
          style={styles.icon}
        />
      </TouchableOpacity>

      <TouchableOpacity>
        <Image
          source={require("../assets/dashboard/Class-Icon.png")}
          style={styles.iconGray}
        />
      </TouchableOpacity>

      <TouchableOpacity>
        <Image
          source={require("../assets/dashboard/Quizz-Icon.png")}
          style={styles.iconGray}
        />
      </TouchableOpacity>

      <TouchableOpacity>
        <Image
          source={require("../assets/dashboard/Profile-Icon.png")}
          style={styles.iconGray}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,

    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",

    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",

    elevation: 20,
    zIndex: 999,
  },
  icon: {
    width: 28,
    height: 28,
  },
  iconGray: {
    width: 28,
    height: 28,
    opacity: 0.5, // warna jadi lebih grey
  },
});
