import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>

      <View style={styles.BGHeader02} />
      <View style={styles.BGHeader01} />

      {/* Main Header */}
      <View style={styles.MainHeader}>
        <Text style={styles.HeaderContent}>LOGIN</Text>
      </View>

      <View style={styles.contentBox}>
        <View style={styles.FormBox}>

          <Image
            style={styles.MainImage}
            source={require('../../assets/images/login-img.png')}
          />

          <View style={styles.InputBox}>
            <Text style={styles.labelInput}>Email</Text>
            <TextInput style={styles.input} placeholderTextColor="#aaa" />
          </View>

          <View style={styles.InputBox}>
            <Text style={styles.labelInput}>Password</Text>
            <TextInput style={styles.input} secureTextEntry placeholderTextColor="#aaa" />
            <Text style={styles.forgetpassword} />
          </View>

          <View style={styles.InputBox}>
            <TouchableOpacity style={styles.button}>
              <Image
                style={{ width: 30, height: 30 }}
                source={require('../../assets/images/arrow-right.png')}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.InputBox}>
            <Text style={styles.orText}> - or -</Text>
          </View>

          <View style={styles.InputBox}>
            <TouchableOpacity style={styles.Gbutton}>
              <Text style={styles.TextGButton}>Masuk menggunakan Google</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>

      {/* Footer Background */}
      <View style={styles.BGFooter02} />
      <View style={styles.BGFooter01} />

      {/* Main Footer */}
      <View style={styles.MainFooter}>
        <View>
          <Text style={styles.FooterContent}>Sudah Mempunyai Akun?</Text>
          <TouchableOpacity style={styles.regbutton}>
            <Text style={styles.TextRegButton}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // HEADER SECTION
  MainHeader: {
    width: '70%',
    position: 'absolute',
    zIndex: 10,
    top: 50,
    elevation: 100
  },

  HeaderContent: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0B409C',
  },

  TextRegButton: {
    fontSize: 12,
    color: 'blue',
  },

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
    elevation: 10,
  },

  BGHeader02: {
    width: 140,
    height: 140,
    borderRadius: 16,
    backgroundColor: '#0B409C',
    position: 'absolute',
    top: -20,
    right: '1%',
    zIndex: 1,
  },

  // FOOTER SECTION
  MainFooter: {
    width: '70%',
    position: 'absolute',
    zIndex: 10,
    bottom: 40,
    elevation: 100,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },


  FooterContent: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },


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
    elevation: 10,
  },

  BGFooter02: {
    width: 140,
    height: 140,
    borderRadius: 16,
    backgroundColor: '#0B409C',
    position: 'absolute',
    bottom: -20,
    left: '1%',
    zIndex: 1,
  },

  // CONTENT SECTION
  contentBox: {
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: '20%',
    width: '100%',
  },

  MainImage: {
    width: 240, 
    height: 126,
    alignSelf: 'center',
    marginBottom: 20
  },

  FormBox: {
    width: '70%',
  },

  InputBox: {
    marginVertical: 12,
  },

  labelInput: {
    fontSize: 12,
  },

  input: {
    fontSize: 16,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'black',
  },

  forgetpassword: {
    fontSize: 12,
    textAlign: 'end',
  },

  button: {
    width: 52,
    height: 52,
    backgroundColor: '#0B409C',
    borderRadius: 100,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },

  orText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
    backgroundColor: 'white',
  },

  Gbutton: {
    backgroundColor: '#0B409C',
    borderRadius: 8,
    paddingVertical: 10,
  },

  TextGButton: {
    color: 'white',
    textAlign: 'center',
    fontSize: 12,
  },
});
