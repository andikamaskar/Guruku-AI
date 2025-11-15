import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import React, { useState } from 'react';

export default function App() {
  
  const pages = [
    {
      title: 'What is Lorem Ipsum?',
      desc: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
      img: require('../../assets/images/img1.png')
    },
    {
      title: 'Why do we use it?',
      desc: 'It is a long established fact that a reader will be distracted by the readable content.',
      img: require('../../assets/images/img2.png')
    },
    {
      title: 'Where does it come from?',
      desc: 'Contrary to popular belief, Lorem Ipsum is not simply random text.',
      img: require('../../assets/images/img3.png')
    },
    {
      title: 'Where can I get some?',
      desc: 'There are many variations of passages of Lorem Ipsum available.',
      img: require('../../assets/images/img4.png')
    }
  ];

  const [pageIndex, setPageIndex] = useState(0);

  const handleNext = () => {
    if (pageIndex < pages.length - 1) {
      setPageIndex(pageIndex + 1);
    }
  };

  const handlePrev = () => {
    if (pageIndex > 0) {
      setPageIndex(pageIndex - 1);
    }
  };

  return (
    <View style={styles.container}>

      {/* HEADER BG */}
      <View style={styles.BGHeader02} />
      <View style={styles.BGHeader01} />

      {/* CONTENT */}
      <View style={styles.contentBox}>
        <View style={styles.cont}>

          {/* GAMBAR */}
          <View style={styles.contImg}>
            <Image 
              source={pages[pageIndex].img}
              style={{ width: '100%', height: '100%', borderRadius: 12 }}
              resizeMode="cover"
            />
          </View>

          {/* DOT NAVIGATION */}
          <View style={styles.contDot}>
            {pages.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  { backgroundColor: i === pageIndex ? '#0B409C' : '#ccc' }
                ]}
              />
            ))}
          </View>

          {/* DESCRIPTIONS */}
          <View style={styles.contDes}>
            <Text style={styles.Title}>{pages[pageIndex].title}</Text>
            <Text style={styles.Desc}>{pages[pageIndex].desc}</Text>
          </View>

          {/* BUTTONS */}
          <View style={styles.contButton}>
            <TouchableOpacity onPress={handlePrev}>
              <Text style={styles.PrevButton}>Prev</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleNext}>
              <Text style={styles.NextButton}>Next</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>

      {/* FOOTER BG */}
      <View style={styles.BGFooter02} />
      <View style={styles.BGFooter01} />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },

  // HEADER SECTION
  BGHeader01: {
    width: '105%',
    height: 140,
    borderRadius: 12,
    backgroundColor: 'white',
    position: 'absolute',
    transform: [{ rotate: '-6deg' }],
    top: -40,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 10
  },

  BGHeader02: {
    width: 140,
    height: 140,
    borderRadius: 16,
    backgroundColor: '#0B409C',
    position: 'absolute',
    top: -20,
    right: '1%',
    zIndex: 1
  },

  // FOOTER SECTION
  BGFooter01: {
    width: '105%',
    height: 140,
    borderRadius: 12,
    backgroundColor: 'white',
    position: 'absolute',
    transform: [{ rotate: '-6deg' }],
    bottom: -40,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 10
  },

  BGFooter02: {
    width: 140,
    height: 140,
    borderRadius: 16,
    backgroundColor: '#0B409C',
    position: 'absolute',
    bottom: -20,
    left: '1%',
    zIndex: 1
  },

  // CONTENT SECTION
  contentBox: {
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: '24%',
    width: '100%'
  },
  
  cont: {
    width: '70%'
  },

  contImg: {
    height: 180,
    marginVertical: 10
  },

  contDot: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 10
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 6
  },

  contDes: {
    height: 160,
    marginVertical: 10
  },

  Title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0B409C',
    textAlign: 'center',
    marginBottom: 10
  },

  Desc: {
    textAlign: 'justify',
    fontSize: 14
  },

  contButton: {
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  PrevButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 12
  },

  NextButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    backgroundColor: '#0B409C',
    borderRadius: 12,
    color: '#fff'
  }
});
