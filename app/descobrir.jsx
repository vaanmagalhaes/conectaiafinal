import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  Modal,
  ScrollView
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import IaPopup from "../components/IaPopup";

// --- MOCKS ---
const ALL_IAS = [
  {
    id: 1,
    logo: require("../assets/images/chatgptlogo.png"), 
    title: "ChatGPT",
    subtitle: "OpenAI",
    category: "Texto",
    tags: ["Grátis", "Premium"],
    descricao: "O ChatGPT é uma IA conversacional avançada desenvolvida pela OpenAI.",
    principaisUsos: ["Texto", "Programação", "Análise"],
    precos: "Freemium / Plus R$100+",
    url: "https://chatgpt.com/",
  },
  {
    id: 2,
    logo: require("../assets/images/githublogo.png"), 
    title: "GitHub Copilot",
    subtitle: "GitHub & Microsoft",
    category: "Código",
    tags: ["Grátis", "Premium"],
    descricao: "O seu par programador com IA.",
    principaisUsos: ["Código", "Debug", "Refatoração"],
    precos: "Pago (Grátis para estudantes)",
    url: "https://github.com/copilot",
  },
  {
    id: 3,
    logo: require("../assets/images/geminilogo.png"), 
    title: "Gemini",
    subtitle: "Google",
    category: "Multimodal",
    tags: ["Grátis", "Premium"],
    descricao: "A IA mais capaz do Google.",
    principaisUsos: ["Pesquisa", "Texto", "Integração Google"],
    precos: "Gratuito / Advanced no Google One",
    url: "https://gemini.google.com",
  },
  {
    id: 4,
    logo: require("../assets/images/midjourneylogo.png"), 
    title: "Midjourney",
    subtitle: "Midjourney Inc.",
    category: "Imagem",
    tags: ["Premium"],
    descricao: "Gerador de arte via IA conhecido por criar imagens hiper-realistas.",
    principaisUsos: ["Arte Digital", "Design"],
    precos: "Assinatura mensal",
    url: "https://www.midjourney.com",
  },
  {
    id: 101,
    logo: require("../assets/images/claudelogo.png"),
    title: "Claude 3",
    subtitle: "Anthropic",
    category: "Texto",
    tags: ["Grátis", "Pro"],
    descricao: "Claude é uma IA focada em segurança e ética.",
    principaisUsos: ["Texto", "Análise", "Resumos"],
    precos: "Freemium",
    url: "https://claude.ai",
  },
  {
    id: 103,
    logo: require("../assets/images/nanobananalogo.jpg"), 
    title: "Nano Banana",
    subtitle: "Google",
    category: "Imagem",
    tags: ["Grátis", "Beta"],
    descricao: "A inovadora IA de geração de imagens do Google.",
    principaisUsos: ["Geração de Imagens", "Design"],
    precos: "Gratuito (Beta)",
    url: "https://google.com",
  },
  {
    id: 102,
    logo: require("../assets/images/clickuplogo.png"), 
    title: "ClickUp Brain",
    subtitle: "ClickUp",
    category: "Produtividade",
    tags: ["Pago"],
    descricao: "Rede neural que conecta suas tarefas e documentos.",
    principaisUsos: ["Gestão", "Resumos"],
    precos: "Add-on pago",
    url: "https://clickup.com/ai",
  },
];

const menuOptions = [
  { label: "Início", iconName: "home-outline", link: "/inicio" },
  { label: "Descobrir", iconName: "search", link: "/descobrir" },
  { label: "Tutoriais", iconName: "book-outline", link: "/tutorial" },
  { label: "Perfil", iconName: "person-outline", link: "/perfil" },
];

// OPÇÕES DE FILTRO (Estáticos para a UI)
const FILTER_CATEGORIES = ["Texto", "Imagem", "Código", "Multimodal", "Produtividade"];
const FILTER_PRICES = ["Gratuitas", "Premium"];

export default function Descobrir() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Estados principais
  const [searchText, setSearchText] = useState("");
  const [filteredIas, setFilteredIas] = useState(ALL_IAS);
  
  // Estados do Popup de Detalhes
  const [iaPopupVisible, setIaPopupVisible] = useState(false);
  const [iaSelecionada, setIaSelecionada] = useState(null);

  // Estados do Modal de Filtros
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null); // Categoria selecionada no filtro
  const [selectedPrice, setSelectedPrice] = useState(null);       // Preço selecionado no filtro

  // Inicializa categoria vinda da Home (se houver)
  useEffect(() => {
    if (params.category) {
      setSelectedCategory(params.category);
    }
  }, [params.category]);

  // --- LÓGICA DE FILTRAGEM UNIFICADA ---
  useEffect(() => {
    let result = ALL_IAS;

    // 1. Filtro por Texto (Busca)
    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(lowerSearch) ||
        item.category.toLowerCase().includes(lowerSearch) ||
        item.subtitle.toLowerCase().includes(lowerSearch)
      );
    }

    // 2. Filtro por Categoria (Selecionada no Modal ou vinda da Home)
    if (selectedCategory) {
      result = result.filter(item => 
        item.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // 3. Filtro por Preço (Mapeando UI -> Tags reais)
    if (selectedPrice) {
      result = result.filter(item => {
        // Mapeia "Gratuitas" para a tag "Grátis"
        if (selectedPrice === "Gratuitas") return item.tags.includes("Grátis");
        // Mapeia "Premium" para várias tags pagas possíveis
        if (selectedPrice === "Premium") return item.tags.some(t => ["Premium", "Pro", "Advanced"].includes(t));
        return true;
      });
    }

    setFilteredIas(result);
  }, [searchText, selectedCategory, selectedPrice]);

  const openIaPopup = (item) => {
    setIaSelecionada(item);
    setIaPopupVisible(true);
  };

  // Funções do Modal de Filtro
  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedPrice(null);
    setSearchText(""); // Opcional: limpar busca também? Acho melhor não.
    router.setParams({ category: null }); // Limpa param da URL
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Descobrir</Text>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications" size={24} color="#222" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        {/* BUSCA */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#999" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Que tipo de IA você procura?"
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={setSearchText}
              autoFocus={false}
            />
            {/* Botão de Filtro (Muda de cor se tiver filtro ativo) */}
            <TouchableOpacity onPress={() => setFilterModalVisible(true)}>
              <Ionicons 
                name="options-outline" 
                size={22} 
                color={(selectedCategory || selectedPrice) ? "#06B6D4" : "#999"} 
              />
              {(selectedCategory || selectedPrice) && <View style={styles.filterActiveDot} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* LISTA DE RESULTADOS */}
        <FlatList
          data={filteredIas}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="search" size={48} color="#ddd" />
              <Text style={styles.emptyText}>Nenhuma IA encontrada.</Text>
              {(selectedCategory || selectedPrice) && (
                <TouchableOpacity onPress={clearFilters}>
                  <Text style={styles.clearFilterText}>Limpar filtros</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => openIaPopup(item)}>
              <View style={styles.cardHeader}>
                <Image source={item.logo} style={styles.logo} resizeMode="contain" />
                <View style={styles.cardTexts}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                </View>
                <View style={styles.cardBadge}>
                  <Text style={styles.cardBadgeText}>{item.category}</Text>
                </View>
              </View>
              <Text style={styles.cardDescription} numberOfLines={2}>{item.descricao}</Text>
              
              <View style={styles.tagsRow}>
                {item.tags.map(tag => (
                  <View key={tag} style={styles.miniTag}>
                    <Text style={styles.miniTagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          )}
        />

        {/* MODAL DE DETALHES DA IA */}
        <IaPopup
          visible={iaPopupVisible}
          iaInfo={iaSelecionada}
          loading={false}
          onClose={() => setIaPopupVisible(false)}
        />

        {/* MODAL DE FILTROS (Novo! ✨) */}
        <Modal
          visible={filterModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setFilterModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              
              {/* Header do Modal */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filtros</Text>
                <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <ScrollView>
                {/* Filtro: Categoria */}
                <Text style={styles.filterSectionTitle}>Por Categoria</Text>
                <View style={styles.filterChipsContainer}>
                  {FILTER_CATEGORIES.map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.filterChip,
                        selectedCategory === cat && styles.filterChipSelected
                      ]}
                      onPress={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                    >
                      <Text style={[
                        styles.filterChipText,
                        selectedCategory === cat && styles.filterChipTextSelected
                      ]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Filtro: Preço */}
                <Text style={styles.filterSectionTitle}>Por Preço</Text>
                <View style={styles.filterChipsContainer}>
                  {FILTER_PRICES.map(price => (
                    <TouchableOpacity
                      key={price}
                      style={[
                        styles.filterChip,
                        selectedPrice === price && styles.filterChipSelected
                      ]}
                      onPress={() => setSelectedPrice(selectedPrice === price ? null : price)}
                    >
                      <Text style={[
                        styles.filterChipText,
                        selectedPrice === price && styles.filterChipTextSelected
                      ]}>{price}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

              </ScrollView>

              {/* Botões do Rodapé */}
              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.modalBtnOutline} onPress={clearFilters}>
                  <Text style={styles.modalBtnOutlineText}>Limpar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.modalBtnPrimary} 
                  onPress={() => setFilterModalVisible(false)}
                >
                  <Text style={styles.modalBtnPrimaryText}>Aplicar Filtros</Text>
                </TouchableOpacity>
              </View>

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
                color={item.link === "/descobrir" ? "#29B6F6" : "#343434"}
                style={{ marginBottom: 2 }}
              />
              <Text style={[styles.menuLabel, item.link === "/descobrir" && styles.menuLabelActive]}>
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
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
  },
  backButton: { padding: 4 },
  notificationButton: { padding: 4, position: "relative" },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "white",
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f6fa",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: "#ebebeb",
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#222",
  },
  filterActiveDot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#06B6D4",
    borderWidth: 1,
    borderColor: "#f3f6fa",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 80, 
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  cardTexts: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#222" },
  cardSubtitle: { fontSize: 13, color: "#666" },
  cardBadge: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cardBadgeText: { fontSize: 12, color: "#1565c0", fontWeight: "600" },
  cardDescription: { fontSize: 14, color: "#555", lineHeight: 20, marginBottom: 12 },
  tagsRow: { flexDirection: "row", gap: 8 },
  miniTag: {
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  miniTagText: { fontSize: 11, color: "#666" },
  emptyState: { alignItems: "center", justifyContent: "center", marginTop: 60 },
  emptyText: { marginTop: 10, color: "#999", fontSize: 16, textAlign: "center" },
  clearFilterText: { marginTop: 10, color: "#06B6D4", fontSize: 16, fontWeight: "bold" },
  
  // ESTILOS DO MODAL DE FILTRO
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center", // Ou "flex-end" para estilo Bottom Sheet
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: "100%",
    maxHeight: "80%",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#222" },
  filterSectionTitle: { fontSize: 16, fontWeight: "bold", color: "#222", marginTop: 16, marginBottom: 12 },
  filterChipsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  filterChipSelected: { backgroundColor: "#06B6D4" }, // Cyan
  filterChipText: { fontSize: 14, color: "#555" },
  filterChipTextSelected: { color: "#fff", fontWeight: "bold" },
  
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
    gap: 12,
  },
  modalBtnOutline: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
  },
  modalBtnOutlineText: { fontWeight: "bold", color: "#555" },
  modalBtnPrimary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#06B6D4",
    alignItems: "center",
  },
  modalBtnPrimaryText: { fontWeight: "bold", color: "#fff" },

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
    paddingHorizontal: 2,
    zIndex: 10,
  },
  menuItem: { flex: 1, alignItems: "center", justifyContent: "center" },
  menuLabel: { fontSize: 13, color: "#343434", marginTop: 2 },
  menuLabelActive: { color: "#29B6F6", fontWeight: "bold" },
});