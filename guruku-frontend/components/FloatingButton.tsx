import React, { useRef } from "react";
import {
  Animated,
  PanResponder,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  PanResponderGestureState,
  GestureResponderEvent,
  Image,
} from "react-native";
import { useRouter } from "expo-router"; // <--- 1. Import useRouter

export default function FloatingButton() {
  // === 2. Inisialisasi Router ===
  const router = useRouter();

  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  // === KONFIGURASI ===
  const BUTTON_SIZE = 60;
  const BOTTOM_MARGIN = 90;
  const TOP_MARGIN = 50;
  
  // Ganti dengan gambar ikon chatbot Anda
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
        // Cek apakah user melakukan drag atau hanya klik
        // Jika pergeseran sangat kecil, anggap sebagai KLIK
        const isDrag = Math.abs(gestureState.dx) > dragThreshold || Math.abs(gestureState.dy) > dragThreshold;

        if (!isDrag) {
            // Logic klik ada di onPress TouchableOpacity, tapi PanResponder kadang mengambil alih.
            // Namun, karena onStartShouldSetPanResponder return false, 
            // sentuhan diam (tap) akan diteruskan ke TouchableOpacity di bawahnya.
            // Jadi logika navigasi aman ditaruh di onPress.
        }

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
 
        onPress={() => {
            router.push("/Chatbot"); 
        }}
      >
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
    borderRadius: 30,
    backgroundColor: "#0038FF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    padding: 0,
    overflow: 'hidden',
  },
  btnImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});