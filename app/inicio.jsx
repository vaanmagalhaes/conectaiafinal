import { useRouter, useLocalSearchParams } from "expo-router"; 
import { useState, useEffect } from "react";
import {
  FlatList,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import IaPopup from "../components/IaPopup"; 

// Função auxiliar para pegar as iniciais do nome
function getUserInitials(name) {
  if (!name) return "IA"; 
  const names = name.trim().split(" ");
  if (names.length === 1) return names[0][0].toUpperCase();
  return (names[0][0] + names[names.length - 1][0]).toUpperCase();
}

// --- MOCKS ATUALIZADOS ---

const MOCK_DESTAQUE = [
  {
    id: 1,
    logo: require("../assets/images/chatgptlogo.png"), 
    title: "ChatGPT",
    subtitle: "OpenAI",
    category: "Texto",
    tags: ["Grátis", "Premium"],
    descricao: "O ChatGPT é uma IA conversacional avançada desenvolvida pela OpenAI que pode ajudar em uma ampla variedade de tarefas.",
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
    descricao: "O seu par programador com IA. Sugere linhas inteiras de código e funções completas em tempo real.",
    principaisUsos: ["Código", "Debug", "Refatoração"],
    precos: "Pago (Grátis para estudantes)",
    url: "https://github.com/copilot",
  },
  // GEMINI
  {
    id: 3,
    logo: require("../assets/images/geminilogo.png"), // Placeholder enquanto não tem a logo
    title: "Gemini",
    subtitle: "Google",
    category: "Multimodal",
    tags: ["Grátis", "Avançada"],
    descricao: "A IA mais capaz do Google. Construída desde o início para ser multimodal, raciocinando nativamente sobre texto, imagens, vídeo, áudio e código.",
    principaisUsos: ["Pesquisa", "Texto", "Integração Google"],
    precos: "Gratuito / Advanced no Google One",
    url: "https://gemini.google.com",
  },
  // MIDJOURNEY
  {
    id: 4,
    logo: require("../assets/images/midjourneylogo.png"), // Placeholder
    title: "Midjourney",
    subtitle: "Midjourney Inc.",
    category: "Imagem",
    tags: ["Premium"],
    descricao: "Gerador de arte via IA conhecido por criar imagens hiper-realistas, artísticas e criativas a partir de descrições textuais.",
    principaisUsos: ["Arte Digital", "Design", "Conceitos"],
    precos: "Assinatura mensal (a partir de $10)",
    url: "https://www.midjourney.com",
  },
];

const MOCK_CATEGORIAS = [
  { id: "texto", title: "Texto", count: 4 },
  { id: "imagem", title: "Imagem", count: 3 }, // Atualizado
  { id: "codigo", title: "Código", count: 2 },
  { id: "produtividade", title: "Produtividade", count: 2 },
];

const MOCK_RECENTES = [
  {
    id: 101,
    logo: require("../assets/images/claudelogo.png"),
    title: "Claude 3",
    subtitle: "Anthropic",
    descricao:
      "Claude é uma IA focada em segurança e ética, com uma enorme janela de contexto para analisar grandes documentos.",
    principaisUsos: ["Texto", "Análise de Arquivos", "Resumos"],
    precos: "Gratuito com limitações / Pro pago.",
    url: "https://claude.ai",
  },
  // NANO BANANA (Agora sério 🍌)
  {
    id: 103,
    logo: require("../assets/images/nanobananalogo.jpg"), // Placeholder
    title: "Nano Banana",
    subtitle: "Google",
    category: "Imagem",
    tags: ["Grátis", "Beta"],
    descricao:
      "A inovadora IA de geração de imagens do Google. Capaz de criar visuais detalhados e criativos com alta fidelidade a partir de prompts textuais simples.",
    principaisUsos: ["Geração de Imagens", "Design Gráfico", "Prototipagem"],
    precos: "Gratuito durante o período Beta.",
    url: "https://google.com", // Ajuste para a URL real quando tiver
  },
  // CLICKUP BRAIN
  {
    id: 102,
    logo: require("../assets/images/clickuplogo.png"), // Placeholder
    title: "ClickUp Brain",
    subtitle: "ClickUp",
    descricao:
      "A primeira rede neural que conecta suas tarefas, documentos, pessoas e todo o conhecimento da sua empresa com IA.",
    principaisUsos: ["Gestão de Projetos", "Resumos", "Automação"],
    precos: "Add-on pago por usuário/mês.",
    url: "https://clickup.com/ai",
  },
];

// Todas as categorias para o modal "ver mais"
const todasCategorias = ["Texto", "Imagem", "Código", "Produtividade", "Vídeo", "Áudio", "3D"];

const menuOptions = [
  { label: "Início", iconName: "home-outline", link: "/inicio" },
  { label: "Descobrir", iconName: "search-outline", link: "/descobrir" },
  { label: "Tutoriais", iconName: "book-outline", link: "/tutorial" },
  { label: "Perfil", iconName: "person-outline", link: "/perfil" },
];

export default function Inicio() {
  const router = useRouter();
  const params = useLocalSearchParams(); 

  // Estado inicial padrão
  const [user, setUser] = useState({ nome: "Visitante" });

  // 2. Efeito inteligente de persistência
  useEffect(() => {
    const loadUser = async () => {
      try {
        // CENÁRIO A: Veio dados da navegação (Login)
        if (params.usuario) {
          console.log("Recebido via Navegação:", params.usuario);
          
          const usuarioParsed = typeof params.usuario === 'string' 
            ? JSON.parse(params.usuario) 
            : params.usuario;
          
          setUser(usuarioParsed);
          // Salva na memória local pra não perder no F5
          await AsyncStorage.setItem('user_session', JSON.stringify(usuarioParsed));
        } 
        // CENÁRIO B: Não veio nada (Deu F5 ou abriu direto), tenta recuperar da memória
        else {
          const savedUser = await AsyncStorage.getItem('user_session');
          if (savedUser) {
            console.log("Recuperado do Cache:", savedUser);
            setUser(JSON.parse(savedUser));
          }
        }
      } catch (e) {
        console.log("Erro na persistência do usuário:", e);
      }
    };

    loadUser();
  }, [params.usuario]);

  // Estados da tela
  const [destaque, setDestaque] = useState(MOCK_DESTAQUE);
  const [categorias, setCategorias] = useState(MOCK_CATEGORIAS);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalCategoriaVisible, setModalCategoriaVisible] = useState(false); 
  const [recentes, setRecentes] = useState(MOCK_RECENTES);

  const [iaPopupVisible, setIaPopupVisible] = useState(false);
  const [iaSelecionada, setIaSelecionada] = useState(null);
  const [iaPopupLoading, setIaPopupLoading] = useState(false);

  const [menuIndex, setMenuIndex] = useState(0);

  // Função unificada para abrir o popup
  const openIaPopup = (item) => {
    setIaSelecionada({
      logo: item.logo,
      title: item.title,
      // Fallback inteligente se faltar dados no mock
      subtitle: item.subtitle || item.category,
      descricao: item.descricao || "Sem descrição disponível no momento.",
      principaisUsos: item.principaisUsos || [item.category],
      precos: item.precos || "Consulte o site.",
      url: item.url,
    });
    setIaPopupLoading(false);
    setIaPopupVisible(true);
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Saudação e avatar DINÂMICOS */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Olá, {user.nome || user.name || "Visitante"}!</Text>
            <Text style={styles.subtitle}>
              Que tipo de IA você está procurando hoje?
            </Text>
          </View>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {getUserInitials(user.nome || user.name || "Visitante")}
            </Text>
          </View>
        </View>

        {/* Campo de busca */}
        <TouchableOpacity
          onPress={() => router.push("/descobrir")}
          activeOpacity={0.7}
        >
          <View style={styles.searchInput} pointerEvents="none">
            <Text style={styles.searchPlaceholder}>🔍 Buscar por IAS...</Text>
          </View>
        </TouchableOpacity>

        {/* IAs em Destaque */}
        <Text style={styles.sectionTitle}>IAs em Destaque</Text>
        <FlatList
          horizontal
          data={destaque}
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.destaqueRow}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.iaCard}
              onPress={() => openIaPopup(item)}
            >
              <Image
                source={item.logo}
                style={styles.iaLogoGrande}
                resizeMode="contain"
              />
              <Text style={styles.iaTitleBlue}>{item.title}</Text>
              <Text style={styles.iaCategory}>{item.category}</Text>
              <View style={styles.ratingRow}>
                {item.tags.map((tag) => (
                  <View
                    key={tag}
                    style={[styles.planBadge, styles.planBadgeBlue]}
                  >
                    <Text
                      style={[styles.planBadgeText, styles.planBadgeTextBlue]}
                    >
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          )}
        />

        {/* Categorias */}
        <Text style={styles.sectionTitle}>Categorias</Text>
        <View style={styles.categoriasSection}>
          <View style={styles.categoriasRow}>
            {categorias.slice(0, 2).map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.categoriaCard}
                onPress={() => {
                  router.push({
                    pathname: "/descobrir",
                    params: { category: item.title }, 
                  });
                }}
              >
                <Text style={styles.categoriaTitle}>{item.title}</Text>
                <Text style={styles.categoriaCount}>
                  {item.count} IA{item.count > 1 ? "s" : ""}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.verMaisRow}>
            <TouchableOpacity onPress={() => setModalCategoriaVisible(true)}>
              <Text style={styles.verMais}>Ver mais</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* RECENTES */}
        <View style={styles.recentesContainer}>
          <Text style={styles.sectionTitle}>Adicionadas Recentemente</Text>

          {/* Renderizando a lista de recentes dinamicamente */}
          {recentes.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.recenteCard}
              activeOpacity={0.7}
              onPress={() => openIaPopup(item)}
            >
              <Image
                source={item.logo}
                style={styles.recenteLogo}
                resizeMode="contain"
              />
              <View style={styles.recenteInfo}>
                <Text style={styles.recenteTitle}>{item.title}</Text>
                <Text style={styles.recenteSubtitle}>
                  {item.subtitle}
                </Text>
                <View style={styles.recenteTagsRow}>
                  {item.principaisUsos.slice(0, 2).map((tag) => (
                    <View key={tag} style={[styles.recenteTag, styles.recenteTagTexto]}>
                      <Text style={styles.recenteTagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* IA PopUp */}
      <IaPopup
        visible={iaPopupVisible}
        iaInfo={iaSelecionada}
        loading={iaPopupLoading}
        onClose={() => setIaPopupVisible(false)}
      />

      {/* MODAL DE CATEGORIAS */}
      <Modal
        visible={modalCategoriaVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalCategoriaVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalCategoriaVisible(false)}
            >
              <Text style={{ fontSize: 18 }}>✕</Text>
            </TouchableOpacity>
            {todasCategorias.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={styles.modalButton}
                onPress={() => {
                  setModalCategoriaVisible(false);
                  router.push({
                    pathname: "/descobrir",
                    params: { category: cat }, 
                  });
                }}
              >
                <Text style={styles.modalButtonText}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* MENU INFERIOR FIXO ATUALIZADO */}
      <View style={styles.menuBar}>
        {menuOptions.map((item, idx) => (
          <TouchableOpacity
            key={item.label}
            style={styles.menuItem}
            onPress={() => {
              setMenuIndex(idx);
              router.push(item.link);
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={item.iconName}
              size={24}
              color={menuIndex === idx ? "#29B6F6" : "#343434"} 
              style={{ marginBottom: 2 }}
            />
            <Text
              style={[
                styles.menuLabel,
                menuIndex === idx && styles.menuLabelActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ====================== ESTILOS ======================
const styles = {
  mainContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    paddingTop: 24,
    marginBottom: 68, 
  },
  contentContainer: {
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#222",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
  },
  avatarCircle: {
    backgroundColor: "#0F2C5C",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 14,
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  searchInput: {
    backgroundColor: "#f3f6fa",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#ebebeb",
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 12,
  },
  categoriasSection: {
    marginBottom: 28,
  },
  categoriasRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: "14px",
  },
  verMaisRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 5,
  },
  categoriaCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#e3e3e3",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    minWidth: 120,
    minHeight: 80,
  },
  categoriaTitle: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 2,
    textAlign: "center",
  },
  categoriaCount: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  verMais: {
    color: "#23b2fa",
    fontSize: 17,
    fontWeight: "500",
    textDecorationLine: "underline",
    paddingRight: 6,
  },
  destaqueRow: {
    flexDirection: "row",
    marginBottom: 24,
    paddingRight: 10,
    gap: "14px",
  },
  iaCard: {
    width: 200,
    backgroundColor: "#fff",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#e3e3e3",
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
    minWidth: 130,
  },
  iaLogoGrande: {
    width: 44,
    height: 44,
    marginBottom: 8,
  },
  iaTitleBlue: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#0F2C5C",
    marginBottom: 4,
    textAlign: "center",
  },
  iaCategory: {
    fontSize: 15,
    color: "#888",
    marginBottom: 6,
    textAlign: "center",
  },
  ratingRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 4,
  },
  planBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginHorizontal: 2,
    marginBottom: 3,
  },
  planBadgeBlue: {
    backgroundColor: "#e8f0fe",
  },
  planBadgeText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#2460ef",
  },
  planBadgeTextBlue: {
    color: "#2460ef",
  },
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
  menuItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  // menuIcon foi removido pois agora usamos o componente Ionicons direto
  menuLabel: {
    fontSize: 13,
    color: "#343434",
    marginTop: 2,
  },
  menuLabelActive: {
    color: "#0F2C5C",
    fontWeight: "bold",
  },
  recentesContainer: {
    marginBottom: 24,
  },
  recenteCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#e3e3e3",
    padding: 18,
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  recenteLogo: {
    width: 46,
    height: 46,
    marginRight: 14,
  },
  recenteInfo: {
    flex: 1,
    justifyContent: "center",
  },
  recenteTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#222",
  },
  recenteSubtitle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
  },
  recenteTagsRow: {
    flexDirection: "row",
    marginTop: 2,
  },
  recenteTag: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 11,
    marginRight: 6,
  },
  recenteTagTexto: {
    backgroundColor: "#1a237e",
  },
  recenteTagFreemium: {
    backgroundColor: "#40bff5",
  },
  recenteTagText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: 250,
    padding: 18,
    alignItems: "stretch",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    right: 11,
    top: 7,
    zIndex: 2,
    padding: 5,
  },
  modalButton: {
    backgroundColor: "#F7F7F7",
    paddingVertical: 13,
    marginVertical: 7,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e3e3e3",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
  },
  searchInput: {
    backgroundColor: "#f3f6fa",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#ebebeb",
    justifyContent: "center",
  },
  searchPlaceholder: {
    fontSize: 14,
    color: "#999",
  },
    menuLabelActive: {
    color: "#29B6F6",
    fontWeight: "bold",
  },
};