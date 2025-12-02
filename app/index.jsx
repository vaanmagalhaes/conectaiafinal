import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ImageBackground,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native'; // <--- O CARA DA NAVEGAÇÃO

// --- LÓGICA DE CONEXÃO ---

const MEU_IP_DA_REDE = '192.168.1.115'; // Confere se seu IP não mudou!

const SERVER_HOST = Platform.select({
  ios: 'localhost',
  android: MEU_IP_DA_REDE,
  default: MEU_IP_DA_REDE
});

const PORT = '4503';
const BASE_URL = `http://${SERVER_HOST}:${PORT}/api/usuario`;

const apiService = {
  login: async (credentials) => {
    const url = `${BASE_URL}/login`;
    console.log(`[POST] Tentando logar em: ${url}`);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Email ou senha inválidos");
      }

      return await response.json();
    } catch (error) {
      console.error("Erro no login:", error);
      throw error;
    }
  }
};

// --- TELA DE LOGIN ---

export default function LoginScreen() {
  const navigation = useNavigation(); // Hook para navegar
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // 1. Validação básica
    if (!email || !senha) {
      Alert.alert("Opa!", "Preenche tudo aí, por favor.");
      return;
    }

    setLoading(true);

    try {
      // 2. Chama o Backend
      const user = await apiService.login({ email, senha });

      // 3. Sucesso!
      console.log("Login autorizado:", user);

      // 4. Navega para a tela 'inicio' e leva o usuário junto
      // Certifique-se que o nome 'inicio' está registrado no seu App.js/Stack
      navigation.navigate('inicio', { usuario: user });

    } catch (err) {
      // 5. Erro (Senha errada ou servidor fora)
      const msg = err.message.includes("inválidos")
        ? "E-mail ou senha incorretos."
        : "Falha na conexão. O servidor tá on?";

      Alert.alert("Erro no Login", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/images/background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={[styles.container, styles.androidSafeArea]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >

          <View style={styles.card}>

            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/images/logo.jpg')}
                style={styles.logo}
              />
              <Text style={styles.appName}>Conecta <Text style={styles.appNamHighlight}>IA</Text></Text>
            </View>

            <Text style={styles.screenTitle}>Entrar</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>E-mail</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite seu e-mail"
                placeholderTextColor="#A0A0A0"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Senha</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite sua senha"
                placeholderTextColor="#A0A0A0"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Entrar</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footerLinks}>
              <TouchableOpacity onPress={() => navigation.navigate('cadastro')}>
                <Text style={styles.linkText}>Criar conta</Text>
              </TouchableOpacity>

              {/* Link para Recuperar Senha */}
              <TouchableOpacity onPress={() => navigation.navigate('recuperarsenha')}>
                <Text style={styles.linkText}>Esqueci a senha</Text>
              </TouchableOpacity>
            </View>

          </View>

        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  androidSafeArea: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    borderRadius: 12,
    paddingVertical: 30,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 10,
    // DICA: Se a logo for JPG (fundo branco), tintColor vai pintar o quadrado todo de azul.
    // Se ficar feio, remova essa linha abaixo.
    tintColor: '#0891B2',
  },
  appName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  appNamHighlight: {
    color: '#06B6D4',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#FFF',
  },
  button: {
    backgroundColor: '#06B6D4',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  linkText: {
    color: '#06B6D4',
    fontWeight: '600',
    fontSize: 14,
  }
});