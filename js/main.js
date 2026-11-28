let canvas, overlay, textbox, gl, shader, batcher, assetManager, skeletonRenderer;
let mvp = new spine.Matrix4();

let lastFrameTime;
let initialLoadTimer;
let modelFrame;
let renderFrame;
let renderTimer;
let loadingResolution;
let spineData;

let customScale = 0.8;
let positionX = 0;
let positionY = 0;
let targetFps = 60;
let bgmfile = './assets/audio/Rewind Again.ogg';
let bgmvolume = 0;
let bgm;
let bufferColor = [0.3, 0.3, 0.3];

let introAnimation, acceptingClick;
let dialogBox = true;
let currentVoiceline = 1;
let mouseSelect = -1;
let trackerID = -1;
let untrackerID = -1;
let EPointX, EPointY;
let TPoint, TEye;
let headpatOrigin;
let headpatCooldown = 0;
const headpatTarget = new spine.Vector2();
const headpatOffset = new spine.Vector2();
let flipped = false;

let transpose = 1;
let renderScale = 1;

const MIN_RENDER_SCALE = 1.5;
const MAX_RENDER_SCALE = 2;
const MAX_RENDER_PIXELS = 5120 * 2880;

let currentTracks = []; // 跟踪当前播放的音频
let interfaceLanguage = 'default';
let steamLanguage = '';
let subtitleLanguagePreference = 'auto';
window.selectedLanguage = 'English';
const subtitleLocales = {
	English: 'en',
	Chinese: 'zh-Hans',
	TraditionalChinese: 'zh-Hant',
	Japanese: 'ja',
	Korean: 'ko',
	Thai: 'th'
};
let isVoicelinePlaying = false;

const CHARACTER = 'CH0340';
let modelResolution = '8k';
// Japanese memorial lobby transcription: Kivo Wiki, via StuArchive (https://raw.githubusercontent.com/QuetzalSidera/StuArchive/main/data/students/649.json).
// Subtitle entries follow the Talk events in each animation.
const AUDIO_DETAIL = [
    {
        Japanese: [
            "不思議なものですね。外部の立ち入りを禁じている花園で――",
            "つい先日まで禁じられていた、演劇の台本をこうして眺めているだなんて。"
        ],
        English: [
            "How curious. Here we are in a garden where outsiders are forbidden—",
            "and I'm sitting here reading a play script that was banned until just the other day."
        ],
        Chinese: [
            "真是不可思议呢。在这座禁止外人进入的花园里——",
            "我竟然就这样读着前几天还被禁止的戏剧剧本。"
        ],
        TraditionalChinese: [
            "真是不可思議呢。在這座禁止外人進入的花園裡——",
            "我竟然就這樣讀著前幾天還被禁止的戲劇劇本。"
        ],
        Korean: [
            "참 신기하네요. 외부인의 출입을 금지한 정원에서—",
            "며칠 전까지만 해도 금지되었던 연극 대본을 이렇게 들여다보고 있다니요."
        ],
        Thai: ["น่าแปลกจังเลยนะคะ ในสวนที่ห้ามคนนอกเข้ามาแบบนี้—","ดิฉันกลับได้นั่งอ่านบทละครที่เพิ่งถูกห้ามไปจนถึงเมื่อไม่กี่วันก่อน"]
    },
    {
        Japanese: [
            "校則に違反しているわけではありません。ですが、なんだか……悪いことをしているような気持ちになります。",
            "この胸の高鳴りは……背徳感、なのでしょうか？"
        ],
        English: [
            "I'm not breaking any school rules. And yet… somehow it feels as though I'm doing something wrong.",
            "My heart is racing… Is this the thrill of doing something forbidden?"
        ],
        Chinese: [
            "这并没有违反校规。可是，不知为何……总觉得自己好像在做坏事。",
            "这阵心跳加速……就是所谓的背德感吗？"
        ],
        TraditionalChinese: [
            "這並沒有違反校規。可是，不知為何……總覺得自己好像在做壞事。",
            "這陣心跳加速……就是所謂的背德感嗎？"
        ],
        Korean: [
            "교칙을 어기는 건 아닙니다. 그런데 왠지…… 나쁜 짓을 하는 기분이 드네요.",
            "이렇게 가슴이 뛰는 건…… 금기를 어기는 기분 때문일까요?"
        ],
        Thai: ["ก็ไม่ได้ทำผิดกฎโรงเรียนหรอกค่ะ แต่ไม่รู้ทำไม... ถึงรู้สึกเหมือนกำลังทำอะไรไม่ดีอยู่เลย","หัวใจที่เต้นแรงแบบนี้... เป็นความตื่นเต้นจากการทำเรื่องต้องห้ามหรือเปล่านะคะ?"]
    },
    {
        Japanese: ["ふふ……わたくし――悪い子になってしまったのかもしれません。"],
        English: ["Hehe… Perhaps I've turned into a bad girl."],
        Chinese: ["呵呵……我或许已经变成坏孩子了呢。"],
        TraditionalChinese: [
        	"呵呵……我或許已經變成壞孩子了呢。"
        ],
        Korean: [
        	"후후…… 저, 나쁜 아이가 되어 버렸는지도 모르겠네요."
        ],
        Thai: ["ฮึฮึ... ดิฉันอาจจะกลายเป็นเด็กไม่ดีไปแล้วก็ได้ค่ะ"]
    },
    {
        Japanese: [
            "……ええ。元より、わたくしは良い子ではありません。",
            "美しいバラには棘があるように……。",
            "わたくしだって、棘を持っているのです。"
        ],
        English: [
            "…Yes. I was never a good girl to begin with.",
            "Just as beautiful roses have thorns…",
            "I have thorns of my own, too."
        ],
        Chinese: [
            "……是啊。我原本就不是个好孩子。",
            "正如美丽的玫瑰也会带刺……",
            "我也有自己的刺哦。"
        ],
        TraditionalChinese: [
            "……是啊。我原本就不是個好孩子。",
            "正如美麗的玫瑰也會帶刺……",
            "我也有自己的刺哦。"
        ],
        Korean: [
            "……네. 애초에 저는 착한 아이가 아니니까요.",
            "아름다운 장미에 가시가 있듯이…….",
            "저에게도 가시가 있답니다."
        ],
        Thai: ["...ใช่ค่ะ จริง ๆ แล้วดิฉันก็ไม่ใช่เด็กดีมาตั้งแต่แรก","เหมือนกุหลาบงามที่มีหนาม...","ดิฉันเองก็มีหนามเหมือนกันค่ะ"]
    },
    {
        Japanese: ["ええと……今聞いたことは――", "わたくしと先生だけの秘密……ですよ？"],
        English: ["Um… What you just heard—", "that's a secret between you and me, right, Sensei?"],
        Chinese: ["那个……您刚才听到的事——", "是我和老师两个人的秘密……对吧？"],
        TraditionalChinese: [
        	"那個……您剛才聽到的事——",
        	"是我和老師兩個人的秘密……對吧？"
        ],
        Korean: [
        	"그러니까…… 방금 들으신 건—",
        	"선생님과 저만의 비밀……이에요, 아시죠?"
        ],
        Thai: ["เอ่อ... เรื่องที่คุณครูเพิ่งได้ยินเมื่อกี้—","ให้เป็นความลับระหว่างคุณครูกับดิฉันสองคน... นะคะ?"]
    },
    {
        Japanese: ["秘密の花園で交わした言葉、ですからね？"],
        English: ["After all, those words were spoken in a secret garden, weren't they?"],
        Chinese: ["毕竟，那是在秘密花园里说的话嘛，对吧？"],
        TraditionalChinese: [
        	"畢竟，那是在秘密花園裡說的話嘛，對吧？"
        ],
        Korean: [
        	"비밀의 정원에서 나눈 이야기니까요."
        ],
        Thai: ["เพราะเป็นคำพูดที่เราคุยกันในสวนลับนี่นา จริงไหมคะ?"]
    }
];

const HITBOX = {
	headpat: { xMin: 1410, xMax: 1900, yMin: 215, yMax: 510, start: 'Pat2_01_M', loop: 'Pat2_02_M', end: 'PatEnd2_01_M' },
	facepat: { xMin: 1430, xMax: 1790, yMin: 510, yMax: 735, start: 'Pat_01_M', loop: 'Pat_02_M', end: 'PatEnd_01_M' },
	voiceline: { xMin: 1190, xMax: 1760, yMin: 850, yMax: 1390 }
};

const HEADPAT_CLAMP = 30;
const HEADPAT_DRAG_SCALE = 0.35;
const HEADPAT_FOLLOW_TIME = 0.055;
const HEADPAT_RETURN_TIME = 0.08;
const EYE_CLAMP_X = 200;
const EYE_CLAMP_Y = EYE_CLAMP_X * (9 / 16);
const EYE_STEP = 10;

let mousePos = { x: 0, y: 0 };
let volume = 0.5;
let mouseOptions = { voicelines: true, headpatting: true, mousetracking: true, drawHitboxes: false };

// Helper clamp function. Math does not appear to have clamp() in this version.
function clamp(num, min, max) {
	return Math.min(Math.max(num, min), max);
}

function getRenderScale(cssWidth = window.innerWidth, cssHeight = window.innerHeight) {
	const desiredScale = Math.max(window.devicePixelRatio || 1, MIN_RENDER_SCALE);
	const pixelBudgetScale = Math.sqrt(MAX_RENDER_PIXELS / Math.max(1, cssWidth * cssHeight));
	return Math.max(1, Math.min(desiredScale, MAX_RENDER_SCALE, pixelBudgetScale));
}

function syncCanvasSize(element, cssWidth, cssHeight, scale) {
	element.style.width = cssWidth + 'px';
	element.style.height = cssHeight + 'px';
	element.width = Math.max(1, Math.round(cssWidth * scale));
	element.height = Math.max(1, Math.round(cssHeight * scale));
}

// NOTE: X and Y appears to be inversely related from cursor position to bone adjustment.
//       This behavior's reason is unknown, but it LOOKS right so leave it alone!
function trackMouse() {
	let adjX = (mousePos.x / canvas.width) - 0.5;
	let adjY = (mousePos.y / canvas.height) - 0.5;
	TEye.y = TEye.y - (Math.sign(adjX) * EYE_STEP);
	TEye.x = TEye.x - (Math.sign(adjY) * EYE_STEP);
	TEye.y = clamp(TEye.y, EPointY - (Math.abs(adjX) * EYE_CLAMP_X), EPointY + (Math.abs(adjX) * EYE_CLAMP_X));
	TEye.x = clamp(TEye.x, EPointX - (Math.abs(adjY) * EYE_CLAMP_Y), EPointX + (Math.abs(adjY) * EYE_CLAMP_Y));
}

function untrackMouse() {
	if (Math.abs(TEye.y - EPointY) <= EYE_STEP && Math.abs(TEye.x - EPointX) <= EYE_STEP) {
		if (untrackerID != -1) {
			TEye.y = EPointY;
			TEye.x = EPointX;
			clearInterval(untrackerID);
			untrackerID = -1;
			acceptingClick = true;
		}
	}
	if (TEye.y > EPointY) TEye.y -= EYE_STEP;
	if (TEye.y < EPointY) TEye.y += EYE_STEP;
	if (TEye.x > EPointX) TEye.x -= EYE_STEP;
	if (TEye.x < EPointX) TEye.x += EYE_STEP;
}

function applyHeadpat(delta) {
	const dx = headpatTarget.x - headpatOffset.x;
	const dy = headpatTarget.y - headpatOffset.y;
	if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) {
		headpatOffset.set(headpatTarget.x, headpatTarget.y);
	} else {
		const blend = 1 - Math.exp(-delta / (headpatOrigin ? HEADPAT_FOLLOW_TIME : HEADPAT_RETURN_TIME));
		headpatOffset.x += dx * blend;
		headpatOffset.y += dy * blend;
	}
	TPoint.x += headpatOffset.x;
	TPoint.y += headpatOffset.y;
}

function releaseMouseOnExit() {
	if (mouseSelect === 2) {
		mouseSelect = -1;
		acceptingClick = true;
	} else if (mouseSelect !== -1) {
		releasedMouse();
	}
}

function showVoicelineSubtitle(clip) {
	const text = getSubtitleText(clip?.dialog, window.selectedLanguage, clip?.index);
	textbox.textContent = text;
	textbox.style.opacity = dialogBox && text ? 1 : 0;
}

function playVoiceline() {
	const state = spineData.state;
	const animationName = `Talk_0${currentVoiceline}`;
	const dialog = AUDIO_DETAIL[currentVoiceline - 1];
	const motion = state.setAnimation(1, `${animationName}_M`, false);
	const expression = state.setAnimation(2, `${animationName}_A`, false);
	state.addEmptyAnimation(1, 0.5, motion.animationEnd);
	state.addEmptyAnimation(2, 0.5, expression.animationEnd);

	const cues = motion.animation.timelines
		.flatMap(timeline => timeline.events || [])
		.filter(event => event.data.name === 'Talk');
	const clips = new Map(cues.map((event, index) => {
		const filename = CHARACTER + event.stringValue.slice(CHARACTER.length).toLowerCase() + '.ogg';
		const track = new Audio(`./assets/audio/${filename}`);
		track.preload = 'auto';
		track.volume = volume;
		return [event, { track, dialog, index }];
	}));

	isVoicelinePlaying = true;
	motion.listener = {
		event: (_entry, event) => {
			const clip = clips.get(event);
			if (!clip) return;
			const { track } = clip;
			currentTracks.push(clip);
			const finish = () => {
				if (!currentTracks.includes(clip)) return;
				currentTracks = currentTracks.filter(active => active !== clip);
				if (!currentTracks.length) textbox.style.opacity = 0;
			};
			track.addEventListener('ended', finish, { once: true });
			track.play().catch(finish);

			showVoicelineSubtitle(clip);
		},
		complete: () => {
			isVoicelinePlaying = false;
			acceptingClick = true;
			currentVoiceline = currentVoiceline % AUDIO_DETAIL.length + 1;
		}
	};
}

// Hitbox Scaling
function t(n, side) {
	let d = { x: { length: 2560, mid: (canvas.width / 2) }, y: { length: 1600, mid: (canvas.height / 2) } }
	n = d[side].mid - n;
	n = (d[side].length / (transpose * 2)) - n;
	n = (n - (d[side].length / (transpose * 2))) / customScale;
	return (n + (d[side].length / (transpose * 2))) * transpose;
}

function isInsideHitbox(x, y, box) {
	return x >= box.xMin && x < box.xMax && y >= box.yMin && y < box.yMax;
}

// -1 = No interaction, 1 = Pat, 2 = Voiceline, 3 = Eye tracking
function pressedMouse(x, y) {
	const tx = t(x, 'x');
	const ty = t(y, 'y');
	const pat = [HITBOX.headpat, HITBOX.facepat].find(box => isInsideHitbox(tx, ty, box));
	if (pat && mouseOptions.headpatting) {
		spineData.state.setAnimation(1, pat.start, false);
		spineData.state.addAnimation(1, pat.loop, true, 0);
		headpatOrigin = { x, y, endAnimation: pat.end };
		mouseSelect = 1;
	}
	else if (isInsideHitbox(tx, ty, HITBOX.voiceline) && mouseOptions.voicelines) {
		mouseSelect = 2;
	}
	else if (mouseOptions.mousetracking) {
		if (trackerID == -1) {
			trackerID = setInterval(trackMouse, 20);
		}
		spineData.state.setEmptyAnimation(1, 0);
		spineData.state.setEmptyAnimation(2, 0);
		let eyetracking = spineData.state.addAnimation(1, 'Look_01_M', false, 0);
		eyetracking.mixDuration = 0.2;
		mousePos.x = x;
		mousePos.y = y;
		mouseSelect = 3;
	}
	else {
		// Mouse tracking is disabled and click is not in any specific area
		// Set mouseSelect to -1 to indicate no interaction, this prevents
		// releasedMouse from triggering any animation on mouseup
		mouseSelect = -1;
		acceptingClick = true;
	}
}

function drawHitboxes() {
	if (!overlay || !overlay.getContext) return;
	const ctx = overlay.getContext('2d');
	if (!ctx) return;

	ctx.clearRect(0, 0, overlay.width, overlay.height);
	if (!mouseOptions.drawHitboxes) return;

	
	ctx.save();
	ctx.lineWidth = 2 * renderScale;
	ctx.strokeStyle = 'red';
	ctx.globalAlpha = 0.5;

	function worldToScreen(n, side) {
		let d = { x: { length: 2560, mid: (canvas.width / 2) }, y: { length: 1600, mid: (canvas.height / 2) } };
		n = (n / transpose) - (d[side].length / (transpose * 2));
		n = n * customScale + (d[side].length / (transpose * 2));
		n = (d[side].length / (transpose * 2)) - n;
		const offset = side === 'x' ? canvas.width * positionX : canvas.height * positionY;
		return d[side].mid - n + offset;
	}

	for (const key in HITBOX) {
		const box = HITBOX[key];
		const x1 = worldToScreen(box.xMin, 'x');
		const y1 = worldToScreen(box.yMin, 'y');
		const x2 = worldToScreen(box.xMax, 'x');
		const y2 = worldToScreen(box.yMax, 'y');
		const width = x2 - x1;
		const height = y1 - y2;
		ctx.strokeRect(x1, y2, width, height);
	}

	ctx.restore();
}

function movedMouse(x, y) {
	switch (mouseSelect) {
		case 1: {
			const scale = HEADPAT_DRAG_SCALE * transpose / customScale;
			const parent = TPoint.parent;
			headpatTarget.set(
				parent.worldX + (x - headpatOrigin.x) * scale,
				parent.worldY + (headpatOrigin.y - y) * scale
			);
			parent.worldToLocal(headpatTarget);
			const distance = headpatTarget.length();
			if (distance > HEADPAT_CLAMP) {
				headpatTarget.x *= HEADPAT_CLAMP / distance;
				headpatTarget.y *= HEADPAT_CLAMP / distance;
			}
			break;
		}
		case 2:
			mouseSelect = -1;
			acceptingClick = true;
			break;
		case 3:
			mousePos.x = x;
			mousePos.y = y;
			break;
		default:
	}
}

function releasedMouse() {
	switch (mouseSelect) {
		case 1: {
			const { endAnimation } = headpatOrigin;
			headpatOrigin = null;
			headpatTarget.set(0, 0);
			const state = spineData.state;
			const motion = state.setAnimation(1, endAnimation, false);
			state.addEmptyAnimation(1, 0.5, motion.animationEnd);
			headpatCooldown = setTimeout(() => {
				headpatCooldown = 0;
				acceptingClick = true;
			}, 500);
			break;
		}
		case 2:
			playVoiceline();
			break;
		case 3:
			if (trackerID != -1) {
				clearInterval(trackerID);
				trackerID = -1;
			}
			if (untrackerID == -1) {
				untrackerID = setInterval(untrackMouse, 20);
			}
			let eyetracking = spineData.state.setAnimation(1, 'LookEnd_01_M', false);
			eyetracking.mixDuration = 0;
			spineData.state.addEmptyAnimation(1, 0.5, 0);
			spineData.state.addEmptyAnimation(2, 0.5, 0);
			break;
		default:
	}
	mouseSelect = -1;
}

// adjusts mouse values for flipped canvas
function setMouse(event) {
	const rect = canvas.getBoundingClientRect();
	let ax = (event.clientX - rect.left) * renderScale;
	let ay = (event.clientY - rect.top) * renderScale;
	if (flipped) {
		ax = canvas.width - ax;
	}

	return { x: ax - canvas.width * positionX, y: ay - canvas.height * positionY };
}

function getSubtitleText(dialog, language, index) {
	let text = dialog?.[language]?.[index];
	if (text == null && language === 'Thai') {
		language = 'English';
		text = dialog?.[language]?.[index];
	}
	textbox.lang = subtitleLocales[language];
	return text ?? "";
}

function updateSubtitleLanguage() {
	let language = subtitleLanguagePreference;
	if (language === 'auto') {
		const locale = interfaceLanguage === 'default' ? steamLanguage : interfaceLanguage;
		const [primary, region] = locale.split(/[-_]/);
		if (primary === 'tchinese' || (primary === 'zh' && ['cht', 'hant', 'tw', 'hk', 'mo'].includes(region))) {
			language = 'TraditionalChinese';
		} else if (primary === 'schinese' || primary === 'zh') {
			language = 'Chinese';
		} else if (primary === 'ja' || primary === 'japanese') {
			language = 'Japanese';
		} else if (primary === 'ko' || primary === 'korean' || primary === 'koreana') {
			language = 'Korean';
		} else if (primary === 'th' || primary === 'thai') {
			language = 'Thai';
		} else {
			language = 'English';
		}
	}

	if (language === window.selectedLanguage) return;
	window.selectedLanguage = language;
	textbox.lang = subtitleLocales[language];
	showVoicelineSubtitle(currentTracks.at(-1));
}

function init() {
	// Wallpaper Engine settings
	window.wallpaperPropertyListener = {
		applyGeneralProperties: (props) => {
			const language = props.language?.value ?? props.language;
			const steamLocale = props.steamlanguage?.value ?? props.steamlanguage;
			if (typeof language !== 'string' && typeof steamLocale !== 'string') return;
			if (typeof language === 'string') interfaceLanguage = language.toLowerCase();
			if (typeof steamLocale === 'string') steamLanguage = steamLocale.toLowerCase();
			updateSubtitleLanguage();
		},
		applyUserProperties: (props) => {
			if (props.schemecolor) {
				bufferColor = props.schemecolor.value.split(" ");
			}
			if (props.alignmentfliph) flipped = props.alignmentfliph.value;
			if (props.scale) {
				customScale = props.scale.value;
				document.documentElement.style.setProperty('--wallpaper-scale', customScale);
			}
			if (props.positionx) {
				positionX = props.positionx.value / 100;
				document.documentElement.style.setProperty('--wallpaper-position-x', props.positionx.value + 'vw');
			}
			if (props.positiony) {
				positionY = props.positiony.value / 100;
				document.documentElement.style.setProperty('--wallpaper-position-y', props.positiony.value + 'vh');
			}
			if (props.scale || props.positionx || props.positiony) resize();
			if (props.targetfps) targetFps = props.targetfps.value;

			if (props.introanimation) introAnimation = props.introanimation.value;

			if (props.mousetracking) {
				const wasEnabled = mouseOptions.mousetracking;
				mouseOptions.mousetracking = props.mousetracking.value;

				if (wasEnabled && !mouseOptions.mousetracking) {
					if (trackerID != -1) {
						clearInterval(trackerID);
						trackerID = -1;
					}
					if (untrackerID != -1) {
						clearInterval(untrackerID);
						untrackerID = -1;
					}
					if (spineData && mouseSelect === 3) {
						spineData.state.setEmptyAnimation(1, 0);
						spineData.state.setEmptyAnimation(2, 0);
						mouseSelect = -1;
						TEye.x = EPointX;
						TEye.y = EPointY;
						acceptingClick = true;
					}
				}
			}
			if (props.headpatting) mouseOptions.headpatting = props.headpatting.value;
			if (props.voicelines) mouseOptions.voicelines = props.voicelines.value;
			if (props.voicevolume) volume = props.voicevolume.value / 100;
			if (props.showdialog) dialogBox = props.showdialog.value;
			if (props.dialogx) textbox.style.left = props.dialogx.value + '%';
			if (props.dialogy) textbox.style.top = props.dialogy.value + '%';
			if (props.drawHitboxes) mouseOptions.drawHitboxes = props.drawHitboxes.value;
			if (props.lensflare) {
				showLensflare = props.lensflare.value;
				if (spineData) updateLensflareOpacity(spineData.skeleton.data);
			}

			// 监听模型分辨率设置
			if (props.modelresolution) modelResolution = props.modelresolution.value;
			if (assetManager && typeof introAnimation !== 'undefined' && !modelFrame &&
				(props.modelresolution || loadingResolution !== modelResolution)) {
				reloadModel();
			}

			if (props.dialoglanguage) {
				const language = props.dialoglanguage.value;
				subtitleLanguagePreference = Object.hasOwn(subtitleLocales, language) ? language : 'auto';
				updateSubtitleLanguage();
			}
			if (props.showdialog) {
				showVoicelineSubtitle(currentTracks[currentTracks.length - 1]);
			}

			if (props.bgmfile) {
				bgmfile = 'file:///' + props.bgmfile.value.replace("%3A", "\:");
			}
			if (props.bgmvolume) {
				bgmvolume = props.bgmvolume.value / 100;
				if (bgm) bgm.volume = bgmvolume;
			}
		},
		setPaused: function(isPaused) {
				if (bgm) {
					if (isPaused) {
						setTimeout(() => { bgm.volume = 0; }, 200);
					} else {
						setTimeout(() => { bgm.volume = bgmvolume; }, 200);
					}
				}
			}
	};

	textbox = document.getElementById('textbox');
	textbox.lang = subtitleLocales[window.selectedLanguage];

	canvas = document.getElementById('canvas');
	canvas.addEventListener('mouseleave', releaseMouseOnExit);
	window.addEventListener('blur', releaseMouseOnExit);
	canvas.addEventListener('mousedown', function (event) {
		if (!spineData || isVoicelinePlaying || !acceptingClick) {
			return;
		}
		acceptingClick = false;
		let mouseData = setMouse(event);
		pressedMouse(mouseData.x, mouseData.y);
	});
	canvas.addEventListener('mouseup', function () {
		if (mouseSelect !== -1) releasedMouse();
	});
	canvas.addEventListener('mousemove', function (event) {
		let mouseData = setMouse(event);
		movedMouse(mouseData.x, mouseData.y);
	});

	overlay = document.getElementById('overlay');
	renderScale = getRenderScale();
	syncCanvasSize(canvas, window.innerWidth, window.innerHeight, renderScale);
	syncCanvasSize(overlay, window.innerWidth, window.innerHeight, renderScale);

	let config = { alpha: false, premultipliedAlpha: false, antialias: true, powerPreference: 'high-performance' };
	gl = canvas.getContext('webgl', config) || canvas.getContext('experimental-webgl', config);
	if (!gl) {
		alert('WebGL is unavailable.');
		return;
	}

	// Create a simple shader, mesh, model-view-projection matrix, SkeletonRenderer, and AssetManager.
	shader = spine.Shader.newTwoColoredTextured(gl);
	batcher = new spine.PolygonBatcher(gl);
	mvp.ortho2d(0, 0, canvas.width - 1, canvas.height - 1);
	skeletonRenderer = new spine.SkeletonRenderer(gl);
	assetManager = new spine.AssetManager(gl);

	window.addEventListener('resize', resize);
	initialLoadTimer = setTimeout(() => {
		if (typeof introAnimation === 'undefined') introAnimation = true;
		if (loadingResolution === undefined && !modelFrame) reloadModel();
	}, 350);

	window.addEventListener('pagehide', event => {
		if (event.persisted) return;
		canvas.style.visibility = 'hidden';
		clearTimeout(initialLoadTimer);
		cancelAnimationFrame(modelFrame);
		cancelAnimationFrame(renderFrame);
		clearTimeout(renderTimer);
		gl.getExtension('WEBGL_lose_context')?.loseContext();
	});
}

// Function to reload the model with a new resolution
function reloadModel() {
	if (!assetManager || modelFrame) return;
	acceptingClick = false;
	mouseSelect = -1;
	clearInterval(trackerID);
	clearInterval(untrackerID);
	trackerID = -1;
	untrackerID = -1;
	clearTimeout(headpatCooldown);
	headpatCooldown = 0;
	headpatOrigin = null;
	headpatTarget.set(0, 0);
	headpatOffset.set(0, 0);

	// Stop the current BGM if it's playing
	if (bgm) {
		bgm.pause();
		bgm = null;
	}

	// Stop and clear all voiceline audio tracks
	currentTracks.forEach(({ track }) => {
		if (track && !track.paused) {
			track.pause();
			track.currentTime = 0;
		}
	});
	currentTracks = [];
	
	isVoicelinePlaying = false;
	
	// Hide dialog box
	if (textbox) {
		textbox.style.opacity = 0;
	}
	
	canvas.style.visibility = 'hidden';
	cancelAnimationFrame(renderFrame);
	clearTimeout(renderTimer);
	spineData = null;
	assetManager.removeAll();
	loadingResolution = modelResolution;
	const binaryPath = new URL(`assets/${modelResolution}/${CHARACTER}_home.skel`, document.baseURI).href;
	const atlasPath = new URL(`assets/${modelResolution}/${CHARACTER}_home.atlas`, document.baseURI).href;
	assetManager.loadBinary(binaryPath);
	assetManager.loadTextureAtlas(atlasPath, (_path, atlas) => {
		for (const page of atlas.pages) {
			const { width, height } = page.texture.getImage();
			// WebGL 1 requires power-of-two dimensions for mipmaps.
			if ((width & (width - 1)) || (height & (height - 1))) continue;
			const minFilter = spine.TextureFilter.MipMapLinearLinear;
			const magFilter = spine.TextureFilter.Linear;
			if (page.minFilter === minFilter && page.magFilter === magFilter) continue;
			page.minFilter = minFilter;
			page.magFilter = magFilter;
			page.texture.setFilters(minFilter, magFilter);
		}
	});
	function waitForAssets() {
		if (!assetManager.isLoadingComplete()) {
			modelFrame = requestAnimationFrame(waitForAssets);
			return;
		}
		modelFrame = 0;
		if (loadingResolution !== modelResolution) {
			reloadModel();
			return;
		}
		if (assetManager.get(binaryPath) && assetManager.get(atlasPath)) {
			load(binaryPath, atlasPath);
		} else {
			console.error('Model assets not found for resolution: ' + loadingResolution);
			loadingResolution = undefined;
		}
	}
	modelFrame = requestAnimationFrame(waitForAssets);
}

// CITATION: http://esotericsoftware.com/spine-api-reference#
// CITATION: http://en.esotericsoftware.com/forum/Spine-Unity-Making-the-arm-follow-the-mouse-7856
function interactionLoad() {
	// Touch_Point and Touch_Eye
	TPoint = spineData.skeleton.findBone('Touch_Point');
	TEye = spineData.skeleton.findBone('Touch_Eye');
	EPointX = TEye.x;
	EPointY = TEye.y;
}

function load(dynamicBinaryPath, dynamicAtlasPath) {
	spineData = loadSpineData(dynamicBinaryPath, dynamicAtlasPath, false);

	const state = spineData.state;
	if (introAnimation) {
		const intro = state.setAnimation(0, 'Start_Idle_01', false);
		const idle = state.addAnimation(0, 'Idle_01', true, intro.animationEnd);
		idle.listener = { start: () => { acceptingClick = true; } };
	} else {
		state.setAnimation(0, 'Idle_01', true);
		acceptingClick = true;
	}

	interactionLoad();
	resize();

	// Plays user-defined BGM (if set)
	if (!bgm) {
		bgm = new Audio(bgmfile);
		bgm.volume = bgmvolume;
		bgm.loop = true;
		bgm.play().catch(() => {});
	}

	lastFrameTime = Date.now() / 1000;
	// Call render every frame.
	render();
	canvas.style.visibility = 'visible';
}

function loadSpineData(binaryPath, atlasPath, premultipliedAlpha) {
	// Load the texture atlas from the AssetManager.
	let atlas = assetManager.get(atlasPath);

	// Create a AtlasAttachmentLoader that resolves region, mesh, boundingbox and path attachments
	let atlasLoader = new spine.AtlasAttachmentLoader(atlas);

	// Create a SkeletonBinary instance for parsing the .skel file.
	let skeletonBinary = new spine.SkeletonBinary(atlasLoader);

	// Set the scale to apply during parsing, parse the file, and create a new skeleton.
	skeletonBinary.scale = 1;
	let skeletonData = skeletonBinary.readSkeletonData(assetManager.get(binaryPath));
	updateLensflareOpacity(skeletonData);
	let skeleton = new spine.Skeleton(skeletonData);
	let bounds = calculateSetupPoseBounds(skeleton);

	// Create an AnimationState, and set the initial animation in looping mode.
	let animationStateData = new spine.AnimationStateData(skeleton.data);
	animationStateData.defaultMix = 0.5;
	let animationState = new spine.AnimationState(animationStateData);

	// Pack everything up and return to caller.
	return { skeleton: skeleton, state: animationState, bounds: bounds, premultipliedAlpha: premultipliedAlpha };
}

function calculateSetupPoseBounds(skeleton) {
	skeleton.setToSetupPose();
	skeleton.updateWorldTransform(spine.Physics.update);
	let offset = new spine.Vector2();
	let size = new spine.Vector2();
	skeleton.getBounds(offset, size, []);
	return { offset: offset, size: size };
}

let showLensflare = true;
const LENSFLARE_SLOTS = new Set();
const BROAD_LIGHT_NAME = /sun[ _-]*(?:light|flare)|(?:top|diffuse)[ _-]*light|(?:^|\/)fx[_ -]light[_ -]\d|lens[ e_-]*flare/i;
const lensflareOpacity = new WeakMap();

function updateLensflareOpacity(skeletonData) {
	for (const skin of skeletonData.skins) {
		for (const { slotIndex, name, attachment } of skin.getAttachments()) {
			const slot = skeletonData.slots[slotIndex];
			if (slot.blendMode !== 1 || !attachment.color) continue;
			if (!LENSFLARE_SLOTS.has(slot.name) && !BROAD_LIGHT_NAME.test(slot.name + " " + name)) continue;
			if (!lensflareOpacity.has(attachment)) lensflareOpacity.set(attachment, attachment.color.a);
			attachment.color.a = lensflareOpacity.get(attachment) * (showLensflare ? 0.24 : 0);
		}
	}
}

function render() {
    let now = Date.now() / 1000;
    let delta = now - lastFrameTime;

    lastFrameTime = now;

    gl.clearColor(bufferColor[0], bufferColor[1], bufferColor[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Only render if spineData is available
    if (spineData) {
        // Apply the animation state based on the delta time.
        let skeleton = spineData.skeleton;
        let state = spineData.state;
        let premultipliedAlpha = spineData.premultipliedAlpha;
        state.update(delta);
		state.apply(skeleton);
		

        const pointX = TPoint.x;
        const pointY = TPoint.y;
        applyHeadpat(delta);
        skeleton.updateWorldTransform(spine.Physics.update);
        TPoint.x = pointX;
        TPoint.y = pointY;

        // Bind the shader and set the texture and model-view-projection matrix.
        shader.bind();
        // 修改这两行，从 spine.webgl.Shader 改为 spine.Shader
        shader.setUniformi(spine.Shader.SAMPLER, 0);
        shader.setUniform4x4f(spine.Shader.MVP_MATRIX, mvp.values);

        // Start the batch and tell the SkeletonRenderer to render the active skeleton.
        batcher.begin(shader);
        skeletonRenderer.premultipliedAlpha = premultipliedAlpha;
        skeletonRenderer.draw(batcher, skeleton);
        batcher.end();

        shader.unbind();
    }

    // throttle fps
	let elapsed = Date.now() / 1000 - now;
	let targetFrameTime = 1 / targetFps;
	let delay = Math.max(targetFrameTime - elapsed, 0) * 1000;

	drawHitboxes();

	renderTimer = setTimeout(() => {
		renderFrame = requestAnimationFrame(render);
	}, delay);
}

function resize() {
	let w = window.innerWidth;
	let h = window.innerHeight;
	renderScale = getRenderScale();
	syncCanvasSize(canvas, w, h, renderScale);
	syncCanvasSize(overlay, w, h, renderScale);

	// Set values to position skeleton to center of canvas.
	// Will always attempt to Fit to Fill while maintaining aspect ratio. As a result, a scale of [1] will mean different things across various device resolutions.
	let centerX = 0;
	let centerY = 800;
	let wr = canvas.width / 2560;
	let hr = canvas.height / 1600;
	let width = (2560 / customScale);
	let height = (1600 / customScale);

	if (wr < hr) {
		width = height * (canvas.width / canvas.height);

		transpose = 1600 / canvas.height;
	}
	else if (wr > hr) {
		height = width * (canvas.height / canvas.width);

		transpose = 2560 / canvas.width;
	}
	else {
		transpose = 1600 / canvas.height;
	}

	mvp.ortho2d(centerX - width / 2 - positionX * width, centerY - height / 2 + positionY * height, width, height);
	gl.viewport(0, 0, canvas.width, canvas.height);
}

init();
