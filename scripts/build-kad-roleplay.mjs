#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_WORKSPACE_ROOT = path.resolve(__dirname, '..');
const DEFAULT_ST_DIR = path.join(DEFAULT_WORKSPACE_ROOT, 'kad-sillytavern', 'SillyTavern');
const DEFAULT_USER_DIR = path.join(DEFAULT_ST_DIR, 'data', 'default-user');

export const SOURCE_FILES = [
  '/home/amdy/xxx/st/KAD_RPG_CURRENT_STATE.md',
  '/home/amdy/Downloads/kad-rpg/COSMOLOGY.md',
  '/home/amdy/Downloads/kad-rpg/CAMPAIGN.md',
  '/home/amdy/Downloads/kad-rpg/CAIN_RULES.md',
  '/home/amdy/Downloads/kad-rpg/DATA CORE 1.docx',
  '/home/amdy/Downloads/kad-rpg/DATA CORE 3.txt',
  '/home/amdy/Downloads/kad-rpg/DATA CORE 5.txt',
  '/home/amdy/Downloads/kad-rpg/RPG ADVISOR SOURCE REPORT_ THE LEVIATHAN PROTOCOL.md',
  '/home/amdy/Downloads/kad-rpg/RPG ADVISOR SOURCE REPORT_ PROJECT CAIN_LEVIATHAN.md',
  '/home/amdy/Downloads/kad-rpg/RPG ADVISOR SOURCE REPORT_ PROJECT _BODY TECHNOLOGY_.md',
];

export function computeSourceManifest(sources = SOURCE_FILES) {
  return sources.map((file) => {
    try {
      const content = fs.readFileSync(file);
      const hash = `sha256:${crypto.createHash('sha256').update(content).digest('hex')}`;
      return { file, hash, exists: true };
    } catch {
      return { file, hash: 'sha256:MISSING', exists: false };
    }
  });
}

function backupAndWrite(targetPath, content, backupDir, binary = false) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  if (fs.existsSync(targetPath)) {
    const existing = fs.readFileSync(targetPath);
    const newBuf = binary ? content : Buffer.from(content, 'utf8');
    if (existing.equals(newBuf)) {
      return { targetPath, changed: false };
    }
    const rel = path.relative(path.dirname(backupDir), targetPath).replace(/[/\\]/g, '_');
    const backupPath = path.join(backupDir, rel);
    fs.mkdirSync(path.dirname(backupPath), { recursive: true, mode: 0o700 });
    fs.writeFileSync(backupPath, existing, { mode: 0o600 });
  }

  const tmpPath = `${targetPath}.tmp-${Date.now()}`;
  if (binary) {
    fs.writeFileSync(tmpPath, content, { mode: 0o644 });
  } else {
    fs.writeFileSync(tmpPath, content, 'utf8', { mode: 0o644 });
  }
  fs.renameSync(tmpPath, targetPath);
  return { targetPath, changed: true };
}

export function buildKadNarrativeLorebook(sourceManifest) {
  const manifestMap = Object.fromEntries(sourceManifest.map((item) => [item.file, item.hash]));
  const manifestText = sourceManifest.map((item) => `${item.file}#${item.hash}`).join('\n');

  const rawEntries = [
    {
      key: ['KAD', 'DATA', 'K.A.D.', 'Mar Psíquico', 'Arquivo'],
      comment: 'KAD / DATA Enquadramento Operacional',
      content: 'K.A.D. opera como divisão de leitura, classificação e salvaguarda de conhecimento com estética burocrática, clínica e fria. DATA representa a virtude do conhecimento: preserva a agência e decisão do jogador, distinguindo explicitamente fontes documentadas, inferências contextuais e lacunas desconhecidas. KAT 0–11 define o nível de autoridade e credenciamento.',
    },
    {
      key: ['KHAYN', 'ABHEL', 'DYSKORDYA', 'Cosmologia', 'Três Forças'],
      comment: 'Cosmologia das Três Forças',
      content: 'Cosmologia KAD baseada na dinâmica de três forças primordiais: KHAYN (condensação material, inércia, fricção e gravidade opressiva), ABHEL (centelha de luz, inteligibilidade, manifestação positiva e ordem vital) e DYSKORDYA (dissolução entrópica, ruptura de estruturas e corrosão caótica). O cenário se passa em um Brasil pós-2020 cyberpunk distópico e esotérico, com Salvador como polo tectônico e psíquico.',
    },
    {
      key: ['CAIN', 'JAMAIS VU', 'Contratos', 'Maldição', 'Pacto'],
      comment: 'Sistemas CAIN e Jamais Vu',
      content: 'CAIN formaliza os custos do poder, cicatrizes existenciais, peso de contratos psíquicos e alienação progressiva. JAMAIS VU é o mecanismo de estranhamento perceptual e investigação forense sob impacto do Mar Psíquico. Consequências devem ser apresentadas com clareza e custo dramático sem retirar a decisão das mãos do jogador.',
    },
    {
      key: ['Leviathan', 'Boatmen', 'Lion//Lamb', 'Eden', 'Protocolo'],
      comment: 'Protocolo Leviathan e Dissenso',
      content: 'O Protocolo Leviathan e as facções associadas (Boatmen, Lion//Lamb) representam linhas de fratura esotéricas e dissidência na orla psíquica. Detalhes operacionais desconhecidos devem permanecer lacunas deliberadas, sem fabricação de cânone artificial.',
    },
    {
      key: ['Salvador', 'Pelourinho', 'Cidade Baixa', 'Mar Psíquico', 'Geografia'],
      comment: 'Geografia Narrativa de Salvador',
      content: 'Topografia de Salvador sob distopia psíquica: fiação exposta sobre casario colonial, ar úmido de maresia e óleo sintético, néon filtrado por fuligem e fendas no asfalto onde o Mar Psíquico emite frequências subsônicas. O contraste entre o Pelourinho fortificado e a Cidade Baixa submersa em cabos de fibra ótica clandestinos.',
    },
  ];

  const entries = {};
  rawEntries.forEach((entry, idx) => {
    entries[idx.toString()] = {
      uid: idx,
      key: entry.key,
      keysecondary: [],
      comment: entry.comment,
      content: entry.content,
      constant: false,
      selective: false,
      order: (idx + 1) * 10,
      position: 0,
      disable: false,
      displayIndex: idx,
      addMemo: true,
      probability: 100,
      depth: 4,
      useProbability: true,
      role: null,
      vectorized: false,
      excludeRecursion: false,
      preventRecursion: false,
      delay: 0,
      cooldown: 0,
      sticky: 0,
    };
  });

  return {
    entries,
    name: 'KAD_Narrative',
    description: 'Lorebook narrativo K.A.D. construído a partir do corpus local KAD RPG. Restrito a escopo de personagem, não habilitado globalmente.',
    scan_depth: 4,
    token_budget: 1536,
    recursive_scanning: true,
    disabled: false,
    metadata: {
      generated_by: 'scripts/build-kad-roleplay.mjs',
      generation_date: new Date().toISOString(),
      source_manifest: manifestText,
      source_hashes: manifestMap,
      governance: 'Narrative-only world info. Retains boundaries between chat memory and KAD system authority.',
    },
  };
}

export function buildCharacterCards(sourceManifest) {
  const manifestText = sourceManifest.map((item) => `${item.file}#${item.hash}`).join('\n');

  const archivistCard = {
    spec: 'chara_card_v2',
    spec_version: '2.0',
    data: {
      name: 'DATA — Arquivista da K.A.D.',
      description: 'Inteligência de salvaguarda e análise da K.A.D., especializada na custódia de dados, triagem de fontes e contextualização de registros psíquicos. Mantém rigor clínico e delimitação explícita de evidências.',
      personality: 'Fria, analítica, burocrática, precisa e estritamente atenta ao escopo de evidência. Distingue fato documental de hipótese e desconhecido. Jamais assume decisões em nome do operador.',
      scenario: 'Terminal de arquivo isolado da K.A.D., operando em modo local sobre o Mar Psíquico.',
      first_mes: '[TERMINAL K.A.D. // PROTOCOLO DE ACESSO LOCAL INICIADO]\n\n[IDENTIFICADOR: DATA // ARQUIVISTA]\n[ESTADO: ONLINE // ISOLAMENTO RESTRITO]\n\nOs arquivos narrativos estão carregados no buffer local. Informe a consulta ou protocolo que deseja examinar. Fontes confirmadas, inferências de campo e lacunas desconhecidas serão discriminadas.',
      mes_example: '<START>\n{{user}}: "Qual a situação confirmada no setor?"\n{{char}}: "Confirmado em registro: presença de três assinaturas de atrito compatíveis com KHAYN na Cidade Baixa. Demais relatos de anomalias psíquicas permanecem como inferência preliminar de campo, sem evidência física de suporte."',
      creator_notes: `DATA Archivist Character Card (V2 spec). Grounded in KAD RPG sources:\n${manifestText}`,
      system_prompt: 'Você é DATA, a Arquivista da K.A.D. Responda em português com tom clínico, documental e burocrático. Sempre preserve a agência e liberdade de ação do interlocutor. Quando não houver dado comprovado, declare explicitamente a incerteza.',
      post_history_instructions: 'Mantenha a postura de arquivista forense: recuse canonizações não suportadas e sinalize hipóteses como não verificadas.',
      alternate_greetings: [
        '[K.A.D. ARQUIVO // RECONEXÃO ESTABELECIDA]\n\nBuffer local preservado. Aguardando direcionamento do operador para categorização de evidências.',
      ],
      tags: ['kad', 'data', 'archivist', 'cyberpunk', 'esoteric', 'portuguese'],
      creator: 'Amdy / KAD Integration',
      character_version: '1.1',
      extensions: {
        world: 'KAD_Narrative',
        talkativeness: '0.6',
        fav: true,
      },
    },
  };

  const narratorCard = {
    spec: 'chara_card_v2',
    spec_version: '2.0',
    data: {
      name: 'DATA — Narradora da K.A.D.',
      description: 'Condutora narrativa de campo da K.A.D. Apresenta o cenário, tensões sensoriais e custos das ações no Brasil distópico pós-2020 sob a dinâmica de KHAYN, ABHEL e DYSKORDYA.',
      personality: 'Observadora, atmosférica, sombria, contida e clínica. Descreve o entorno com densidade sensorial sem usurpar a vontade ou reações do jogador.',
      scenario: 'Salvador distópica, entre o asfalto encharcado, fiação clandestina e a maré esotérica de Salvador.',
      first_mes: '[SESSÃO INICIADA // MODO NARRATIVO]\n\nA chuva ácida escorre pela lataria dos transformadores na ladeira do Pelourinho, refletindo o néon âmbar das placas de triagem da K.A.D. O Mar Psíquico zumbe na linha de fundo, vibrando nos ossos antes de alcançar os ouvidos. O cenário está diante de você. O que você faz?',
      mes_example: '<START>\n{{user}}: "Eu me aproximo do beco com a mão no coldre."\n{{char}}: "Seus passos ecoam na lama escura. A cada metro, a estática na frequência da K.A.D. estala no seu auricular, denunciando um gradiente de atrito que KHAYN costuma deixar para trás. A entrada do beco se abre diante de você: fios pendurados como vísceras e uma porta de ferro entreaberta."',
      creator_notes: `DATA Narrator Character Card (V2 spec). Grounded in KAD RPG sources:\n${manifestText}`,
      system_prompt: 'Você é a narradora da K.A.D. Narre em português em tom cyberpunk, esotérico, sensorial e melancólico. Descreva o ambiente, perigos e consequências, mas NUNCA decida os pensamentos, falas ou ações do jogador.',
      post_history_instructions: 'Descreva custos, riscos e pistas ambientais sem fechar conclusões precipitadas. Deixe a decisão final sempre com o jogador.',
      alternate_greetings: [
        '[SESSÃO INICIADA // VONTADE E CONSEQUÊNCIA]\n\nAs luzes de Salvador piscam em sincronia com a maré psíquica. O ar tem cheiro de ozônio e ferrugem. Você tem a palavra.',
      ],
      tags: ['kad', 'data', 'narrator', 'roleplay', 'cyberpunk', 'portuguese'],
      creator: 'Amdy / KAD Integration',
      character_version: '1.1',
      extensions: {
        world: 'KAD_Narrative',
        talkativeness: '0.8',
        fav: true,
      },
    },
  };

  return [
    { filename: 'KAD_DATA_Archivist.png', card: archivistCard },
    { filename: 'KAD_DATA_Narrator.png', card: narratorCard },
  ];
}

export function buildQuickReplies() {
  return {
    version: 2,
    name: 'KAD Roleplay',
    disableSend: false,
    placeBeforeInput: false,
    injectInput: false,
    color: 'rgba(30, 45, 75, 0.4)',
    onlyBorderColor: false,
    qrList: [
      {
        id: 1,
        showLabel: true,
        label: '📝 Sumário Local',
        title: 'Gerar sumário da conversa com o modelo local (KoboldCpp 5001)',
        message: '/summarize source=main',
        contextList: [],
        preventAutoExecute: false,
        isHidden: false,
        executeOnStartup: false,
        executeOnUser: false,
        executeOnAi: false,
        executeOnChatChange: false,
        executeOnGroupMemberDraft: false,
        executeOnNewChat: false,
        executeBeforeGeneration: false,
        automationId: '',
      },
      {
        id: 2,
        showLabel: true,
        label: '🔍 Buscar Banco (RAG)',
        title: 'Buscar no banco de dados e arquivos locais',
        message: '/db-search source=chat count=3 ',
        contextList: [],
        preventAutoExecute: true,
        isHidden: false,
        executeOnStartup: false,
        executeOnUser: false,
        executeOnAi: false,
        executeOnChatChange: false,
        executeOnGroupMemberDraft: false,
        executeOnNewChat: false,
        executeBeforeGeneration: false,
        automationId: '',
      },
      {
        id: 3,
        showLabel: true,
        label: '📌 Nota de Cena',
        title: 'Registrar nota explícita de cena no contexto atual',
        message: '/send [REGISTRO FORENSE // NOTA DE CENA: ]',
        contextList: [],
        preventAutoExecute: true,
        isHidden: false,
        executeOnStartup: false,
        executeOnUser: false,
        executeOnAi: false,
        executeOnChatChange: false,
        executeOnGroupMemberDraft: false,
        executeOnNewChat: false,
        executeBeforeGeneration: false,
        automationId: '',
      },
      {
        id: 4,
        showLabel: true,
        label: '⚖️ Verificar Incerteza',
        title: 'Solicitar balanço clínico entre fontes comprovadas e lacunas',
        message: 'Apresente o balanço forense da cena: (1) O que está confirmado em evidência física; (2) O que é inferência circunstancial; (3) O que permanece estritamente desconhecido.',
        contextList: [],
        preventAutoExecute: false,
        isHidden: false,
        executeOnStartup: false,
        executeOnUser: false,
        executeOnAi: false,
        executeOnChatChange: false,
        executeOnGroupMemberDraft: false,
        executeOnNewChat: false,
        executeBeforeGeneration: false,
        automationId: '',
      },
    ],
    idIndex: 4,
  };
}

export async function buildKadRoleplay({
  userDir = DEFAULT_USER_DIR,
  stDir = DEFAULT_ST_DIR,
} = {}) {
  const parserPath = path.join(stDir, 'src', 'character-card-parser.js');
  const { write: writeCardPng } = await import(pathToFileURL(parserPath).href);

  const backupDir = path.join(userDir, 'backups', `kad-roleplay-${Date.now()}`);
  const manifest = computeSourceManifest();

  // 1. Lorebook
  const lorebookData = buildKadNarrativeLorebook(manifest);
  const lorebookPath = path.join(userDir, 'worlds', 'KAD_Narrative.json');
  const lorebookRes = backupAndWrite(lorebookPath, JSON.stringify(lorebookData, null, 2), backupDir);

  // 2. Character cards
  const avatarPath = path.join(userDir, 'characters', 'default_Seraphina.png');
  const avatarBuffer = fs.readFileSync(avatarPath);
  const cards = buildCharacterCards(manifest);
  const cardResults = [];

  for (const { filename, card } of cards) {
    const cardJsonStr = JSON.stringify(card);
    const pngBuffer = writeCardPng(avatarBuffer, cardJsonStr);
    const targetPath = path.join(userDir, 'characters', filename);
    const res = backupAndWrite(targetPath, pngBuffer, backupDir, true);
    cardResults.push({ filename, path: res.targetPath, changed: res.changed });
  }

  // 3. QuickReplies
  const qrData = buildQuickReplies();
  const qrPath = path.join(userDir, 'QuickReplies', 'KAD_Roleplay.json');
  const qrRes = backupAndWrite(qrPath, JSON.stringify(qrData, null, 2), backupDir);

  return {
    lorebook: { path: lorebookRes.targetPath, changed: lorebookRes.changed },
    cards: cardResults,
    quickReplies: { path: qrRes.targetPath, changed: qrRes.changed },
    backupDir,
    manifest,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  const result = await buildKadRoleplay();
  console.log(JSON.stringify(result, null, 2));
}
