import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  Alert,
  Modal
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Função para pegar as iniciais
function getUserInitials(name) {
  if (!name) return "IA";
  const names = name.trim().split(" ");
  if (names.length === 1) return names[0][0].toUpperCase();
  return (names[0][0] + names[names.length - 1][0]).toUpperCase();
}

// Opções do Menu
const PROFILE_OPTIONS = [
  { id: 1, label: "Editar Perfil", subtitle: "Dados pessoais e preferências", icon: "chevron-forward", action: 'edit' },
  { id: 2, label: "Histórico", subtitle: "IAs visitadas recentemente", icon: "chevron-forward", action: 'history' },
  { id: 3, label: "Notificações", subtitle: "Configurar alertas e lembretes", icon: "chevron-forward", action: 'notifications' },
  { id: 4, label: "Ajuda e Suporte", subtitle: "FAQ e contato", icon: "chevron-forward", action: 'help' },
  { id: 5, label: "Sobre o ConectaIA", subtitle: "Versão 0.1", icon: "chevron-forward", action: 'about' },
];

const menuOptions = [
  { label: "Início", iconName: "home-outline", link: "/inicio" },
  { label: "Descobrir", iconName: "search-outline", link: "/descobrir" },
  { label: "Tutoriais", iconName: "book-outline", link: "/tutorial" },
  { label: "Perfil", iconName: "person", link: "/perfil" },
];

export default function Perfil() {
  const router = useRouter();
  const [user, setUser] = useState({ 
    nome: "Visitante", 
    email: "visitante@email.com",
    cargo: "Explorador de IA"
  });
  
  const [tutorialCount, setTutorialCount] = useState(0);
  
  // Estado para controlar qual modal está aberto (null = nenhum)
  const [activeModal, setActiveModal] = useState(null);

  // 1. Carrega dados do usuário
  useFocusEffect(
    useCallback(() => {
      const loadUser = async () => {
        try {
          const savedUser = await AsyncStorage.getItem('user_session');
          if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUser({
              ...parsedUser,
            });
          }
        } catch (e) {
          console.log("Erro ao carregar perfil:", e);
        }
      };
      loadUser();
    }, [])
  );

  // 2. Carrega estatísticas
  useFocusEffect(
    useCallback(() => {
      const loadStats = async () => {
        try {
          const storedTutorials = await AsyncStorage.getItem('completed_tutorials');
          if (storedTutorials) {
            const ids = JSON.parse(storedTutorials);
            setTutorialCount(ids.length);
          } else {
            setTutorialCount(0);
          }
        } catch (e) {
          console.error("Erro ao carregar stats:", e);
        }
      };
      loadStats();
    }, [])
  );

  // Lógica de Logout
  const handleLogout = async () => {
    // ... (Mantendo a lógica de logout web/mobile que já fizemos)
    const performLogout = async () => {
      try {
        await AsyncStorage.removeItem('user_session');
        router.replace("/"); 
      } catch (error) {
        console.error("Erro ao limpar sessão:", error);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm("Deseja realmente sair da sua conta?")) {
        await performLogout();
      }
    } else {
      Alert.alert(
        "Sair",
        "Deseja realmente sair da sua conta?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Sair", style: "destructive", onPress: performLogout }
        ]
      );
    }
  };

  // Renderiza o conteúdo do modal baseado no 'activeModal'
  const renderModalContent = () => {
    switch (activeModal) {
      case 'history':
        return (
          <>
            <Text style={styles.modalTitle}>Histórico</Text>
            <Text style={styles.modalText}>
              Aqui você verá todas as IAs que visitou recentemente.{"\n"}
              Funcionalidade em desenvolvimento!
            </Text>
            <TouchableOpacity 
              style={styles.modalButtonPrimary} 
              onPress={() => setActiveModal(null)}
            >
              <Text style={styles.modalButtonText}>Ok</Text>
            </TouchableOpacity>
          </>
        );
      
      case 'notifications':
        return (
          <>
            <Text style={styles.modalTitle}>Configurações de Notificação</Text>
            <Text style={[styles.modalText, { textAlign: 'left', marginBottom: 20 }]}>
              Configure quando e como receber notificações sobre:{"\n\n"}
              • Novas IAs adicionadas{"\n"}
              • Atualizações das suas favoritas{"\n"}
              • Tutoriais recomendados{"\n"}
              • Ofertas especiais{"\n\n"}
              Em breve!
            </Text>
            <TouchableOpacity 
              style={styles.modalButtonPrimary} 
              onPress={() => setActiveModal(null)}
            >
              <Text style={styles.modalButtonText}>Ok</Text>
            </TouchableOpacity>
          </>
        );

      case 'help':
        return (
          <>
            <Text style={styles.modalTitle}>Ajuda e Suporte</Text>
            <Text style={[styles.modalText, { textAlign: 'left', marginBottom: 10 }]}>
              Precisa de ajuda? Entre em contato:{"\n\n"}
              suporte@conectaia.com{"\n"}
              Chat online (em breve){"\n"}
              (21) 99999-9999{"\n\n"}
              Horário de atendimento:{"\n"}
              Segunda a sexta: 9h às 18h
            </Text>
            <View style={styles.modalActionsRow}>
              <TouchableOpacity 
                style={styles.modalButtonOutline} 
                onPress={() => setActiveModal(null)}
              >
                <Text style={styles.modalButtonOutlineText}>Entrar em Contato</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButtonPrimary, { flex: 0.4 }]} // Botão Ok menor
                onPress={() => setActiveModal(null)}
              >
                <Text style={styles.modalButtonText}>Ok</Text>
              </TouchableOpacity>
            </View>
          </>
        );

      case 'about':
        return (
          <>
            <Text style={styles.modalTitle}>Sobre o ConectaIA</Text>
            <Text style={[styles.modalText, { textAlign: 'left', fontSize: 14 }]}>
              ConectaIA v1.0.0{"\n\n"}
              Encontre a IA perfeita para você.{"\n\n"}
              Desenvolvido pelos alunos do 4º módulo de Análise e Desenvolvimento de Sistemas da Faculdade Tecnóloga Senac RJ.{"\n\n"}
              Uma plataforma brasileira para conectar você às melhores ferramentas de IA!
            </Text>
            <TouchableOpacity 
              style={[styles.modalButtonPrimary, { marginTop: 20 }]} 
              onPress={() => setActiveModal(null)}
            >
              <Text style={styles.modalButtonText}>Ok</Text>
            </TouchableOpacity>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Perfil</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="notifications" size={24} color="#222" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* CARTÃO DO USUÁRIO */}
          <View style={styles.profileCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{getUserInitials(user.nome)}</Text>
            </View>
            <Text style={styles.userName}>{user.nome}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>

          {/* ESTATÍSTICAS */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: '#06B6D4' }]}>{tutorialCount}</Text>
              <Text style={styles.statLabel}>Tutoriais Concluídos</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>IAs Descobertas</Text>
            </View>
          </View>

          {/* LISTA DE OPÇÕES */}
          <View style={styles.optionsList}>
            {PROFILE_OPTIONS.map((option) => (
              <TouchableOpacity 
                key={option.id} 
                style={styles.optionItem}
                onPress={() => {
                  if (option.action === 'edit') {
                    router.push("/editarperfil");
                  } else {
                    setActiveModal(option.action); // Abre o modal correspondente
                  }
                }}
              >
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>{option.label}</Text>
                  <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
            ))}
            
            {/* BOTÃO DE SAIR */}
            <TouchableOpacity style={styles.optionItem} onPress={handleLogout}>
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionTitle, { color: '#ef4444' }]}>Sair da Conta</Text>
                <Text style={styles.optionSubtitle}>Desconectar do aplicativo</Text>
              </View>
              <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>

        </ScrollView>

        {/* MODAL GENÉRICO */}
        <Modal
          visible={activeModal !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setActiveModal(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TouchableOpacity 
                style={styles.closeIcon} 
                onPress={() => setActiveModal(null)}
              >
                <Ionicons name="close" size={20} color="#000" />
              </TouchableOpacity>
              
              {renderModalContent()}

            </View>
          </View>
        </Modal>

        {/* MENU INFERIOR */}
        <View style={styles.menuBar}>
          {menuOptions.map((item, idx) => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuItem}
              onPress={() => router.push(item.link)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={item.iconName}
                size={24}
                color={item.link === "/perfil" ? "#29B6F6" : "#343434"}
                style={{ marginBottom: 2 }}
              />
              <Text style={[styles.menuLabel, item.link === "/perfil" && styles.menuLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

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
  scrollContent: {
    paddingBottom: 80,
  },
  profileCard: {
    alignItems: "center",
    backgroundColor: "#f9fafb",
    marginHorizontal: 20,
    borderRadius: 20,
    paddingVertical: 24,
    marginBottom: 20,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1e3a8a",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "bold",
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  roleBadge: {
    backgroundColor: "#3b5998", 
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  roleText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    width: "31%", 
    justifyContent: 'center',
    minHeight: 100,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#555",
    textAlign: "center",
    lineHeight: 16,
  },
  optionsList: {
    paddingHorizontal: 20,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 12,
    color: "#888",
  },
  // --- ESTILOS DO MODAL ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    position: "relative",
  },
  closeIcon: {
    position: "absolute",
    top: 12,
    right: 12,
    padding: 4,
    zIndex: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 15,
    color: "#333",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
    width: '100%',
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  modalButtonPrimary: {
    backgroundColor: "#29B6F6", // Cyan
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
    justifyContent: 'center',
  },
  modalButtonOutline: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    justifyContent: 'center',
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalButtonOutlineText: {
    color: "#333",
    fontWeight: "bold",
    fontSize: 14,
  },
  // MENU
  menuBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    height: 62,
    borderTopWidth: 1,
    borderColor: "#e5e5e5",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  menuItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    fontSize: 13,
    color: "#343434",
    marginTop: 2,
  },
  menuLabelActive: {
    color: "#29B6F6",
    fontWeight: "bold",
  },
});