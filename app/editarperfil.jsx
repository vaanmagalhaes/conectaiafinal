import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  ScrollView
} from 'react-native';
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- CONFIGURAÇÃO DA API ---
const MEU_IP_DA_REDE = '192.168.1.115'; // Confere se seu IP não mudou!

const SERVER_HOST = Platform.select({
  ios: 'localhost',
  android: MEU_IP_DA_REDE,
  default: MEU_IP_DA_REDE
});

const PORT = '4503';
const BASE_URL = `http://${SERVER_HOST}:${PORT}/api/usuario`;

const apiService = {
  updateUser: async (id, data) => {
    const url = `${BASE_URL}/atualizar/${id}`;
    console.log(`[PUT] Atualizando usuário ${id}:`, data);

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Falha ao atualizar perfil.");
      }

      return await response.json();
    } catch (error) {
      console.error("Erro no update:", error);
      throw error;
    }
  }
};

// Função de iniciais (Reutilizada)
function getUserInitials(name) {
  if (!name) return "IA";
  const names = name.trim().split(" ");
  if (names.length === 1) return names[0][0].toUpperCase();
  return (names[0][0] + names[names.length - 1][0]).toUpperCase();
}

export default function EditarPerfil() {
  const router = useRouter();
  
  // Estado do Usuário
  const [user, setUser] = useState(null);
  
  // Controle de Edição
  const [editingField, setEditingField] = useState(null); // 'nome' | 'senha' | null
  const [tempValue, setTempValue] = useState("");
  const [loading, setLoading] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    const loadUser = async () => {
      const savedUser = await AsyncStorage.getItem('user_session');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    };
    loadUser();
  }, []);

  const startEditing = (field, currentValue) => {
    setEditingField(field);
    setTempValue(currentValue || "");
  };

  const cancelEditing = () => {
    setEditingField(null);
    setTempValue("");
  };

  const saveChanges = async () => {
    if (!tempValue.trim()) {
      Alert.alert("Erro", "O campo não pode ficar vazio.");
      return;
    }

    setLoading(true);
    try {
      // Monta o payload dinâmico baseado no campo que está sendo editado
      // Nota: O backend espera o objeto completo ou parcial? 
      // Geralmente PUT pede o objeto todo, mas vamos mandar o que mudou + os dados antigos
      const payload = {
        nome: editingField === 'nome' ? tempValue : user.nome,
        email: user.email, // E-mail geralmente não muda fácil assim, mas o DTO pede
        senha: editingField === 'senha' ? tempValue : user.senha, 
        // Adicione outros campos se o seu DTO exigir (ex: id, status)
      };

      const updatedUser = await apiService.updateUser(user.id, payload);
      
      // Sucesso! Atualiza estado local e storage
      const newUserState = { ...user, ...payload }; // Ou usar updatedUser se o back retornar tudo
      setUser(newUserState);
      await AsyncStorage.setItem('user_session', JSON.stringify(newUserState));
      
      setEditingField(null);
      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");

    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar as alterações.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <View style={styles.loadingContainer}><ActivityIndicator color="#06B6D4" /></View>;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar Perfil</Text>
          <View style={{ width: 40 }} /> 
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            
            {/* AVATAR COM ÍCONE DE CÂMERA */}
            <View style={styles.avatarContainer}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{getUserInitials(user.nome)}</Text>
              </View>
              <TouchableOpacity style={styles.cameraButton}>
                <Ionicons name="image-outline" size={16} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* CAMPO: NOME COMPLETO */}
            <View style={styles.fieldCard}>
              <Text style={styles.fieldLabel}>Nome Completo</Text>
              
              {editingField === 'nome' ? (
                <View style={styles.editRow}>
                  <TextInput
                    style={styles.input}
                    value={tempValue}
                    onChangeText={setTempValue}
                    autoFocus
                  />
                  <TouchableOpacity 
                    style={styles.saveButton} 
                    onPress={saveChanges}
                    disabled={loading}
                  >
                    {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveButtonText}>Salvar</Text>}
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.displayRow}>
                  <Text style={styles.displayText}>{user.nome}</Text>
                  <TouchableOpacity onPress={() => startEditing('nome', user.nome)}>
                    <Text style={styles.editLink}>Editar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* CAMPO: E-MAIL (Somente Leitura) */}
            <View style={[styles.fieldCard, styles.disabledCard]}>
              <Text style={styles.fieldLabel}>E-mail</Text>
              <View style={styles.displayRow}>
                <Text style={[styles.displayText, { color: '#999' }]}>{user.email}</Text>
                {/* E-mail geralmente não se edita aqui por segurança */}
              </View>
            </View>

            {/* CAMPO: SENHA */}
            <View style={styles.fieldCard}>
              <Text style={styles.fieldLabel}>Senha</Text>
              
              {editingField === 'senha' ? (
                <View style={styles.editRow}>
                  <TextInput
                    style={styles.input}
                    value={tempValue}
                    onChangeText={setTempValue}
                    placeholder="Nova senha"
                    secureTextEntry
                    autoFocus
                  />
                  <TouchableOpacity 
                    style={styles.saveButton} 
                    onPress={saveChanges}
                    disabled={loading}
                  >
                    {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveButtonText}>Salvar</Text>}
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.displayRow}>
                  <Text style={styles.displayText}>••••••••</Text>
                  <TouchableOpacity onPress={() => startEditing('senha', '')}>
                    <Text style={styles.editLink}>Editar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Botão Cancelar Edição (Só aparece se estiver editando) */}
            {editingField && (
              <TouchableOpacity onPress={cancelEditing} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancelar Edição</Text>
              </TouchableOpacity>
            )}

          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  
  // Avatar
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#1e3a8a",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 36,
    color: "#fff",
    fontWeight: "bold",
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: "#333",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: "#fff",
  },

  // Fields
  fieldCard: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 8,
  },
  disabledCard: {
    opacity: 0.7,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 8,
  },
  displayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  displayText: {
    fontSize: 16,
    color: "#555",
  },
  editLink: {
    fontSize: 14,
    color: "#666",
    textDecorationLine: 'underline',
    fontWeight: '500',
  },

  // Editing State
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  saveButton: {
    backgroundColor: "#06B6D4",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  cancelButton: {
    alignSelf: 'center',
    marginTop: 20,
    padding: 10,
  },
  cancelButtonText: {
    color: '#ef4444',
    fontSize: 14,
  }
});