import React, { useRef } from "react";
import {
  Animated,
  PanResponder,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  PanResponderGestureState,
  GestureResponderEvent,
  Image, // <--- 1. Jangan lupa import Image
} from "react-native";

export default function FloatingButton() {
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  // === KONFIGURASI ===
  const BUTTON_SIZE = 60;
  const BOTTOM_MARGIN = 90; 
  const TOP_MARGIN = 50; 

  const BUTTON_IMAGE = require('@/assets/images/Chatbot-Icon.png'); 

  const MAX_Y = screenHeight - BOTTOM_MARGIN - BUTTON_SIZE;
  const MIN_Y = TOP_MARGIN;

  const position = useRef(
    new Animated.ValueXY({ x: screenWidth - 80, y: screenHeight - 150 })
  ).current;

  const dragThreshold = 5;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,

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
        let newY = gestureState.moveY - BUTTON_SIZE / 2;
        if (newY > MAX_Y) newY = MAX_Y;
        if (newY < MIN_Y) newY = MIN_Y;

        position.setValue({
          x: gestureState.moveX - BUTTON_SIZE / 2,
          y: newY,
        });
      },

      onPanResponderRelease: (
        _: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        let finalX: number;
        let finalY = gestureState.moveY - BUTTON_SIZE / 2;

        if (finalY > MAX_Y) finalY = MAX_Y;
        if (finalY < MIN_Y) finalY = MIN_Y;

        if (gestureState.moveX < screenWidth / 2) {
          finalX = 20; 
        } else {
          finalX = screenWidth - 80; 
        }

        Animated.spring(position, {
          toValue: { x: finalX, y: finalY },
          useNativeDriver: false,
          friction: 5,
        }).start();
      },
    })
  ).current;

  return (
    <Animated.View
      style={[styles.floating, position.getLayout()]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        style={styles.btn}
        activeOpacity={0.8}
        onPress={() => console.log("Floating Button Pressed")}
      >
        {/* === 2. GANTI TEXT DENGAN IMAGE DISINI === */}
        <Image 
          source={BUTTON_IMAGE} 
          style={styles.btnImage} 
        />
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
    borderRadius: 30, // Membuat lingkaran
    backgroundColor: "#0038FF", // Warna background (akan tertutup gambar jika transparan)
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    
    // === 3. TAMBAHAN PENTING ===
    padding: 0, // Pastikan tidak ada padding
    overflow: 'hidden', // MEMOTONG GAMBAR AGAR MENGIKUTI BENTUK LINGKARAN
  },
  btnImage: {
    width: '100%', // Mengisi lebar penuh tombol (60)
    height: '100%', // Mengisi tinggi penuh tombol (60)
    resizeMode: 'cover', // 'cover' agar gambar penuh tanpa distorsi (terpotong dikit jika rasio beda)
                         // Gunakan 'contain' jika ingin seluruh gambar terlihat tapi ada sisa space
  },
});