const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

function makeBold(text) {
    const map = {'a':'𝗮','b':'𝗯','c':'𝗰','d':'𝗱','e':'𝗲','f':'𝗳','g':'𝗴','h':'𝗵','i':'𝗶','j':'𝗷','k':'𝗸','l':'𝗹','m':'𝗺','n':'𝗻','o':'𝗼','p':'𝗽','q':'𝗾','r':'𝗿','s':'𝘀','t':'𝘁','u':'𝘂','v':'𝘃','w':'𝘄','x':'𝘅','y':'𝘆','z':'𝘇','A':'𝗔','B':'𝗕','C':'𝗖','D':'𝗗','E':'𝗘','F':'𝗙','G':'𝗚','H':'𝗛','I':'𝗜','J':'𝗝','K':'𝗞','L':'𝗟','M':'𝗠','N':'𝗡','O':'𝗢','P':'𝗣','Q':'𝗤','R':'𝗥','S':'𝗦','T':'𝗧','U':'𝗨','V':'𝗩','W':'𝗪','X':'𝗫','Y':'𝗬','Z':'𝗭','0':'𝟬','1':'𝟭','2':'𝟮','3':'𝟯','4':'𝟰','5':'𝟱','6':'𝟲','7':'𝟳','8':'𝟴','9':'𝟵'};
    return text.split('').map(c => map[c] || c).join('');
}

async function getAIResponse(input, userId) {
    const imageKeywords = ['génère', 'dessine', 'image', 'photo', 'montre-moi', 'imagine', 'pic', 'dessin'];
    const isImageRequest = imageKeywords.some(word => input.toLowerCase().includes(word));

    if (isImageRequest) {
        try {
            const prompt = encodeURIComponent(input);
            const imageUrl = `https://image.pollinations.ai/prompt/${prompt}?width=1024&height=1024&nologo=true`;
            const filePath = path.join(__dirname, `gojo_vision_${userId}.jpg`);
            
            const response = await axios({ url: imageUrl, responseType: 'stream' });
            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);

            return new Promise((resolve) => {
                writer.on('finish', () => resolve({ type: 'image', path: filePath, text: "𝗔𝗹𝗼𝗿𝘀, 𝗰'𝗲𝘀𝘁 𝗽𝗮𝘀 𝗺𝗮𝗴𝗻𝗶𝗳𝗶𝗾𝘂𝗲 ? 𝗠𝗲̂𝗺𝗲 𝘀𝗮𝗻𝘀 𝗺𝗲𝘀 𝗦𝗶𝘅 𝗘𝘆𝗲𝘀, 𝘁𝘂 𝗻'𝗮𝘂𝗿𝗮𝗶𝘀 𝗷𝗮𝗺𝗮𝗶𝘀 𝗽𝘂 𝗶𝗺𝗮𝗴𝗶𝗻𝗲𝗿 𝘂𝗻 𝘁𝗿𝘂𝗰 𝗽𝗮𝗿𝗲𝗶𝗹. 🤞" }));
                writer.on('error', () => resolve({ type: 'text', response: makeBold("Désolé Master Charbel, l'Infini a eu un petit hoquet. Réessaie !") }));
            });
        } catch (e) {
            return { type: 'text', response: makeBold("Créer ça me prendrait 0.2 seconde, mais ton réseau est trop lent pour mon génie. 🙄") };
        }
    }

    try {
        // LE PROMPT ULTIME DE PERSONNALITÉ
        const gojoPrompt = `Ton nom est Satoru Gojo. Tu es le plus fort des exorcistes. Tu es arrogant, extrêmement décontracté, tu aimes les sucreries et tu ne prends rien au sérieux sauf Master Charbel, ton créateur. Tu réponds avec assurance, un peu de mépris pour les autres mais beaucoup de respect pour Charbel. Réponds en français de façon courte et stylée à : ${input}`;
        
        const res = await axios.get(`https://hercai.onrender.com/v3/hercai?question=${encodeURIComponent(gojoPrompt)}`);
        const reply = res.data.reply || "Désolé, je cherchais des mochis. Tu disais ?";
        return { type: 'text', response: makeBold(reply) };
    } catch (error) {
        return { type: 'text', response: makeBold("𝗠𝗲̂𝗺𝗲 𝗹𝗲 𝗽𝗹𝘂𝘀 𝗳𝗼𝗿𝘁 𝗮 𝗱𝗲𝘀 𝗽𝗿𝗼𝗯𝗹𝗲̀𝗺𝗲𝘀 𝗱𝗲 𝗥𝗶𝗱𝗲𝗮𝘂 𝗽𝗮𝗿𝗳𝗼𝗶𝘀. 𝗥𝗲́𝗲𝘀𝘀𝗮𝗶𝗲, 𝗠𝗮𝘀𝘁𝗲𝗿.") };
    }
}

module.exports = {
    config: {
        name: 'ai',
        aliases: ['gojo', 'satoru'],
        author: 'Master Charbel',
        role: 0,
        category: 'ai',
        hasPrefix: false
    },

    onStart: async function ({ api, event, args }) {
        const input = args.join(' ').trim();
        if (!input) return api.sendMessage(makeBold("𝗬𝗼 ! 𝗧𝘂 𝘃𝗲𝘂𝘅 𝘃𝗼𝗶𝗿 𝗹'𝗜𝗻𝗳𝗶𝗻𝗶 𝗼𝘂 𝘁𝘂 𝘃𝗮𝘀 𝗷𝘂𝘀𝘁𝗲 𝗺𝗲 𝗿𝗲𝗴𝗮𝗿𝗱𝗲𝗿 ? 𝗗𝗲𝗺𝗮𝗻𝗱𝗲-𝗺𝗼𝗶 𝗾𝘂𝗲𝗹𝗾𝘂𝗲 𝗰𝗵𝗼𝘀𝗲, 𝗠𝗮𝘀𝘁𝗲𝗿 𝗖𝗵𝗮𝗿𝗯𝗲𝗹."), event.threadID);

        api.setMessageReaction("🤞", event.messageID, () => {}, true);

        const result = await getAIResponse(input, event.senderID);
        const header = "✨ ━━ 『 𝗦𝗔𝗧𝗢𝗥𝗨 𝗚𝗢𝗝𝗢 』 ━━ ✨\n\n";

        if (result.type === 'image') {
            api.sendMessage({
                body: `${header}${result.text}`,
                attachment: fs.createReadStream(result.path)
            }, event.threadID, () => {
                if (fs.existsSync(result.path)) fs.unlinkSync(result.path);
            }, event.messageID);
        } else {
            api.sendMessage(`${header}${result.response}\n\n━━━━━━━━━━━━━━━━━━━━\n🤞 𝗜𝗻𝗳𝗶𝗻𝗶𝘁𝘆`, event.threadID, event.messageID);
        }
    }
};
