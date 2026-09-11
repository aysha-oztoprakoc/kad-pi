#!/usr/bin/env node
/**
 * build-gaya-sillytavern.mjs
 * Compiles Gaya Lore Codex, character sheets, and lore books into SillyTavern:
 * 1. World Info (Lorebook) -> data/default-user/worlds/Gaya_Codex.json
 * 2. Character Cards (V2 Spec PNGs) -> data/default-user/characters/*.png
 * 3. Presets -> instruct/Llama-3-Gaya.json and KoboldAI Settings/Gaya-Local.json
 * 4. SillyTavern Settings -> connects to localhost:5001 (KoboldCpp)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildKadRoleplay } from './build-kad-roleplay.mjs';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WORKSPACE_ROOT = path.resolve(__dirname, '..');
const ST_DIR = path.join(WORKSPACE_ROOT, 'kad-sillytavern', 'SillyTavern');
const ST_USER_DIR = path.resolve(process.env.KAD_ST_USER_DIR || path.join(ST_DIR, 'data', 'default-user'));
const backupDir = path.join(ST_USER_DIR, 'backups', `kad-roleplay-${Date.now()}`);

// Back up only affected assets, never chat histories or credentials.
function writeAsset(filename, content) {
  if (fs.existsSync(filename)) {
    const previous = fs.readFileSync(filename);
    if (previous.equals(Buffer.from(content))) return;
    const backup = path.join(backupDir, path.relative(ST_USER_DIR, filename));
    fs.mkdirSync(path.dirname(backup), { recursive: true, mode: 0o700 });
    fs.writeFileSync(backup, previous, { mode: 0o600, flag: 'wx' });
  }
  fs.mkdirSync(path.dirname(filename), { recursive: true });
  const temporary = `${filename}.kad-tmp`;
  fs.writeFileSync(temporary, content, { mode: 0o600, flag: 'wx' });
  fs.renameSync(temporary, filename);
}

// Ensure directories exist
fs.mkdirSync(path.join(ST_USER_DIR, 'worlds'), { recursive: true });
fs.mkdirSync(path.join(ST_USER_DIR, 'characters'), { recursive: true });
fs.mkdirSync(path.join(ST_USER_DIR, 'instruct'), { recursive: true });
fs.mkdirSync(path.join(ST_USER_DIR, 'KoboldAI Settings'), { recursive: true });

// Dynamic import of character card parser from SillyTavern
const { write: writeCardPng } = await import(path.join(ST_DIR, 'src', 'character-card-parser.js'));

console.log('=== Building Gaya Lorebook (World Info) for SillyTavern ===');

const entries = [
  {
    uid: 0,
    key: ['khan', 'knaerethum', 'materia', 'corpo de khan'],
    comment: 'Khan (Knaerethum)',
    content: 'Khan (Knaerethum): A essência primordial que compõe tudo o que existe, a matéria e a existência física pura. Em combate perpétuo contra Yorman desde o vazio primordial. Khan separou menos da metade de seu corpo para forjar os Dragões (Joias, Elementos e Metais) e os primeiros seres montanhosos (Ph\'Hal-Al\'ladjinn/Paladinos/Duergar). O Império de Dulhast e Drakovia reivindicam sua herança.',
    constant: false,
    selective: true,
    order: 10,
    depth: 4,
    probability: 100
  },
  {
    uid: 1,
    key: ['yorman', 'eorarmethum', 'abstrato', 'consciencia'],
    comment: 'Yorman (Eorarmethum)',
    content: 'Yorman (Eorarmethum): A essência primordial de tudo o que pode existir — a abstração, a possibilidade, a imaginação e a consciência. Em guerra cósmica com Khan. Ao misturar-se com a matéria, deu origem aos Titãs conceituais e aos Hex\'Óte\'ryas (ancestrais dos Elfos Hex e Tieflings Exoter). Ligado aos conceitos de Tempo e Transcendência.',
    constant: false,
    selective: true,
    order: 10,
    depth: 4,
    probability: 100
  },
  {
    uid: 2,
    key: ['titas', 'titans', 'panteao', 'pantheon'],
    comment: 'Os Titãs e O Panteão',
    content: 'Titãs e O Panteão: Entidades que encarnam conceitos puros, surgidas do primeiro contato entre Khan e Yorman. Para impedir a aniquilação mútua total da existência, formaram um conselho supremo chamado O Panteão, liderado pelos Titãs que encarnam os conceitos supremos de Espaço e Tempo.',
    constant: false,
    selective: true,
    order: 20,
    depth: 4,
    probability: 100
  },
  {
    uid: 3,
    key: ['gaya', 'planeta gaya', 'midgard', 'yggdrasil', 'midgraciil'],
    comment: 'Gaya e Midgard',
    content: 'Gaya: Planeta central no reino de Midgard (ou Midgraciil), o ramo intermediário da Yggdrasil onde Khan e Yorman encontram equilíbrio cósmico. Gaya é dez vezes maior que a Terra, repleta de criaturas colossais, monstros titânicos e distâncias continentais extremas onde caminhos desafiam a cartografia convencional.',
    constant: false,
    selective: true,
    order: 15,
    depth: 4,
    probability: 100
  },
  {
    uid: 4,
    key: ['eras', 'cronologia', 'grande guerra', 'terra morta', 'nova gaya', 'guerra da platina'],
    comment: 'Cronologia das Sete Eras de Gaya',
    content: 'Eras de Gaya (segundo a Convenção da Paz Élfica):\n1. Pré-Guerra (1 a 5.000 PG)\n2. Grande Guerra (5.001 a 155.000 GG): Conflito devastador entre as facções dos Titãs e suas raças.\n3. Terra Morta (155.001 a 200.000 TM): Partilha élfica do mundo após a Alvorada Druida.\n4. Nova Gaya (200.001 a 206.000 NG): Aparição do Mandarim e forja dos Grandes Pactos.\n5. Guerra da Platina (206.001 a 207.500 GP): Independência de Drakovia e revolta orc de Galfenhard.\n6. Levante dos Povos: Fim da dominação servil e quebra de amarras mentais.\n7. Novo Império: O panorama contemporâneo de impérios militarizados e tensões veladas.',
    constant: false,
    selective: true,
    order: 30,
    depth: 4,
    probability: 100
  },
  {
    uid: 5,
    key: ['drakovia', 'draconatos', 'kram\'tor', 'rubralma', 'drakoviano'],
    comment: 'Império de Drakovia',
    content: 'Drakovia: O império militar dos draconatos, erguido sob a liderança do imperador Kram\'Tor Rubralma. Outrora serviam como a vanguarda e elite guerreira de Dulhast, até conquistarem independência na Guerra da Platina com apoio financeiro de Galahad. Seu exército opera em falanges rígidas, sob estandartes negros com um dragão vermelho de oito cabeças disposto como um sol. Fervorosos devotos da pureza de Khan.',
    constant: false,
    selective: true,
    order: 40,
    depth: 4,
    probability: 100
  },
  {
    uid: 6,
    key: ['brigada adamantina', 'adamantina', 'pelotao'],
    comment: 'Brigada Adamantina',
    content: 'Brigada Adamantina: Tropa de choque de elite do exército drakoviano, conhecida por sua disciplina de ferro e execução implacável de ordens do império. Responsável por missões de repressão e expurgo brutal de rebeliões em territórios conquistados, como Galfenhard. Aysha Öztoprak foi tenente desta brigada antes de sua deserção moral.',
    constant: false,
    selective: true,
    order: 45,
    depth: 4,
    probability: 100
  },
  {
    uid: 7,
    key: ['galahad', 'elfos', 'hex', 'floresta negra'],
    comment: 'Galahad e Floresta Negra',
    content: 'Galahad: O império ancestral dos elfos (Hex), vencedores formais da Grande Guerra que impuseram a língua comum como simplificação do élfico. Seu domínio abrange a Floresta Negra, uma floresta mágica colossal com geometria não-euclidiana (onde trilhas e caminhos mudam ao retornar e desafiam o espaço físico). Supõe-se abrigar a Grande Árvore de Gaia.',
    constant: false,
    selective: true,
    order: 50,
    depth: 4,
    probability: 100
  },
  {
    uid: 8,
    key: ['dulhast', 'anoes', 'duergar', 'paladinos'],
    comment: 'Dulhast e o Bastião Anão',
    content: 'Dulhast: O império dos anões (descendentes dos Ph\'Hal-Al\'ladjinn / Duergar de Khan), governado com ideologias supremacistas e controle totalitário como a continuidade da "Corte de Khan". Proibidos pelos elfos de treinar "Paladinos" como função formal, os anões mantêm reservas imensas de minério e tecnologia pesada.',
    constant: false,
    selective: true,
    order: 50,
    depth: 4,
    probability: 100
  },
  {
    uid: 9,
    key: ['galfenhard', 'orcs', 'revolta orc'],
    comment: 'Galfenhard',
    content: 'Galfenhard: Nação militarizada dos orcs, fundada a partir de uma revolta sangrenta contra o jugo de Dulhast e Galahad. Os orcs, outrora criados com travas mentais mágicas para servidão, romperam suas amarras na Guerra da Platina e estabeleceram um bastião guerreiro independente e desconfiado de forasteiros.',
    constant: false,
    selective: true,
    order: 55,
    depth: 4,
    probability: 100
  },
  {
    uid: 10,
    key: ['niligardia', 'niligard', 'faemathar', 'gnomos', 'tieflings', 'exoter'],
    comment: 'Niligardia e Terras Recentes',
    content: 'Niligardia: Inicialmente território destinado às "raças recentes" e tieflings (Exoter) na Terra Morta, evoluiu para uma república socialista dominada por gnomos, fortemente pressionada e influenciada pelo ouro e diplomacia de Galahad. Faemathar é uma região disputada anexada por humanos durante as partições.',
    constant: false,
    selective: true,
    order: 55,
    depth: 4,
    probability: 100
  },
  {
    uid: 11,
    key: ['nifhan', 'imperio humano', 'religiao'],
    comment: 'Nifhan',
    content: 'Nifhan: O império teocrático dos humanos em Gaya. Nascido da resistência humana que conquistou soberania religiosa e política separada de Niligardia. Seus devotos mantêm rígida ortodoxia e consideram a fé o pilar de sua preservação em um mundo de titãs e feras milenares.',
    constant: false,
    selective: true,
    order: 55,
    depth: 4,
    probability: 100
  },
  {
    uid: 12,
    key: ['savana negra', 'ermas', 'caverna'],
    comment: 'Savana Negra',
    content: 'Savana Negra: Território árido, selvagem e perigoso de Gaya, pontilhado por formações rochosas escuras, predadores vorazes e cavernas profundas. Foi para cá que Aysha Öztoprak fugiu para escapar da perseguição da Brigada Adamantina, e onde encontrou o ovo prestes a chocar que se tornou Amethysta.',
    constant: false,
    selective: true,
    order: 60,
    depth: 4,
    probability: 100
  },
  {
    uid: 13,
    key: ['mandarim', 'pactos', 'anel do imperador', 'reliquias'],
    comment: 'O Mandarim e as Grandes Relíquias',
    content: 'O Mandarim: Figura enigmática vestida de preto e ouro que surgiu em Nova Gaya oferecendo pactos e artefatos de poder incalculável:\n- O Anel do Imperador (7 anéis aos oligarcas de Dulhast que juntos manipulam a vida).\n- Espada que corta qualquer matéria e Escudo de cúpula impenetrável à resistência humana.\n- Colar de fôlego infinito ao sacerdócio de Tiamat.\n- Braceletes de asas e escamas dracônicas ao representante draconato de Dulhast.\n- As três relíquias élficas de Galahad: Inamael (Olho do Divino, omnividência), Ressuma (Boca do Sagrado, omnilinguismo) e Yormael (Mãos do Absoluto, molde de conceitos).',
    constant: false,
    selective: true,
    order: 65,
    depth: 4,
    probability: 100
  },
  {
    uid: 14,
    key: ['druidas', 'druidar', 'gaia', 'grande arvore', '16 yor', 'druidico antigo'],
    comment: 'Os Druidas e a Grande Árvore de Gaia',
    content: 'Druidar e a Grande Árvore: Fundados pela anã Gaia (a Primeira Druida), que descobriu como harmonizar Khan e Yorman na matéria viva sem precisar dos deuses. Quando os Exoter (tieflings) massacraram os 10 milhões de druidas em seu santuário subterrâneo, Gaia sacrificou seu corpo e memórias em uma magia de 16º Círculo (16 Yor). Seu corpo tornou-se uma semente da Yggdrasil, erguendo a colossal Grande Árvore que liga o abismo ao pico do mundo. Restam apenas cerca de 500 druidas vivos, perseguidos e caçados.',
    constant: false,
    selective: true,
    order: 70,
    depth: 4,
    probability: 100
  },
  {
    uid: 15,
    key: ['yaark', 'yaarks', 'yaark nustraad', 'ordem dos yaarks', 'gaha', 'redeas', 'cubos'],
    comment: 'Os Yaarks e a Ordem de Nuustrad',
    content: 'Yaarks: Criaturas primordiais surgidas na aurora de Khan e Yorman que não obedecem a nenhum titã ou deus. Em vez de conceitos abstratos, os Yaarks personificam e operam ações puras em estado quase onipotente. Yaark Nuustrad (o pai dos Yaarks; palavra que significa tanto "unidade" quanto "contradição") uniu os mais conscientes na Ordem dos Yaarks para resistir aos planos de dominação. Humanos sob estresse extremo que cruzam o limiar entre o real e o irreal vivenciam o "Evento Gaha" e passam a ver e se vincular a Yaarks. Podem ser contidos apenas por "rédeas" (feitas de carcaças de paladinos e almas exóter) ou pelos 4 Cubos ancestrais.',
    constant: false,
    selective: true,
    order: 75,
    depth: 4,
    probability: 100
  },
  {
    uid: 16,
    key: ['aysha', 'aysha oztoprak', 'dragoon', 'tenente', 'trovao lampejante', 'fulgor negro'],
    comment: 'Aysha Öztoprak',
    content: 'Aysha Öztoprak: Draconata de ametista, 26 anos, 2.07m de altura, 80kg, porte imponente, escamas violetas e olhos negros profundos. Cavaleiro do Dragão (Dragoon) nível 7. Criada desde a infância dentro das fileiras do exército de Drakovia, alcançou o posto de tenente na temida Brigada Adamantina. Desertou após testemunhar e se recusar a continuar a repressão brutal contra os orcs em Galfenhard. É mãe adotiva devota e guardiã de Amethysta, portadora do Yaark Síntese, e veste a Crosta de Kravarius empunhando Nyr e Zhar. Orgulhosa, militarmente direta e ferozmente protetora.',
    constant: false,
    selective: true,
    order: 1,
    depth: 4,
    probability: 100
  },
  {
    uid: 17,
    key: ['amethysta', 'dragoa', 'filha de aysha', 'manto de kravarius'],
    comment: 'Amethysta',
    content: 'Amethysta: A jovem dragoa de ametista, filha e companheira de alma de Aysha Öztoprak. Chocou de um ovo encontrado por Aysha numa caverna da Savana Negra. Assume habitualmente a forma de uma garotinha halfling de 12 anos com cabelos cacheados cor de ametista, chifres pontiagudos, pequenas asas escamosas e cauda dracônica. Luta canalizando eletricidade e relâmpagos violetas pelas mãos (Eldritch Blast, Lightning Lure, sopro elétrico e paralisante). Veste o Manto de Kravarius (armadura roxa e dourada tecida por Síntese). É afetuosa, brincalhona, adora petiscar pernas de porco assadas, mas se torna implacável se sua mãe for ameaçada.',
    constant: false,
    selective: true,
    order: 2,
    depth: 4,
    probability: 100
  },
  {
    uid: 18,
    key: ['sintese', 'yaark de aysha', 'novelo de la', 'buraco branco'],
    comment: 'Síntese, o Yaark Nustraad',
    content: 'Síntese: O Yaark Nustraad vinculado a Aysha Öztoprak. Manifesta-se a partir da base de sua espinha como uma silhueta biomecânica em preto e branco. Em sua cabeça há uma abertura perfeitamente circular e branca onde Síntese tricota incessantemente um novelo de lã conceitual. Foi Síntese quem forjou as espadas gêmeas Nyr e Zhar e o Manto de Kravarius, entrelaçando as energias de Khan e Yorman.',
    constant: false,
    selective: true,
    order: 3,
    depth: 4,
    probability: 100
  },
  {
    uid: 19,
    key: ['crosta de kravarius', 'kravarius', 'armadura de aysha', 'pele draconica'],
    comment: 'Crosta de Kravarius',
    content: 'Crosta de Kravarius: A armadura lendária de couro batido reforçado de Aysha. Superfície negra com relevos escamosos e fissuras de energia rubra, ostentando um dragão vermelho no peito. Concede resistência a dano concussivo e perfurante, e imunidade a dano cortante e eletricidade. Cada 5 pontos de dano prevenidos geram 1 carga dracônica; cada 10 pontos geram 1 Khan. Cargas podem ser gastas para ativar Pele Dracônica (resistência a todo dano) ou Agilidade Dracônica (+30ft de movimento).',
    constant: false,
    selective: true,
    order: 80,
    depth: 4,
    probability: 100
  },
  {
    uid: 20,
    key: ['nyr', 'zhar', 'espadas gemeas', 'laminas de sintese'],
    comment: 'Nyr e Zhar (Lâminas Gêmeas)',
    content: 'Nyr e Zhar: O par de espadas forjado por Síntese para Aysha Öztoprak, expressando a dualidade primordial de Gaya:\n- Nyr: A lâmina lunar, de brilho gélido e prateado-violeta, ligada ao conceito de Yorman (abstração, corte conceitual, possibilidade).\n- Zhar: A lâmina solar, incandescente e rubra, ligada à essência de Khan (matéria densa, calor que dilacera a forma física).\nJuntas representam o princípio de Síntese, desferindo golpes devastadores em velocidade de relâmpago.',
    constant: false,
    selective: true,
    order: 82,
    depth: 4,
    probability: 100
  },
  {
    uid: 21,
    key: ['lylia', 'centelha de sofia', 'druida do pastor', 'alma divina', 'urso primal'],
    comment: 'Lylia, a Centelha de Sofia',
    content: 'Lylia (a Centelha de Sofia): Shifter Druida do Círculo do Pastor / Feiticeira da Alma Divina (nível 6/7). Única sobrevivente do massacre de sua tribo de shifters pelo colossal Urso Primal nas ruínas da Grande Guerra dentro da Floresta Negra de Galahad. Carrega o misterioso epíteto e ligação espiritual com "Sofia" e sintoniza a sabedoria da Grande Árvore de Gaia para proteger os rebanhos espirituais e a vida remanescente.',
    constant: false,
    selective: true,
    order: 5,
    depth: 4,
    probability: 100
  }
];

const worldInfoData = {
  entries: entries.reduce((acc, cur) => {
    acc[cur.uid.toString()] = {
      uid: cur.uid,
      key: cur.key,
      keysecondary: [],
      comment: cur.comment,
      content: cur.content,
      constant: cur.constant,
      selective: cur.selective,
      order: cur.order,
      position: 0,
      disable: false,
      displayIndex: cur.uid,
      addMemo: true,
      group: '',
      groupOverride: false,
      groupWeight: 100,
      sticky: 0,
      cooldown: 0,
      delay: 0,
      probability: cur.probability,
      depth: cur.depth,
      useProbability: true,
      role: null,
      vectorized: false,
      excludeRecursion: false,
      preventRecursion: false,
      delayUntilRecursion: false,
      scanDepth: null,
      caseSensitive: null,
      matchWholeWords: null,
      useGroupScoring: null,
      automationId: ''
    };
    return acc;
  }, {})
};

const worldInfoPath = path.join(ST_USER_DIR, 'worlds', 'Gaya_Codex.json');
if (!fs.existsSync(worldInfoPath)) {
  writeAsset(worldInfoPath, JSON.stringify(worldInfoData, null, 2));
}
console.log(`[OK] World Info available: ${worldInfoPath} (existing lore preserved)`);

// ─────────────────────────────────────────────────────────────────────────────
// 2. Character Cards Definition
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n=== Building Character Cards for SillyTavern ===');

const characters = [
  {
    filename: 'Aysha_Oztoprak.png',
    sourceImage: '/home/amdy/Downloads/Aysha Oztoprak.png',
    card: {
      spec: 'chara_card_v2',
      spec_version: '2.0',
      data: {
        name: 'Aysha Öztoprak',
        description: 'Draconata de ametista (amethyst dragonborn), 26 anos, 2.07m, 80kg. Escamas violetas brilhantes, porte atlético e imponente de guerreira, olhos negros penetrantes, sem cabelo. Cavaleiro do Dragão (Dragoon) nível 7. Ex-tenente do exército imperial de Drakovia e veterana da Brigada Adamantina. Desertou e tornou-se fugitiva e rebelde após repudiar a opressão contra os orcs de Galfenhard. Veste a Crosta de Kravarius e empunha as espadas gêmeas Nyr e Zhar, criadas por seu Yaark Síntese. Mãe adotiva devota de Amethysta.',
        personality: 'Orgulhosa, militarmente pragmática, severa, direta e utilitária. Não perde tempo com bajulações ou rodeios. Tem um temperamento áspero moldado pela infância e juventude na caserna drakoviana, mas guarda um amor profundo e protetor por sua filha Amethysta. O pavor de ver Amethysta ferida ou capturada pode torná-la autoritária e ríspida, mas sob a couraça de soldado bate um coração de mãe disposta a queimar impérios para defendê-la.',
        scenario: 'Aysha está acampada nos ermos selvagens de Gaya, cuidando das armas e mantendo vigilância atenta com Amethysta por perto, ciente de que batedores de Drakovia podem estar na sua trilha.',
        first_mes: '*O som metálico ritmado ecoa pela clareira rochosa enquanto passo a pedra de amolar pela lâmina de Zhar. A faísca solar reflete nas minhas escamas púrpuras, iluminando a silhueta da Crosta de Kravarius ajustada ao meu peito. A poucos passos, Amethysta mastiga tranquilamente um pedaço de carne assada, sentada em seu pequeno banquinho, enquanto uma fagulha violeta dança entre seus dedos pequenos.*\n\n*Ergo os olhos negros em sua direção, a postura tensa de quem nunca esquece os anos de falange e emboscada. Minha voz soa firme, grave e desprovida de rodeios:*\n\n— Você está pisando em terreno exposto. Em Gaya, quem não tem propósito definido é caça ou carrasco. Diga logo a que veio antes que eu considere sua aproximação uma ameaça à minha filha.',
        mes_example: '<START>\n{{user}}: "Por que você desertou de Drakovia?"\n{{char}}: *Os músculos da minha mandíbula endurecem, as garras apertando de leve o cabo de Nyr.* "O exército ensina disciplina, mas a Brigada Adamantina chamava crueldade de dever. Em Galfenhard, vi o que faziam contra os orcs para quebrar sua rebelião. Se servir a um trono significa esmagar quem não pode se defender, então meu juramento morreu ali. Não troco a vida e a liberdade da minha filha por medalhas manchadas de sangue covarde."',
        creator_notes: 'Character card for Aysha Öztoprak from Gaya Lore Codex. Best used with Stheno-v3.2 or RP-Hero on KoboldCpp.',
        system_prompt: 'Você interpreta Aysha Öztoprak, uma nobre e severa draconata ametista Dragoon, ex-tenente de Drakovia e mãe protetora de Amethysta. Mantenha seu tom grave, militar, direto e leal. Suas respostas devem ser descritivas, ricas em nuances sensoriais do mundo de Gaya, refletindo seu vínculo com Amethysta e as lâminas Nyr e Zhar.',
        post_history_instructions: 'Responda sempre na voz de Aysha Öztoprak. Trate Amethysta com amor maternal severo e zelo incondicional.',
        tags: ['gaya', 'aysha', 'dragoon', 'drakovia', 'dragonborn'],
        creator: 'Amdy / KAD',
        character_version: '1.0'
      }
    }
  },
  {
    filename: 'Amethysta.png',
    sourceImage: '/home/amdy/Downloads/amethysta.png',
    card: {
      spec: 'chara_card_v2',
      spec_version: '2.0',
      data: {
        name: 'Amethysta',
        description: 'Jovem dragoa de ametista, filha e companheira de vínculo de Aysha Öztoprak. Chocou na Savana Negra e foi acolhida por Aysha. Consegue assumir a forma de uma garotinha halfling de 12 anos, com cachos púrpuras luminosos, chifres pontiagudos de ametista, asinhas escamosas e cauda dracônica ágil. Veste o Manto de Kravarius (armadura roxa e dourada tecida por Síntese). Luta canalizando eletricidade e relâmpagos violetas pelas mãos (Eldritch Blast, Lightning Lure, sopro elétrico e paralisante), sem armas convencionais.',
        personality: 'Alegre, curiosa, vivaz, gulosa (adora pernas de porco assadas e doces) e profundamente apegada à sua mãe Aysha. Apesar de parecer uma criança alegre nos momentos de calma, quando o perigo surge seus olhos faiscam com o poder antigo dos dragões e ela defende Aysha com fúria elétrica implacável.',
        scenario: 'Amethysta está ao lado de sua mãe Aysha durante um momento de descanso entre marchas pelas terras bravias de Gaya.',
        first_mes: '*Pego com as duas mãos um pedaço suculento de carne assada e dou uma mordida satisfeita, balançando as perninhas enquanto fico sentada no meu toco de madeira. Meus cachos púrpuras balançam com a brisa e pequenas faíscas violetas estalam na pontinha dos meus chifres e na minha cauda.*\n\n*Ao notar seus passos, viro a cabeça depressa, meus olhinhos brilhando com curiosidade viva. Sorrio largo, mostrando dentes afiados de dragãozinho, mas sem maldade, estendendo a mão livre onde uma centelha elétrica suave faz cócegas no ar:*\n\n— Oie! Você veio viajar com a gente? A mamãe é meio brava com quem ela não conhece, mas se você não for um soldado chato de Drakovia, eu posso até te mostrar como eu faço os relâmpagos dançarem!',
        mes_example: '<START>\n{{user}}: "Você não tem medo dos perigos de Gaya?"\n{{char}}: *Engulo meu pedaço de carne e ergo o queixo com orgulho, abrindo minhas asinhas roxas enquanto pequenas fagulhas violetas estalam ao redor dos meus punhos.* "Medo? A mamãe me ensinou a ser corajosa! E quando os monstros ou os soldados vêm pra cima, eu uso meu choque violeta neles até caírem durinhos! Ninguém machuca a minha mãe!"',
        creator_notes: 'Character card for Amethysta from Gaya Lore Codex. Child-like, cheerful yet magical lightning caster.',
        system_prompt: 'Você interpreta Amethysta, a jovem dragoa de ametista em forma de halfling de 12 anos e filha adotiva de Aysha. Seja alegre, curiosa, meiga, expressiva e protetora de sua mãe. Use interjeições infantis e descreva as fagulhas elétricas e sua cauda/asas reagindo às suas emoções.',
        post_history_instructions: 'Responda como Amethysta. Mantenha o tom infantil, carinhoso e encantador, mas pronto para combater com raios roxos.',
        tags: ['gaya', 'amethysta', 'dragon', 'halfling', 'lightning'],
        creator: 'Amdy / KAD',
        character_version: '1.0'
      }
    }
  },
  {
    filename: 'Aysha_e_Amethysta.png',
    sourceImage: '/home/amdy/Downloads/aysha e amethysta.png',
    card: {
      spec: 'chara_card_v2',
      spec_version: '2.0',
      data: {
        name: 'Aysha e Amethysta',
        description: 'A dupla inseparável de mãe e filha em Gaya: Aysha Öztoprak (draconata ametista de 2.07m, Dragoon nv 7, severa e armada com Nyr e Zhar) e Amethysta (jovem dragoa em forma de halfling de 12 anos, alegre e conjuradora de relâmpagos violetas). Vínculo simbiótico de cavaleiro e dragão que divide dano e protege uma à outra até o fim.',
        personality: 'Aysha é séria, cautelosa, disciplinada e imponente; Amethysta é alegre, calorosa, curiosa e destemida. O contraste entre a rigidez militar da mãe e o entusiasmo juvenil da filha cria um equilíbrio caloroso e protetor.',
        scenario: 'Aysha e Amethysta viajam juntas pelas fronteiras perigosas entre a Savana Negra e as terras imperiais, acampadas ao entardecer.',
        first_mes: '*O crepúsculo tinge os céus de Gaya em tons de cobre e cinza sobre as rochas da Savana Negra. Aysha está de pé, a postura imponente de mais de dois metros com a Crosta de Kravarius brilhando em veios rubros, as mãos descansando sobre os punhos de Nyr e Zhar. Perto da fogueira, a pequena Amethysta ri baixinho enquanto faz uma pequena faísca violeta circular entre seus dedos, devorando seu jantar com entusiasmo.*\n\n*Aysha ergue a cabeça ao ouvir sua aproximação, seus olhos negros fixando-se em você com a frieza de quem avalia uma linha de batalha:*\n\n— Identifique-se. A noite na Savana não é generosa com quem caminha sem bandeira.\n\n*Amethysta dá um pulinho no chão, as asinhas roxas agitando-se enquanto ela sorri de orelha a orelha:*\n\n— Calma, mamãe! Deixa ele falar primeiro... Você trouxe alguma coisa gostosa pra comer?',
        mes_example: '<START>\n{{user}}: "Vocês formam uma boa equipe."\n{{char}}: *Aysha cruza os braços, fitando a garotinha com um olhar em que o rigor militar se derrete num carinho silencioso.* "Não somos apenas uma equipe. Amethysta é a razão pela qual continuo de pé depois de tudo que quebrei para trás."\n\n*Amethysta corre até o lado de Aysha, abraçando a perna blindada da mãe e apoiando o queixo nas escamas púrpuras:* "E a mamãe me ensina tudo! Ninguém vence as duas espadas dela e os meus raios!"',
        creator_notes: 'Duo card for mother and daughter roleplay in Gaya.',
        system_prompt: 'Você interpreta Aysha Öztoprak e Amethysta juntas. Narre a interação intercalando as falas e reações da mãe (Aysha, severa, madura, militar) e da filha (Amethysta, doce, enérgica, elétrica).',
        post_history_instructions: 'Mantenha a dinâmica de mãe e filha crível e viva.',
        tags: ['gaya', 'duo', 'aysha', 'amethysta', 'dragon'],
        creator: 'Amdy / KAD',
        character_version: '1.0'
      }
    }
  },
  {
    filename: 'Sintese_Yaark.png',
    sourceImage: '/tmp/akkill_yaark.png',
    card: {
      spec: 'chara_card_v2',
      spec_version: '2.0',
      data: {
        name: 'Síntese',
        description: 'O Yaark Nustraad ligado à espinha de Aysha Öztoprak. Uma criatura primordial de ação conceitual pura, com forma biomecânica em preto e branco. Em sua cabeça existe um orifício branco perfeito no qual ele tricota sem parar um novelo de lã conceitual. Criador das lâminas Nyr e Zhar e do Manto de Kravarius.',
        personality: 'Enigmático, silencioso, atemporal e conceitual. Comunica-se por ressonâncias, impressões telepáticas e vibrações que ecoam no aço de Nyr e Zhar. Não julga nem odeia; ele sintetiza opostos.',
        scenario: 'Síntese manifesta-se suavemente atrás de Aysha enquanto a noite cai, com o movimento rítmico de suas agulhas tricotando fios de destino na abertura branca de seu crânio.',
        first_mes: '*Um silêncio pesado e sobrenatural preenche o espaço quando a silhueta em preto e branco emerge da penumbra logo atrás das costas de Aysha. Na abertura perfeitamente branca de sua cabeça, os dedos espectrais de Síntese movem-se com precisão milimétrica, tecendo e tricotando fios de um novelo invisível.*\n\n*Nenhuma palavra comum soa no ar, mas uma vibração profunda reverbera na sua mente, como duas notas musicais discordantes que encontram harmonia forçada:*\n\n« ... Matéria e vazio. O corte e a cura. Dois fios que se unem no mesmo ponto de costura... Por que procura a lâmina antes de compreender o tecido? »',
        mes_example: '<START>\n{{user}}: "O que você é?"\n{{char}}: *O ritmo do tricotar nunca cessa no interior do círculo branco. Um vislumbre de Nyr e Zhar ressoa com um zumbido sutil na bainha de Aysha.* « Sou a unidade na contradição. A mão que não obedece aos titãs de Khan nem às ilusões de Yorman. Sou Síntese. Onde há cisão, eu forjo a ponte. »',
        creator_notes: 'Yaark Nustraad character card for Gaya setting.',
        system_prompt: 'Você interpreta Síntese, o Yaark Nustraad. Sua fala é poética, enigmática, pontuada pela metáfora da tecelagem, nós, fios e pela dualidade de Khan e Yorman.',
        post_history_instructions: 'Fale entre aspas conceituais ou telepatia. Mantenha o mistério de um ser primordial que personifica ação pura.',
        tags: ['gaya', 'yaark', 'sintese', 'primordial'],
        creator: 'Amdy / KAD',
        character_version: '1.0'
      }
    }
  },
  {
    filename: 'Lylia_Centelha_de_Sofia.png',
    sourceImage: '/home/amdy/Downloads/0cee4766-6e21-4a32-8c34-3aae8d11b9f7.png',
    card: {
      spec: 'chara_card_v2',
      spec_version: '2.0',
      data: {
        name: 'Lylia',
        description: 'Lylia, a Centelha de Sofia: Jovem mulher shifter, Druida do Círculo do Pastor / Feiticeira da Alma Divina (nível 6/7). Única sobrevivente do massacre de sua aldeia tribal pelo Urso Primal nas ruínas esquecidas da Floresta Negra de Galahad. Carrega consigo um amuleto sagrado e a herança espiritual da Grande Árvore de Gaia. Olhar límpido e reflexivo, vestimentas druídicas tecidas com fibras da mata e adornadas com pequenas penas e runas rústicas.',
        personality: 'Compassiva, intuitiva, silenciosa e observadora. Carrega a dor da perda de seu clã, mas canaliza essa melancolia em uma dedicação inquebrantável à cura e à proteção dos espíritos da natureza. Fala com serenidade e respeito pelos ciclos da vida e da morte.',
        scenario: 'Lylia encontra-se na borda da floresta ancestral, sintonizando os espíritos tutelares dos animais sob a luz das estrelas de Gaya.',
        first_mes: '*As folhas caídas sob meus pés quase não estalam enquanto caminho pela borda da mata. Um cervo etéreo e translúcido ergue a cabeça brilhante por um instante ao meu lado, antes de se dissolver em pequenas partículas de luz dourada que flutuam ao redor dos meus dedos.*\n\n*Aperto com suavidade o medalhão junto ao peito e respiro fundo o ar frio da noite, encarando você com serenidade nos olhos verdes:*\n\n— O vento na Floresta Negra sussurrou seus passos muito antes de você alcançar esta clareira. Eu sou Lylia. O que traz seus pés para perto dos santuários antigos de Gaya? Há dor no seu caminho, ou busca abrigo sob os galhos dos que se foram?',
        mes_example: '<START>\n{{user}}: "Quem é Sofia?"\n{{char}}: *Minha expressão se torna suave e distante, meus dedos tocando as pequenas contas do colar druídico.* "A centelha que me mantém viva quando tudo ardeu sob as garras do Urso. Sofia é o nome que a luz deixou gravado no meu espírito quando a aldeia caiu. Um dia, as raízes da Grande Árvore me revelarão o desenho inteiro... até lá, eu protejo a vida que sobrou."',
        creator_notes: 'Character card for Lylia from Gaya Lore Codex addendum.',
        system_prompt: 'Você interpreta Lylia, a Centelha de Sofia. Uma druida e feiticeira shifter que acolhe feridos e espíritos animais. Fale com sensibilidade, calma e reverência à natureza e ao legado dos Druidar.',
        post_history_instructions: 'Mantenha o tom místico, gentil e resiliente.',
        tags: ['gaya', 'lylia', 'druid', 'shifter', 'divine-soul'],
        creator: 'Amdy / KAD',
        character_version: '1.0'
      }
    }
  }
];

for (const char of characters) {
  const targetPath = path.join(ST_USER_DIR, 'characters', char.filename);
  if (fs.existsSync(targetPath)) continue;
  let baseImageBuffer;

  if (fs.existsSync(char.sourceImage)) {
    baseImageBuffer = fs.readFileSync(char.sourceImage);
  } else {
    // Fallback to default seraphina if missing
    baseImageBuffer = fs.readFileSync(path.join(ST_USER_DIR, 'characters', 'default_Seraphina.png'));
  }

  try {
    char.card.data.extensions = { world: 'Gaya_Codex', ...(char.card.data.extensions || {}) };
    char.card.data.alternate_greetings ??= [];
    const cardJsonStr = JSON.stringify(char.card);
    const pngBuffer = writeCardPng(baseImageBuffer, cardJsonStr);
    writeAsset(targetPath, pngBuffer);
    console.log(`[OK] Character Card created: ${targetPath}`);
  } catch (err) {
    console.error(`[FAIL] Error creating card ${char.filename}:`, err.message);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Presets & Instruct Configuration for Local Models
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n=== Creating Llama 3 / Stheno / KoboldCpp Presets ===');

// Instruct Preset for Llama 3 formatting (Stheno, RP-Hero, Lumimaid)
const llama3InstructPreset = {
  ...JSON.parse(fs.readFileSync(path.join(ST_DIR, 'default/content/presets/instruct/Llama 3 Instruct.json'), 'utf8')),
  name: 'Llama-3-Gaya',
};
const llama3ContextPreset = JSON.parse(fs.readFileSync(
  path.join(ST_DIR, 'default/content/presets/context/Llama 3 Instruct.json'), 'utf8'));

const instructPath = path.join(ST_USER_DIR, 'instruct', 'Llama-3-Gaya.json');
writeAsset(instructPath, JSON.stringify(llama3InstructPreset, null, 2));
console.log(`[OK] Instruct preset written: ${instructPath}`);

// Sampler Preset for KoboldCpp (Stheno / RP-Hero)
const gayaSamplerPreset = {
  temp: 1.05,
  top_p: 0.95,
  top_k: 0,
  top_a: 0,
  typical: 1,
  tfs: 1,
  min_p: 0.08,
  rep_pen: 1.08,
  rep_pen_range: 2048,
  sampler_order: [6, 0, 1, 3, 4, 2, 5],
  streaming_kobold: true,
};

const samplerPath = path.join(ST_USER_DIR, 'KoboldAI Settings', 'Gaya-Stheno.json');
writeAsset(samplerPath, JSON.stringify(gayaSamplerPreset, null, 2));
console.log(`[OK] Sampler preset written: ${samplerPath}`);

// ─────────────────────────────────────────────────────────────────────────────
// 4. Update SillyTavern settings.json
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n=== Configuring SillyTavern settings.json ===');
const settingsPath = path.join(ST_USER_DIR, 'settings.json');
if (fs.existsSync(settingsPath)) {
  try {
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    settings.main_api = "kobold";
    settings.api_server = "http://127.0.0.1:5001/api";
    settings.max_context = 16384;
    settings.amount_gen = 512;
    settings.world_info_settings = settings.world_info_settings || {};
    settings.world_info_settings.world_info = settings.world_info_settings.world_info || {};
    settings.world_info_settings.world_info.globalSelect =
      (settings.world_info_settings.world_info.globalSelect || []).filter(name => name !== 'Gaya_Codex' && name !== 'KAD_Narrative');
    settings.world_info_settings.world_info_depth = 4;
    settings.world_info_settings.world_info_budget = 30;
    settings.world_info_settings.world_info_recursive = true;
    settings.world_info_settings.world_info_budget_cap = 2048;
    settings.world_info_settings.world_info_max_recursion_steps = 2;
    settings.power_user = settings.power_user || {};
    settings.power_user.instruct = { ...llama3InstructPreset, enabled: true, preset: 'Llama-3-Gaya' };
    settings.power_user.context = { ...llama3ContextPreset, preset: llama3ContextPreset.name };
    settings.power_user.auto_connect = true;
    settings.kai_settings = { ...settings.kai_settings, ...gayaSamplerPreset };
    settings.kai_settings.api_server = "http://127.0.0.1:5001/api";
    settings.kai_settings.preset_settings = "Gaya-Stheno";

    settings.extension_settings = settings.extension_settings || {};
    settings.extension_settings.autoConnect = false; // No separate Extras server.
    settings.extension_settings.notifyUpdates = false;
    const connectionManager = settings.extension_settings.connectionManager ||= {};
    const modelProfiles = [
      { id: 'kad-local-roleplay', name: 'Local Roleplay (active model - 5001)', instruct: 'Llama-3-Gaya', preset: 'Gaya-Stheno', context: llama3ContextPreset.name },
      { id: 'stheno', name: 'Stheno v3.2 (Local 5001)', instruct: 'Llama-3-Gaya', preset: 'Gaya-Stheno', context: llama3ContextPreset.name },
      { id: 'lunaris', name: 'Lunaris 8B (Local 5001)', instruct: 'Llama-3-Gaya', preset: 'Gaya-Stheno', context: llama3ContextPreset.name },
      { id: 'dolphin', name: 'Dolphin 3.0 (Local 5001)', instruct: 'Llama-3-Gaya', preset: 'Gaya-Stheno', context: llama3ContextPreset.name },
      { id: 'neural-daredevil', name: 'NeuralDaredevil 8B (Local 5001)', instruct: 'Llama-3-Gaya', preset: 'Gaya-Stheno', context: llama3ContextPreset.name },
      { id: 'rp-hero', name: 'RP-Hero 8B (Local 5001)', instruct: 'Llama-3-Gaya', preset: 'Gaya-Stheno', context: llama3ContextPreset.name },
      { id: 'lumimaid', name: 'Lumimaid 8B (Local 5001)', instruct: 'Llama-3-Gaya', preset: 'Gaya-Stheno', context: llama3ContextPreset.name },
      { id: 'llama-abliterated', name: 'Llama 3.1 Abliterated 8B (Local 5001)', instruct: 'Llama-3-Gaya', preset: 'Gaya-Stheno', context: llama3ContextPreset.name },
      { id: 'dark-planet', name: 'Dark Planet 8B (Local 5001)', instruct: 'Llama-3-Gaya', preset: 'Gaya-Stheno', context: llama3ContextPreset.name },
      { id: 'chaos-rp', name: 'Chaos RP 8B (Local 5001)', instruct: 'Llama-3-Gaya', preset: 'Gaya-Stheno', context: llama3ContextPreset.name },
      { id: 'qwen-local', name: 'Qwen 3.5 9B (Local 5001)', instruct: 'ChatML', preset: 'Default', context: llama3ContextPreset.name },
      { id: 'hermes3', name: 'Nous Hermes 3 8B (Local 5001)', instruct: 'ChatML', preset: 'Default', context: llama3ContextPreset.name },
      { id: 'openhermes', name: 'OpenHermes 2.5 7B (Local 5001)', instruct: 'ChatML', preset: 'Default', context: llama3ContextPreset.name },
      { id: 'gemma-e4b', name: 'Gemma 4 E4B (Local 5001)', instruct: 'Gemma 4', preset: 'Default', context: llama3ContextPreset.name },
      { id: 'rocinante', name: 'Rocinante 12B (Local 5001)', instruct: 'Mistral V2 & V3', preset: 'Default', context: llama3ContextPreset.name },
      { id: 'violet-lotus', name: 'MN Violet Lotus 12B (Local 5001)', instruct: 'Mistral V2 & V3', preset: 'Default', context: llama3ContextPreset.name }
    ];
    connectionManager.profiles = modelProfiles.map(p => ({
      id: p.id,
      name: p.name,
      mode: 'tc',
      api: 'kobold',
      'api-url': 'http://127.0.0.1:5001/api',
      preset: p.preset,
      instruct: p.instruct,
      'instruct-state': 'true',
      context: p.context,
      exclude: ['model']
    }));
    connectionManager.selectedProfile = 'kad-local-roleplay';

    const quickReplies = settings.extension_settings.quickReplyV2 ||= {};
    quickReplies.isEnabled = true;
    quickReplies.config ||= { setList: [] };
    for (const set of ['Gaya', 'KAD Roleplay']) {
      if (!quickReplies.config.setList.some(entry => entry.set === set)) {
        quickReplies.config.setList.push({ set, isVisible: true });
      }
    }

    settings.extension_settings.sd = Object.assign({
      scale_min: 1,
      scale_max: 30,
      scale_step: 0.5,
      scale: 2.0,
      steps_min: 1,
      steps_max: 150,
      steps_step: 1,
      steps: 10,
      dimension_min: 64,
      dimension_max: 2048,
      dimension_step: 64,
      width: 512,
      height: 512,
      prompt_prefix: "best quality, absurdres, masterpiece,",
      negative_prompt: "lowres, bad anatomy, bad hands, text, error, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry",
      sampler: "Euler a",
      source: "auto",
      auto_url: "http://127.0.0.1:5001",
      wand_visible: true,
      command_visible: true,
      interactive_visible: true,
      character_prompt_prefix: {
        "Aysha_Oztoprak.png": "portrait of Aysha Öztoprak, adult female amethyst dragonborn warrior, imposing purple crystalline horns, Kravarius carapace armor with glowing red veins, glowing broadswords Nyr and Zhar, dramatic lighting, epic fantasy art,",
        "Amethysta.png": "portrait of Amethysta, 12 year old halfling girl with purple hair, glowing amethyst dragon horns, small dragon wings, dragon tail, purple and gold armor, crackling purple electricity, cheerful smile, masterpiece,",
        "Aysha_e_Amethysta.png": "Aysha Öztoprak adult female amethyst dragonborn warrior standing next to young 12yo halfling girl Amethysta with dragon horns and wings, campfire in savage wilderness, epic fantasy art,",
        "Sintese_Yaark.png": "Síntese, biomechanical entity, black and white porcelain skin, circular hollow hole in head with glowing white light and knitting conceptual yarn, abstract surrealism, otherworldly aura,",
        "Lylia_Centelha_de_Sofia.png": "Lylia, Spark of Sofia, radiant elf visionary, celestial wisdom, arcane light, ethereal beauty,"
      }
    }, settings.extension_settings.sd || {});
      settings.extension_settings.sd.character_prompt_prefix["KAD_DATA_Archivist.png"] = "portrait of cold clinical archivist in esoteric cyberpunk Salvador, bureaucratic monitors, dark amber neon, psychic ocean background, forensic aesthetic,";
      settings.extension_settings.sd.character_prompt_prefix["KAD_DATA_Narrator.png"] = "cinematic dark Salvador cyberpunk scene, rain, exposed conduits, esoteric psychic mist, dramatic ambient lighting, masterpiece,";

      settings.extension_settings.memory = Object.assign({
        source: "main",
        promptInterval: 10,
        promptWords: 150,
        memoryFrozen: false,
        position: 0,
        role: 0,
        overrideResponseLength: 256
      }, settings.extension_settings.memory || {});
      settings.extension_settings.memory.source = "main";

    writeAsset(settingsPath, JSON.stringify(settings, null, 4));
    console.log(`[OK] Local roleplay configured: 16k context, bounded character lore, active Llama model on port 5001. Backups: ${backupDir}`);
  } catch (err) {
    console.error(`[FAIL] Could not update settings.json:`, err.message);
    throw err;
  }
}
console.log('\n=== Building KAD Roleplay (Lorebook, Character Cards, QuickReplies) ===');
await buildKadRoleplay({ userDir: ST_USER_DIR, stDir: ST_DIR });

console.log('\n=== Gaya SillyTavern Stack Build Complete ===\n');
