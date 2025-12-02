import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter } from "expo-router";

// --- SERVIÇO FAKE (MOCK) ---
// Como provavelmente não temos esse endpoint no Back ainda, 
// vamos fingir que ele funciona pra você não travar.
const apiService = {
  recoverPassword: async (email) => {
    console.log(`[POST] Solicitando recuperação para: ${email}`);
    
    // Simula um delay de rede de 1.5s
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (!email.includes("@") || !email.includes(".")) {
      throw new Error("E-mail inválido.");
    }

    return { success: true };
  }
};

export default function RecoverPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRecover = async () => {
    if (!email) {
      Alert.alert("Opa!", "Preciso do seu e-mail para enviar o código.");
      return;
    }

    setLoading(true);

    try {
      await apiService.recoverPassword(email);
      
      Alert.alert(
        "Verifique seu e-mail", 
        `Enviamos um código de recuperação para ${email}.`,
        [
          { text: "OK", onPress: () => router.back() } // Volta pro Login ao dar OK
        ]
      );
    } catch (err) {
      Alert.alert("Erro", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, styles.androidSafeArea]}>
      <View style={styles.content}>
        
        {/* Header com botão de voltar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Recuperação de Senha</Text>
        </View>

        <Text style={styles.description}>
          Digite seu e-mail no campo abaixo para receber um código.
        </Text>

        {/* Input de E-mail */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Digite seu e-mail"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Botão de Ação */}
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleRecover}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Enviar código</Text>
          )}
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Fundo branco clean
  },
  androidSafeArea: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    marginLeft: -8, // Ajuste fino pra alinhar com a margem
  },
  backArrow: {
    fontSize: 28,
    color: '#111827', // Preto suave
    fontWeight: '300',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  description: {
    fontSize: 16,
    color: '#4B5563', // Cinza médio
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB', // Cinza claro borda
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  button: {
    backgroundColor: '#06B6D4', // Cyan padrão do app
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: "#06B6D4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});