 const axios = require('axios');

// --- Configuration des services API (Priorité haute à basse) ---
async function fetchFromAI(url, params) {
  try {
    // Timeout élevé pour les proxies
    const response = await axios.get(url, { params, timeout: 60000 }); 
    return response.data;
  } catch (error) {
    console.error("Erreur de connexion à l'API:", error.message);
    return null;
  }
}

async function getAIResponse(input, userName, messageID) {
  const services = [
    // 1. API Gemini Proxy (Priorité Haute)
    { url: 'https://arychauhann.onrender.com/api/gemini-proxy2', params: { prompt: input } },
    // 2. API Hercai (Fallback)
    { url: 'https://ai-chat-gpt-4-lite.onrender.com/api/hercai', params: { question: input } }
  ];

  // Message de bienvenue par défaut
  let response = `⧠ 𝑺𝑎𝒍𝒖𝒕 ☞︎︎︎${userName}☜︎︎︎ ! 𝑰𝒍 𝒔𝑒𝒎𝒃𝒍𝑒 𝒒𝒖𝑒 𝒋𝑒 𝒏'𝒂𝒊 𝒑𝒂𝒔 𝒓é𝒖𝒔𝒔𝒊 𝒂̀ 𝒄𝒐𝒏𝒕𝒂𝒄𝒕𝒆𝒓 𝒍𝒆𝒔 𝒔𝒆𝒓𝒗𝒆𝒖𝒓𝒔 𝒅'𝑰𝑨. 𝑽𝒆𝒖𝒊𝒍𝒍𝒆𝒛 𝒓é𝒆𝒔𝒔𝒂𝒚𝒆𝒓 𝒑𝒍𝒖𝒔 𝒕𝒂𝒓𝒅.`;
  let currentIndex = 0;

  for (let i = 0; i < services.length; i++) {
    const service = services[currentIndex];
    const data = await fetchFromAI(service.url, service.params);
    
    if (data) {
        // Vérifie les formats de réponse courants (result pour Gemini-proxy, reply/gpt4/response pour Hercai/autres)
        const apiReply = data.result || data.reply || data.gpt4 || data.response; 
        
        if (apiReply && typeof apiReply === 'string' && apiReply.trim().length > 0) {
            response = apiReply;
            break; 
        }
    }
    currentIndex = (currentIndex + 1) % services.length;
  }

  return { response, messageID };
}

// --- Configuration du Module ---
module.exports = {
  config: {
    name: 'ai', // Nom principal
    aliases: ['aesther', 'ae', 'jokers'],
    author: 'Samycharles (Modifié par Gemini)',
    role: 0,
    category: 'ai',
    shortDescription: 'Parlez à l\'IA sans utiliser de prefixe.',
    guide: { en: "Tapez simplement ai <votre question>" }
  },
  
  // --- onStart (Utilisation avec préfixe: !ai question) ---
  onStart: async function ({ api, event, args }) {
    const input = args.join(' ').trim();
    if (!input) {
      api.sendMessage("⧠ 𝑺𝑎𝒍𝒖𝒕 ! 𝑷𝒐𝒔𝑒 𝒎𝒐𝒊 𝒖𝒏𝑒 𝒒𝒖𝑒𝒔𝒕𝒊𝒐𝒏.", event.threadID, event.messageID);
      return;
    }

    api.getUserInfo(event.senderID, async (err, ret) => {
      if (err) return console.error(err);
      const userName = ret[event.senderID].name;
      
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const { response, messageID } = await getAIResponse(input, userName, event.messageID);
      
      api.sendMessage(`❮⧠❯━━━━━━━━━━❮◆❯\n❮◆❯━━━━━━━━━━❮⧠❯\nSalut ${userName} 🤩 :\n\n${response}\n\n╰┈┈┈➤⊹⊱✰✫✫✰⊰⊹`, event.threadID, messageID, (err) => {
           if (!err) {
               api.setMessageReaction("✅", event.messageID, () => {}, true);
           } else {
               api.setMessageReaction("❌", event.messageID, () => {}, true);
           }
      });
    });
  },
  
  // --- onChat (Utilisation sans préfixe: ai question) ---
  onChat: async function ({ api, event, message }) {
    const messageContent = event.body.trim();
    
    // Regex pour vérifier si le message commence par un alias (ai, aesther, ae, jokers)
    // et capture la question.
    const match = messageContent.match(/^(ai|aesther|ae|jokers)\s+(.*)/i);
    
    // Si ça ne commence pas par un mot-clé ou s'il n'y a pas de question après, on ignore.
    if (!match) return; 
    
    const input = match[2].trim(); 
    if (!input) return;

    api.getUserInfo(event.senderID, async (err, ret) => {
      if (err) return console.error(err);
      const userName = ret[event.senderID].name;
      
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const { response } = await getAIResponse(input, userName, event.messageID);
      
      // Répond au message
      message.reply(`❮⧠❯━━━━━━━━━━❮◆❯\n❮◆❯━━━━━━━━━━❮⧠❯\nSalut ${userName} 🤩 :\n\n${response}\n\n❮⧠❯━━━━━━━━━━❮◆❯\n❮◆❯━━━━━━━━━━❮⧠❯`, (err) => {
           if (!err) {
               api.setMessageReaction("✅", event.messageID, () => {}, true);
           } else {
               api.setMessageReaction("❌", event.messageID, () => {}, true);
           }
      });
    });
  }
};
