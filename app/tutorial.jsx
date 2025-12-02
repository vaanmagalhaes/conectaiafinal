import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  LayoutAnimation,
  UIManager,
  Alert
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage'; // 1. Importar AsyncStorage

// Habilita animações no Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// --- MOCKS: RÁPIDOS ---
const QUICK_TUTORIALS = [
  {
    id: 1,
    title: "Iniciando no ChatGPT",
    icon: "chatbubble-ellipses-outline",
    color: "#10a37f", // Verde do ChatGPT
    steps: [
      "1. Acesse chat.openai.com ou baixe o app.",
      "2. Crie uma conta usando Google ou E-mail.",
      "3. Para salvar conversas, ative o 'Histórico'.",
      "4. Dica: Use o 'pin' para fixar chats importantes."
    ]
  },
  {
    id: 2,
    title: "Arte no Nano Banana",
    icon: "image-outline",
    color: "#F4B400", // Amarelo Banana
    steps: [
      "1. Abra a ferramenta Nano Banana.",
      "2. Digite um prompt: 'Banana cyberpunk em neon'.",
      "3. Clique em 'Gerar' e aguarde.",
      "4. Selecione a melhor e faça Download."
    ]
  },
  {
    id: 3,
    title: "Explorando o Gemini",
    icon: "sparkles-outline",
    color: "#4285F4", // Azul Google
    steps: [
      "1. Acesse gemini.google.com.",
      "2. Faça upload de uma foto e peça detalhes.",
      "3. Use '@' para integrar com Docs e Gmail.",
      "4. Use o microfone para conversas longas."
    ]
  }
];

// --- MOCKS: COMPLETOS ---
const FULL_TUTORIALS = [
  {
    id: 101,
    title: "Masterclass: Engenharia de Prompt",
    description: "Aprenda a falar a língua da IA. Do básico ao avançado.",
    duration: "45 min",
    level: "Intermediário",
    icon: "school-outline",
    color: "#E11D48" 
  },
  {
    id: 102,
    title: "IA no Trabalho: Produtividade Máxima",
    description: "Automatize planilhas, emails e reuniões usando ClickUp Brain.",
    duration: "1h 10m",
    level: "Iniciante",
    icon: "briefcase-outline",
    color: "#2563EB" 
  },
  {
    id: 103,
    title: "Criando um App com IA",
    description: "O guia definitivo para integrar APIs de inteligência artificial.",
    duration: "2h 30m",
    level: "Avançado",
    icon: "code-slash-outline",
    color: "#7C3AED" 
  }
];

const menuOptions = [
  { label: "Início", iconName: "home-outline", link: "/inicio" },
  { label: "Descobrir", iconName: "search-outline", link: "/descobrir" },
  { label: "Tutoriais", iconName: "book", link: "/tutorial" }, 
  { label: "Perfil", iconName: "person-outline", link: "/perfil" },
];

export default function Tutorial() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState(null);
  
  // Estado para armazenar IDs dos tutoriais concluídos
  const [completedIds, setCompletedIds] = useState([]);

  // Carregar dados salvos ao iniciar
  useEffect(() => {
    loadCompletedTutorials();
  }, []);

  const loadCompletedTutorials = async () => {
    try {
      const stored = await AsyncStorage.getItem('completed_tutorials');
      if (stored) {
        setCompletedIds(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Erro ao carregar tutoriais:", e);
    }
  };

  // Função para marcar/desmarcar como concluído
  const toggleComplete = async (id) => {
    try {
      let newCompletedIds;
      if (completedIds.includes(id)) {
        // Remove se já existe
        newCompletedIds = completedIds.filter(itemId => itemId !== id);
      } else {
        // Adiciona se não existe
        newCompletedIds = [...completedIds, id];
        // Feedback visual rápido (opcional)
        // Alert.alert("Parabéns!", "Tutorial concluído."); 
      }
      
      setCompletedIds(newCompletedIds);
      await AsyncStorage.setItem('completed_tutorials', JSON.stringify(newCompletedIds));
    } catch (e) {
      console.error("Erro ao salvar tutorial:", e);
    }
  };

  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const handleOpenFullTutorial = (id, title) => {
    // Para fins de demo, marcamos como completo ao abrir o curso completo
    Alert.alert(
      "Iniciar Curso", 
      `Deseja iniciar "${title}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Vamos lá!", onPress: () => toggleComplete(id) }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Central de Aprendizado</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* SEÇÃO 1: RÁPIDOS */}
          <View style={styles.sectionHeader}>
            <Ionicons name="flash" size={18} color="#F59E0B" />
            <Text style={styles.sectionTitleText}>Drops de Conhecimento</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Toque no ícone de check para concluir.</Text>

          {QUICK_TUTORIALS.map((tutorial) => {
            const isExpanded = expandedId === tutorial.id;
            const isCompleted = completedIds.includes(tutorial.id);

            return (
              <TouchableOpacity 
                key={tutorial.id} 
                style={[
                  styles.card, 
                  isExpanded && styles.cardExpanded,
                  isCompleted && styles.cardCompletedBorder // Borda verde se concluído
                ]} 
                onPress={() => toggleExpand(tutorial.id)}
                activeOpacity={0.9}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.iconCircle, { backgroundColor: tutorial.color + '20' }]}>
                    <Ionicons name={tutorial.icon} size={24} color={tutorial.color} />
                  </View>
                  <Text style={styles.cardTitle}>{tutorial.title}</Text>
                  
                  {/* Botão de Check */}
                  <TouchableOpacity 
                    onPress={() => toggleComplete(tutorial.id)}
                    style={styles.checkButton}
                  >
                    <Ionicons 
                      name={isCompleted ? "checkmark-circle" : "ellipse-outline"} 
                      size={28} 
                      color={isCompleted ? "#10B981" : "#CCC"} 
                    />
                  </TouchableOpacity>
                </View>

                {isExpanded && (
                  <View style={styles.cardBody}>
                    <View style={styles.divider} />
                    {tutorial.steps.map((step, index) => (
                      <View key={index} style={styles.stepRow}>
                        <Ionicons name="caret-forward" size={14} color="#999" style={{ marginTop: 4 }} />
                        <Text style={styles.stepText}>{step}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

          <View style={styles.sectionSpacer} />

          {/* SEÇÃO 2: COMPLETOS */}
          <View style={styles.sectionHeader}>
            <Ionicons name="library" size={18} color="#4F46E5" />
            <Text style={styles.sectionTitleText}>Cursos Completos</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Aprofunde-se com aulas detalhadas.</Text>

          {FULL_TUTORIALS.map((course) => {
            const isCompleted = completedIds.includes(course.id);
            return (
              <TouchableOpacity 
                key={course.id} 
                style={[styles.fullCourseCard, isCompleted && styles.cardCompletedBorder]}
                onPress={() => handleOpenFullTutorial(course.id, course.title)}
                activeOpacity={0.9}
              >
                <View style={[styles.courseIconBox, { backgroundColor: course.color }]}>
                  <Ionicons name={course.icon} size={28} color="#FFF" />
                </View>
                <View style={styles.courseInfo}>
                  <Text style={styles.courseTitle}>{course.title}</Text>
                  <Text style={styles.courseDesc} numberOfLines={2}>{course.description}</Text>
                  <View style={styles.courseMetaRow}>
                    <View style={styles.metaTag}>
                      <Ionicons name="time-outline" size={12} color="#666" />
                      <Text style={styles.metaText}>{course.duration}</Text>
                    </View>
                    {isCompleted && (
                      <View style={[styles.metaTag, { backgroundColor: '#D1FAE5' }]}>
                        <Text style={[styles.metaText, { color: '#059669', fontWeight: 'bold' }]}>Concluído</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.playButton}>
                  <Ionicons name={isCompleted ? "refresh" : "play"} size={16} color="#4F46E5" />
                </View>
              </TouchableOpacity>
            );
          })}

        </ScrollView>

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
                color={item.link === "/tutorial" ? "#29B6F6" : "#343434"}
                style={{ marginBottom: 2 }}
              />
              <Text style={[styles.menuLabel, item.link === "/tutorial" && styles.menuLabelActive]}>
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
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 90,
  },
  
  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitleText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
    marginLeft: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    marginLeft: 26,
  },
  sectionSpacer: {
    height: 30,
  },

  // Card Styles
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  cardExpanded: {
    borderColor: "#06B6D4",
    backgroundColor: "#F3FDFF",
  },
  cardCompletedBorder: {
    borderColor: "#10B981", // Borda verde quando concluído
    borderWidth: 1.5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
    flex: 1,
  },
  checkButton: {
    padding: 4,
  },
  
  // Body Styles (Steps)
  cardBody: {
    marginTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginBottom: 12,
  },
  stepRow: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "flex-start",
    paddingRight: 10,
  },
  stepText: {
    fontSize: 14,
    color: "#444",
    marginLeft: 10,
    lineHeight: 20,
  },

  // Full Course Card
  fullCourseCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  courseIconBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 4,
  },
  courseDesc: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
    lineHeight: 16,
  },
  courseMetaRow: {
    flexDirection: "row",
    gap: 8,
  },
  metaTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  metaText: {
    fontSize: 10,
    color: "#555",
    marginLeft: 4,
    fontWeight: "500",
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },

  // Menu Styles
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