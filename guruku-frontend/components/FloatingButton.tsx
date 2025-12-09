import React, { useRef } from "react";
import {
  Animated,
  PanResponder,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  PanResponderGestureState,
  GestureResponderEvent,
} from "react-native";

export default function FloatingButton() {
  const screenWidth = Dimensions.get("window").width;

  // Menggunakan useRef untuk value animasi
  const position = useRef(new Animated.ValueXY({ x: screenWidth - 80, y: 500 })).current;

  const dragThreshold = 5;

  const panResponder = useRef(
    PanResponder.create({
      // Mengabaikan sentuhan awal, menunggu gerakan (drag)
      onStartShouldSetPanResponder: () => false,

      // Menambahkan tipe untuk gestureState
      onMoveShouldSetPanResponder: (
        _: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        return (
          Math.abs(gestureState.dx) > dragThreshold ||
          Math.abs(gestureState.dy) > dragThreshold
        );
      },

      onPanResponderMove: (
        _: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        position.setValue({
          x: gestureState.moveX - 30, // 30 adalah setengah dari lebar tombol (60/2) agar posisi di tengah jari
          y: gestureState.moveY - 30,
        });
      },

      onPanResponderRelease: (
        _: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        let finalX: number;

        // Sticky logic: Cek apakah dilepas di kiri atau kanan layar
        if (gestureState.moveX < screenWidth / 2) {
          finalX = 20; // Snap ke kiri (dengan margin sedikit)
        } else {
          finalX = screenWidth - 80; // Snap ke kanan
        }

        Animated.spring(position, {
          toValue: { x: finalX, y: gestureState.moveY - 30 },
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  return (
    <Animated.View
      style={[styles.floating, position.getLayout()]}
      {...panResponder.panHandlers}
    >
      {/* Tambahkan activeOpacity agar ada efek visual saat ditekan */}
      <TouchableOpacity style={styles.btn} activeOpacity={0.7} onPress={() => console.log("Pressed")}>
        <Text style={styles.plus}>+</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  floating: {
    position: "absolute",
    zIndex: 999,
  },
  btn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#0038FF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    // Menambahkan shadow untuk iOS agar terlihat sama dengan elevation Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  plus: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    // Sedikit penyesuaian agar tanda plus benar-benar di tengah secara visual
    marginTop: -2, 
  },
});