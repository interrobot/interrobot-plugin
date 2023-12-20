"use strict";
/*!
 * Stopwords themselves (c)?2023:
 * Source: NLTK (python natural language toolkit)
 * Apache License 2.0
 * from nltk.corpus import stopwords
 * print(json.dumps(stopwords.words('english'), ensure_ascii=False))
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stopwords = void 0;
class Stopwords {
    static getStopwordsTruth(lang) {
        // generally a much faster approach over indexOf
        const words = this.getStopwords(lang);
        return words.reduce((obj, key, index) => ({ ...obj, [key]: true }), {});
    }
    static getStopwords(lang) {
        switch (lang) {
            case "de":
                return ["aber", "alle", "allem", "allen", "aller", "alles", "als", "also", "am", "an", "ander", "andere",
                    "anderem", "anderen", "anderer", "anderes", "anderm", "andern", "anderr", "anders", "auch", "auf",
                    "aus", "bei", "bin", "bis", "bist", "da", "damit", "dann", "der", "den", "des", "dem", "die", "das",
                    "dass", "daß", "derselbe", "derselben", "denselben", "desselben", "demselben", "dieselbe",
                    "dieselben", "dasselbe", "dazu", "dein", "deine", "deinem", "deinen", "deiner", "deines", "denn",
                    "derer", "dessen", "dich", "dir", "du", "dies", "diese", "diesem", "diesen", "dieser", "dieses",
                    "doch", "dort", "durch", "ein", "eine", "einem", "einen", "einer", "eines", "einig", "einige",
                    "einigem", "einigen", "einiger", "einiges", "einmal", "er", "ihn", "ihm", "es", "etwas", "euer",
                    "eure", "eurem", "euren", "eurer", "eures", "für", "gegen", "gewesen", "hab", "habe", "haben", "hat",
                    "hatte", "hatten", "hier", "hin", "hinter", "ich", "mich", "mir", "ihr", "ihre", "ihrem", "ihren",
                    "ihrer", "ihres", "euch", "im", "in", "indem", "ins", "ist", "jede", "jedem", "jeden", "jeder", "jedes",
                    "jene", "jenem", "jenen", "jener", "jenes", "jetzt", "kann", "kein", "keine", "keinem", "keinen",
                    "keiner", "keines", "können", "könnte", "machen", "man", "manche", "manchem", "manchen", "mancher",
                    "manches", "mein", "meine", "meinem", "meinen", "meiner", "meines", "mit", "muss", "musste", "nach",
                    "nicht", "nichts", "noch", "nun", "nur", "ob", "oder", "ohne", "sehr", "sein", "seine", "seinem",
                    "seinen", "seiner", "seines", "selbst", "sich", "sie", "ihnen", "sind", "so", "solche", "solchem",
                    "solchen", "solcher", "solches", "soll", "sollte", "sondern", "sonst", "über", "um", "und", "uns",
                    "unsere", "unserem", "unseren", "unser", "unseres", "unter", "viel", "vom", "von", "vor", "während",
                    "war", "waren", "warst", "was", "weg", "weil", "weiter", "welche", "welchem", "welchen", "welcher",
                    "welches", "wenn", "werde", "werden", "wie", "wieder", "will", "wir", "wird", "wirst", "wo", "wollen",
                    "wollte", "würde", "würden", "zu", "zum", "zur", "zwar", "zwischen"];
            case "en":
                return ["i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "you're", "you've", "you'll",
                    "you'd", "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "she's",
                    "her", "hers", "herself", "it", "it's", "its", "itself", "they", "them", "their", "theirs",
                    "themselves", "what", "which", "who", "whom", "this", "that", "that'll", "these", "those", "am", "is",
                    "are", "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did",
                    "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", "while", "of", "at",
                    "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after",
                    "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", "again",
                    "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both",
                    "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same",
                    "so", "than", "too", "very", "s", "t", "can", "will", "just", "don", "don't", "should", "should've",
                    "now", "d", "ll", "m", "o", "re", "ve", "y", "ain", "aren", "aren't", "couldn", "couldn't", "didn",
                    "didn't", "doesn", "doesn't", "hadn", "hadn't", "hasn", "hasn't", "haven", "haven't", "isn", "isn't",
                    "ma", "mightn", "mightn't", "mustn", "mustn't", "needn", "needn't", "shan", "shan't", "shouldn",
                    "shouldn't", "wasn", "wasn't", "weren", "weren't", "won", "won't", "wouldn", "wouldn't"];
            case "fr":
                return ["au", "aux", "avec", "ce", "ces", "dans", "de", "des", "du", "elle", "en", "et", "eux", "il", "ils",
                    "je", "la", "le", "les", "leur", "lui", "ma", "mais", "me", "même", "mes", "moi", "mon", "ne", "nos",
                    "notre", "nous", "on", "ou", "par", "pas", "pour", "qu", "que", "qui", "sa", "se", "ses", "son", "sur",
                    "ta", "te", "tes", "toi", "ton", "tu", "un", "une", "vos", "votre", "vous", "c", "d", "j", "l", "à", "m",
                    "n", "s", "t", "y", "été", "étée", "étées", "étés", "étant", "étante", "étants", "étantes", "suis", "es",
                    "est", "sommes", "êtes", "sont", "serai", "seras", "sera", "serons", "serez", "seront", "serais", "serait",
                    "serions", "seriez", "seraient", "étais", "était", "étions", "étiez", "étaient", "fus", "fut", "fûmes",
                    "fûtes", "furent", "sois", "soit", "soyons", "soyez", "soient", "fusse", "fusses", "fût", "fussions",
                    "fussiez", "fussent", "ayant", "ayante", "ayantes", "ayants", "eu", "eue", "eues", "eus", "ai", "as",
                    "avons", "avez", "ont", "aurai", "auras", "aura", "aurons", "aurez", "auront", "aurais", "aurait",
                    "aurions", "auriez", "auraient", "avais", "avait", "avions", "aviez", "avaient", "eut", "eûmes", "eûtes",
                    "eurent", "aie", "aies", "ait", "ayons", "ayez", "aient", "eusse", "eusses", "eût", "eussions", "eussiez",
                    "eussent"];
            case "pt":
                return ["a", "à", "ao", "aos", "aquela", "aquelas", "aquele", "aqueles", "aquilo", "as", "às", "até", "com",
                    "como", "da", "das", "de", "dela", "delas", "dele", "deles", "depois", "do", "dos", "e", "é", "ela", "elas",
                    "ele", "eles", "em", "entre", "era", "eram", "éramos", "essa", "essas", "esse", "esses", "esta", "está",
                    "estamos", "estão", "estar", "estas", "estava", "estavam", "estávamos", "este", "esteja", "estejam",
                    "estejamos", "estes", "esteve", "estive", "estivemos", "estiver", "estivera", "estiveram", "estivéramos",
                    "estiverem", "estivermos", "estivesse", "estivessem", "estivéssemos", "estou", "eu", "foi", "fomos", "for",
                    "fora", "foram", "fôramos", "forem", "formos", "fosse", "fossem", "fôssemos", "fui", "há", "haja", "hajam",
                    "hajamos", "hão", "havemos", "haver", "hei", "houve", "houvemos", "houver", "houvera", "houverá", "houveram",
                    "houvéramos", "houverão", "houverei", "houverem", "houveremos", "houveria", "houveriam", "houveríamos",
                    "houvermos", "houvesse", "houvessem", "houvéssemos", "isso", "isto", "já", "lhe", "lhes", "mais", "mas",
                    "me", "mesmo", "meu", "meus", "minha", "minhas", "muito", "na", "não", "nas", "nem", "no", "nos", "nós",
                    "nossa", "nossas", "nosso", "nossos", "num", "numa", "o", "os", "ou", "para", "pela", "pelas", "pelo",
                    "pelos", "por", "qual", "quando", "que", "quem", "são", "se", "seja", "sejam", "sejamos", "sem", "ser",
                    "será", "serão", "serei", "seremos", "seria", "seriam", "seríamos", "seu", "seus", "só", "somos", "sou",
                    "sua", "suas", "também", "te", "tem", "tém", "temos", "tenha", "tenham", "tenhamos", "tenho", "terá",
                    "terão", "terei", "teremos", "teria", "teriam", "teríamos", "teu", "teus", "teve", "tinha", "tinham",
                    "tínhamos", "tive", "tivemos", "tiver", "tivera", "tiveram", "tivéramos", "tiverem", "tivermos", "tivesse",
                    "tivessem", "tivéssemos", "tu", "tua", "tuas", "um", "uma", "você", "vocês", "vos"];
            case "ru":
                return ["и", "в", "во", "не", "что", "он", "на", "я", "с", "со", "как", "а", "то", "все", "она", "так", "его",
                    "но", "да", "ты", "к", "у", "же", "вы", "за", "бы", "по", "только", "ее", "мне", "было", "вот", "от", "меня",
                    "еще", "нет", "о", "из", "ему", "теперь", "когда", "даже", "ну", "вдруг", "ли", "если", "уже", "или", "ни",
                    "быть", "был", "него", "до", "вас", "нибудь", "опять", "уж", "вам", "ведь", "там", "потом", "себя", "ничего",
                    "ей", "может", "они", "тут", "где", "есть", "надо", "ней", "для", "мы", "тебя", "их", "чем", "была", "сам",
                    "чтоб", "без", "будто", "чего", "раз", "тоже", "себе", "под", "будет", "ж", "тогда", "кто", "этот", "того",
                    "потому", "этого", "какой", "совсем", "ним", "здесь", "этом", "один", "почти", "мой", "тем", "чтобы", "нее",
                    "сейчас", "были", "куда", "зачем", "всех", "никогда", "можно", "при", "наконец", "два", "об", "другой", "хоть",
                    "после", "над", "больше", "тот", "через", "эти", "нас", "про", "всего", "них", "какая", "много", "разве",
                    "три", "эту", "моя", "впрочем", "хорошо", "свою", "этой", "перед", "иногда", "лучше", "чуть", "том", "нельзя",
                    "такой", "им", "более", "всегда", "конечно", "всю", "между"];
            case "sp":
                return ["de", "la", "que", "el", "en", "y", "a", "los", "del", "se", "las", "por", "un", "para", "con", "no",
                    "una", "su", "al", "lo", "como", "más", "pero", "sus", "le", "ya", "o", "este", "sí", "porque", "esta",
                    "entre", "cuando", "muy", "sin", "sobre", "también", "me", "hasta", "hay", "donde", "quien", "desde",
                    "todo", "nos", "durante", "todos", "uno", "les", "ni", "contra", "otros", "ese", "eso", "ante", "ellos",
                    "e", "esto", "mí", "antes", "algunos", "qué", "unos", "yo", "otro", "otras", "otra", "él", "tanto", "esa",
                    "estos", "mucho", "quienes", "nada", "muchos", "cual", "poco", "ella", "estar", "estas", "algunas",
                    "algo", "nosotros", "mi", "mis", "tú", "te", "ti", "tu", "tus", "ellas", "nosotras", "vosotros",
                    "vosotras", "os", "mío", "mía", "míos", "mías", "tuyo", "tuya", "tuyos", "tuyas", "suyo", "suya", "suyos",
                    "suyas", "nuestro", "nuestra", "nuestros", "nuestras", "vuestro", "vuestra", "vuestros", "vuestras",
                    "esos", "esas", "estoy", "estás", "está", "estamos", "estáis", "están", "esté", "estés", "estemos",
                    "estéis", "estén", "estaré", "estarás", "estará", "estaremos", "estaréis", "estarán", "estaría",
                    "estarías", "estaríamos", "estaríais", "estarían", "estaba", "estabas", "estábamos", "estabais", "estaban",
                    "estuve", "estuviste", "estuvo", "estuvimos", "estuvisteis", "estuvieron", "estuviera", "estuvieras",
                    "estuviéramos", "estuvierais", "estuvieran", "estuviese", "estuvieses", "estuviésemos", "estuvieseis",
                    "estuviesen", "estando", "estado", "estada", "estados", "estadas", "estad", "he", "has", "ha", "hemos",
                    "habéis", "han", "haya", "hayas", "hayamos", "hayáis", "hayan", "habré", "habrás", "habrá", "habremos",
                    "habréis", "habrán", "habría", "habrías", "habríamos", "habríais", "habrían", "había", "habías", "habíamos",
                    "habíais", "habían", "hube", "hubiste", "hubo", "hubimos", "hubisteis", "hubieron", "hubiera", "hubieras",
                    "hubiéramos", "hubierais", "hubieran", "hubiese", "hubieses", "hubiésemos", "hubieseis", "hubiesen",
                    "habiendo", "habido", "habida", "habidos", "habidas", "soy", "eres", "es", "somos", "sois", "son", "sea",
                    "seas", "seamos", "seáis", "sean", "seré", "serás", "será", "seremos", "seréis", "serán", "sería", "serías",
                    "seríamos", "seríais", "serían", "era", "eras", "éramos", "erais", "eran", "fui", "fuiste", "fue", "fuimos",
                    "fuisteis", "fueron", "fuera", "fueras", "fuéramos", "fuerais", "fueran", "fuese", "fueses", "fuésemos",
                    "fueseis", "fuesen", "sintiendo", "sentido", "sentida", "sentidos", "sentidas", "siente", "sentid", "tengo",
                    "tienes", "tiene", "tenemos", "tenéis", "tienen", "tenga", "tengas", "tengamos", "tengáis", "tengan",
                    "tendré", "tendrás", "tendrá", "tendremos", "tendréis", "tendrán", "tendría", "tendrías", "tendríamos",
                    "tendríais", "tendrían", "tenía", "tenías", "teníamos", "teníais", "tenían", "tuve", "tuviste", "tuvo",
                    "tuvimos", "tuvisteis", "tuvieron", "tuviera", "tuvieras", "tuviéramos", "tuvierais", "tuvieran",
                    "tuviese", "tuvieses", "tuviésemos", "tuvieseis", "tuviesen", "teniendo", "tenido", "tenida", "tenidos",
                    "tenidas", "tened"];
            case "":
                // for bypass stemmer
                return [];
            default:
                const warnMessage = `Language ${lang} not currently supported. Stopwords are disabled.`;
                console.warn(warnMessage);
                return [];
        }
    }
}
exports.Stopwords = Stopwords;
