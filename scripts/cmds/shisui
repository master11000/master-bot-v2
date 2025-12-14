const axios = require('axios');

async function fetchFromAI(url, params) {
  try {
    // Augmentation du timeout pour plus de fiabilité sur les proxies
    const response = await axios.get(url, { params, timeout: 60000 }); 
    return response.data;
  } catch (error) {
    console.error("Erreur de connexion à l'API:", error.message);
    return null;
  }
}

async function getAIResponse(input, userName, messageID) {
  const services = [
    // API Gemini Proxy (Prioritaire)
    { url: 'https://arychauhann.onrender.com/api/gemini-proxy2', params: { prompt: input } },
    // API Hercai (Fallback)
    { url: 'https://ai-chat-gpt-4-lite.onrender.com/api/hercai', params: { question: input } }
  ];

  let response = `⧠ 𝑺𝑎𝒍𝒖𝒕 ☞︎︎︎${userName}☜︎︎︎ ! 𝑰𝒍 𝒔𝑒𝒎𝒃𝒍𝑒 𝒒𝒖𝑒 𝒋𝑒 𝒏'𝒂𝒊 𝒑𝒂𝒔 𝒓é𝒖𝒔𝒔𝒊 𝒂̀ 𝒄𝒐𝒏𝒕𝒂𝒄𝒕𝒆𝒓 𝒍𝒆𝒔 𝒔𝒆𝒓𝒗𝒆𝒖𝒓𝒔 𝒅'𝑰𝑨. 𝑽𝒆𝒖𝒊𝒍𝒍𝒆𝒛 𝒓é𝒆𝒔𝒔𝒂𝒚𝒆𝒓 𝒑𝒍𝒖𝒔 𝒕𝒂𝒓𝒅.`;
  let currentIndex = 0;

  for (let i = 0; i < services.length; i++) {
    const service = services[currentIndex];
    const data = await fetchFromAI(service.url, service.params);
    
    if (data) {
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

module.exports = {
  config: {
    name: 'shisui',
    aliases: ['ai'], // Assurez-vous d'avoir l'alias 'ai' si vous voulez qu'il réponde à 'ai'
    author: 'Le vide',
    role: 0,
    category: 'ai',
    shortDescription: 'ai to ask anything',
    // Le guide est moins pertinent si on supprime le préfixe
  },
  
  // ⚠️ Fonction désactivée. onStart s'active uniquement avec le préfixe.
  onStart: null, 
  
  onChat: async function ({ api, event, message }) {
    const messageContent = event.body.trim();
    
    // 1. Définir les mots-clés de déclenchement (sans préfixe)
    // Ici: 'shisui' et 'ai'
    const keywords = ['shisui', 'ai'];
    
    // 2. Utiliser une RegEx pour trouver si le message commence par un des mots-clés + un espace
    const keywordsRegex = new RegExp(`^(${keywords.join('|')})\\s+(.*)`, 'i');
    const match = messageContent.match(keywordsRegex);
    
    // S'il n'y a pas de correspondance (pas de mot-clé au début)
    if (!match) return; 

    // 3. Extraire la question (match[2] capture le reste du message)
    const input = match[2].trim();
    
    // Si la question est vide après le mot-clé (ex: juste "ai" ou "shisui"), on ignore.
    if (!input) {
         // Optionnel: Répondre avec le message d'aide si l'input est vide
         const initialResponse = `⧠ 𝑺𝑎𝒍𝒖𝒕 ! 𝑷𝒐𝒔𝑒 𝒎𝒐𝒊 𝒖𝒏𝑒 𝒒𝒖𝑒𝒔𝒕𝒊𝒐𝒏.`;
         api.sendMessage(initialResponse, event.threadID, event.messageID);
         return;
    }

    api.getUserInfo(event.senderID, async (err, ret) => {
      if (err) return console.error(err);
      const userName = ret[event.senderID].name;
      
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const { response } = await getAIResponse(input, userName, event.messageID);
      
      // Réponse finale sans préfixe
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

