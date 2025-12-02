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
  ScrollView 
} from 'react-native';
import { useRouter } from "expo-router";

const SERVER_HOST = Platform.select({
  android: '10.0.2.2', 
  ios: 'localhost',    
  default: '192.168.1.115'
});

const PORT = '4503';
const BASE_URL = `http://${SERVER_HOST}:${PORT}/api/usuario`;

const apiService = {
  createUsuario: async (userData) => {
    const url = `${BASE_URL}/criar`;
    console.log(`[POST] Conectando em: ${url}`);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Erro ${response.status}`);
      }

      return await response.json(); 
    } catch (error) {
      console.error("Erro na requisição:", error);
      throw error; 
    }
  }
};

// --- COMPONENTES ---

const InputField = ({ label, placeholder, value, onChangeText, secureTextEntry, error }) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPassword = secureTextEntry;

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && !isPasswordVisible}
          autoCapitalize="none"
        />
        {isPassword && (
          <TouchableOpacity 
            onPress={() => setIsPasswordVisible(!isPasswordVisible)} 
            style={styles.textIconButton}
          >
            <Text style={styles.textIconLabel}>
              {isPasswordVisible ? "Ocultar" : "Ver"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export default function RegisterScreen() {
  const router = useRouter(); // Hook de navegação
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const validate = () => {
    let newErrors = {};
    if (!formData.nome) newErrors.nome = "Nome é obrigatório";
    if (!formData.email.includes("@")) newErrors.email = "E-mail inválido";
    if (formData.senha.length < 6) newErrors.senha = "Mínimo de 6 caracteres";
    if (formData.senha !== formData.confirmarSenha) newErrors.confirmarSenha = "Senhas não conferem";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const payload = {
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha
      };

      await apiService.createUsuario(payload);
      setSuccess(true);

    } catch (err) {
      Alert.alert("Erro no Cadastro", err.message || "Falha ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIconCircle}>
            <Text style={styles.checkIcon}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Conta Criada!</Text>
          <Text style={styles.successText}>Usuário salvo no banco com sucesso.</Text>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={() => {
              router.back(); 
            }}
          >
            <Text style={styles.buttonText}>Fazer Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Criar conta</Text>

          <View style={styles.card}>
            
            <InputField 
              label="Nome Completo"
              placeholder="Digite seu nome completo"
              value={formData.nome}
              onChangeText={(text) => setFormData({...formData, nome: text})}
              error={errors.nome}
            />

            <InputField 
              label="E-mail"
              placeholder="Digite seu e-mail"
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
              error={errors.email}
            />

            <InputField 
              label="Senha"
              placeholder="Digite sua senha"
              secureTextEntry
              value={formData.senha}
              onChangeText={(text) => setFormData({...formData, senha: text})}
              error={errors.senha}
            />

            <InputField 
              label="Confirme sua senha"
              placeholder="Confirme sua senha"
              secureTextEntry
              value={formData.confirmarSenha}
              onChangeText={(text) => setFormData({...formData, confirmarSenha: text})}
              error={errors.confirmarSenha}
            />

            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Criar conta</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.linkButton}
              onPress={() => router.back()}
            >
              <Text style={styles.linkText}>Já possuo uma conta</Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', 
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  header: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  backArrow: {
    fontSize: 28,
    color: '#9CA3AF',
    fontWeight: '300'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827', 
    textAlign: 'center',
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 6,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    padding: 14,
    fontSize: 14,
    color: '#111827',
  },
  inputError: {
    borderColor: '#EF4444', 
    backgroundColor: '#FEF2F2',
  },
  textIconButton: {
    padding: 14,
  },
  textIconLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  button: {
    backgroundColor: '#06B6D4',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
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
  linkButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    color: '#0891B2',
    fontSize: 14,
    fontWeight: '600',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkIcon: {
    fontSize: 40,
    color: '#16A34A',
    fontWeight: 'bold'
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  }
});
