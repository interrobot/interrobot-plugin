// Wordcloud, EN only. Take web copy, pull out interesting words.
//  Present aforementioned words as "cloud."

import { Plugin } from "../../../src/ts/core/plugin";
import { SearchQueryType, SearchQuery, Search, SearchResult, Project, PluginData } from "../../../src/ts/core/api";
import { HtmlProcessingWidget } from "../../../src/ts/ui/processing";
import { Templates } from "../../../src/ts/ui/templates";
import { Stopwords } from "../../../src/ts/core/stopwords";
import { Typo } from "../../../src/ts/lib/typo/typo";
import { HtmlUtils } from "../../../src/ts/core/html";
import { HtmlResultsTable, HTMLResultsTableSort, SortOrder } from "../../../src/ts/ui/table";

// d3 is modular, and not friendly outside npm
// don't bother, not worth the effort to reconcile types
declare var d3: any;
declare var d3cloud: any;

interface WordData {
    text: string;
    value: number;
    fontFamily: string;
    x?: number;
    y?: number;
    rotate?: number;
}

interface CloudWordLayoutMemo {
    count: number;
    min: number;
    max: number;
    minLog: number;
    maxLog: number;
}

interface PluginMeta {
    title: string;
    category: string;
    version: string;
    author: string;
    synopsis: string;
    description: string;
}

class WordcloudLayout {

    public readonly id: number;
    public readonly name: string;
    public readonly spiral: string;
    public readonly separated: boolean; // measured layout with padding

    public constructor(id: number, name: string, spiral: string, separated: boolean) {
        if (["archimedean", "rectangular"].indexOf(spiral) === -1){
            throw new Error("invalid spiral value");
        }
        this.id = id;
        this.name = name;
        this.spiral = spiral;
        this.separated = separated;
    }

    public toString(): string {
        return `{ id: ${this.id}, name: ${this.name}, spiral: ${this.spiral}, separated: ${this.separated},]`
    }
}

class WordcloudWord {

    // fine displayed result, each SearchResult can contain many of these (or none at all)
    public readonly word: string;
    private count: number = 0;

    public constructor(word: string, count: number) {
        this.word = word;
        this.count = count;
    }

    public incrementCount() {
        this.count++;
    }

    public getCount(): number {
        return this.count;
    }

    public getWord(): string {
        return this.word;
    }

    public toString(): string {
        return `[${this.word} => ${this.count}]`
    }
}

class Wordcloud extends Plugin {

    public static override readonly meta: PluginMeta = {
        "title": "Website Word Cloud",
        "category": "Visualization",
        "version": "1.0.1",
        "author": "InterroBot",
        "synopsis": `create a wordcloud from website content`,
        "description": `Relive the Web 2.0 dream in all its grandeur! Website Word Cloud finds unique and
            interesting keywords in your web content and generates a word cloud, and the tools to tweak the
            visualization.\n\n
            Word selection is governed by strategy, extracting unique terms (jargon) or by frequency, which
            selects for any and all terms. The Layout option changes the aesthetic of the word cloud, while
            Min Word Length filters exactly that. For font options, you can enter any installed font on your device or
            select from a list of "web safe" fonts.
            \n\n
            InterroBot Word Cloud utilizes the d3 and d3-cloud open-source visualization libraries to bring
            your word clouds to life.`,
    }

    public static layouts: WordcloudLayout[] = [
        new WordcloudLayout(1, "Rectangle", "rectangular", true),
        new WordcloudLayout(2, "Elliptical", "archimedean", true),
    ];

    // this is a hassle due to svg/canvas rendering requirements, but least hassle right here
    private static readonly baseMediaPath: string = "";
    private static readonly embedFont: string = Wordcloud.baseMediaPath + "/fonts/Montserrat-SemiBold.woff2";

    // this memo needs to be cleared manually prior to a process
    private static cloudWordLayoutMemo: CloudWordLayoutMemo | undefined = undefined;
    public static getWordLayoutFontSize(words:WordData[], value: number): number {

        if (Wordcloud.cloudWordLayoutMemo === undefined){
            // log scale range of counts so size is more predictable
            let wordsMaxVal:number = 0;
            let wordsMinVal:number = 10000000;
            words.forEach((word: WordData) => {
                wordsMaxVal = Math.max(wordsMaxVal, word.value)
                wordsMinVal = Math.min(wordsMinVal, word.value)
            });

            const wordsMinValLog: number = Math.log1p(wordsMinVal);
            const wordsMaxValLog: number = Math.log1p(wordsMaxVal);
            Wordcloud.cloudWordLayoutMemo = {
                count: words.length,
                min: wordsMinVal,
                max: wordsMaxVal,
                minLog: wordsMinValLog,
                maxLog: wordsMaxValLog,
            }
            // console.log(Wordcloud.cloudWordLayoutMemo);
        }

        const wordsMinValLog: number = Wordcloud.cloudWordLayoutMemo.minLog;
        const wordsMaxValLog: number = Wordcloud.cloudWordLayoutMemo.maxLog;
        const normalizedValue = (Math.log1p(value) - wordsMaxValLog) / (wordsMinValLog - wordsMaxValLog);
        const scaledValue = Wordcloud.wordsMaxOutput - (Wordcloud.wordsMaxOutput - Wordcloud.wordsMinOutput) * Math.pow(normalizedValue, 2);

        // ensure the output is within the desired range
        const clamped =  Math.round(Math.min(Math.max(scaledValue, Wordcloud.wordsMinOutput), Wordcloud.wordsMaxOutput));
        return clamped;
    }

    private static typo: Typo;
    private static readonly wordSplitRe: RegExp = /[ —\-\/\|]/g;
    private static readonly wordNumericRe: RegExp = /^[v]?[\d\.\-–—:,<>=×xX\(\)]+[MKBmkbgs]*$/g;
    private static readonly wordHexRe: RegExp = /^[\da-f]{6,}$/gi;
    private static readonly emailRegex: RegExp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    private static readonly wordTrimRe: RegExp = /^[^\da-zA-ZÀ-ɏ]+|[^\da-zA-ZÀ-ɏ]+$/g;
    private static readonly wordAnyNumberRe: RegExp = /\d/;
    private static readonly wordAnyPunctuationRe: RegExp = /\p{P}/u;


    private static readonly svgWidth: number = 1920;
    private static readonly svgHeight: number = 1080;
    private static readonly svgId: string = "d3svg";
    private static readonly maxPresentationWords: number = 250; //250
    private static readonly wordsMinOutput: number = 12;
    private static readonly wordsMaxOutput: number = 55;

    private readonly language: string = "en_US";
    private progress: HtmlProcessingWidget | null;
    private table: HtmlResultsTable | null;

    private strategy: number = 1;
    private layout: WordcloudLayout = Wordcloud.layouts[0];
    private minWordLength: number = 3;
    private backgroundColor: string = "#ffffff";
    private fontFamily: string = "Montserrat SemiBold";

    private stopwordsTruth: { [id: string]: boolean };
    private wordMap = new Map<string, WordcloudWord>();
    private wordMapPresentation: WordcloudWord[] = [];
    private resultsMap: Map<number, SearchResult> = new Map<number, SearchResult>();
    private deleteWordHandler: Function;
    private addWordHandler: Function;

    private cloudExpandHandler: Function;
    private cloudRefreshHandler: Function;
    private cloudDownloadHandler: Function;
    private cloudLayout: any;

    private perPage: number = 25;

    public constructor() {

        super();
        this.table = null;
        this.progress = null;
        this.stopwordsTruth = Stopwords.getStopwordsTruth("en");

        // <a> handler for delete links per word
        this.deleteWordHandler = async(ev: MouseEvent) => {
            // find in presentation list and remove
            const button: HTMLButtonElement = ev.target as HTMLButtonElement;
            for (let i=0; i< this.wordMapPresentation.length; i++){
                const cloudword: WordcloudWord = this.wordMapPresentation[i];
                // console.log(`-- ${button.dataset.word} ${cloudword.word}`);
                if (cloudword.word === button.dataset.word){
                    this.wordMapPresentation.splice(i, 1);
                    await this.displayResults();
                    break;
                }
            }
        };

        // <form> handler for adding new cloudword
        this.addWordHandler = async (ev: SubmitEvent) => {
            ev.preventDefault();
            const button: HTMLButtonElement = ev.target as HTMLButtonElement;
            const form: HTMLFormElement = button.form as HTMLFormElement;
            const wordInput: HTMLInputElement = form?.querySelector("input[name='word']") as HTMLInputElement;
            const countInput: HTMLInputElement = form?.querySelector("input[name='count']") as HTMLInputElement;
            const word: string = wordInput.value;
            const count: number = Math.ceil(Number(countInput.value));

            if (word.length < this.minWordLength || count <= 0) {
                form.classList.add("error");
                window.setTimeout(() => {
                    form.classList.remove("error");
                }, 900);
                ev.preventDefault();
                return;
            }


            const newWord = new WordcloudWord(word, count);
            this.wordMapPresentation.push(newWord);
            this.wordMapPresentation = this.sortAndTruncatePresentation(this.wordMapPresentation);
            await this.displayResults();
        };

        this.cloudExpandHandler = (ev: MouseEvent) => {
            ev.preventDefault();
            // cloud wrapper preserves buttons overlay
            const svgContainer: HTMLElement = document.querySelector(".cloud__wrapper") as HTMLElement;
            if (!svgContainer){
                return;
            } else if (document.fullscreenElement){
                document.exitFullscreen();
                svgContainer.classList.remove("fullscreen");
            } else {
                svgContainer?.requestFullscreen();
                svgContainer.classList.add("fullscreen");
            }
        };

        this.cloudRefreshHandler = (ev: MouseEvent) => {
            ev.preventDefault();
            this.displayResults();
        };
        /*
        this.cloudDownloadHandler = async(ev: MouseEvent) => {
            ev.preventDefault();
            const svg = d3.select(`#${Wordcloud.svgId}`).node();
            const date = new Date();
            const dateString = date.toISOString().slice(0, 16).replace(/[\-\:T]/g, "");
            const filename: string = `wordcloud-${dateString}.png`
            await this.saveSvgAsImage(svg, filename);

            const msg: HTMLElement | null = document.querySelector(".cloud__message");
            if (msg){
                msg.innerText = `Saved ${filename} to ./Downloads`;
                // msg.style.display = "block";
                msg.classList.add("visible");
                window.setTimeout(() => {
                    msg.classList.remove("visible");
                    msg.innerText = ``;
                }, 5000);
            }
        };
        */
        this.cloudDownloadHandler = async(ev: MouseEvent) => {

            ev.preventDefault();
            const svgElement = d3.select(`#${Wordcloud.svgId}`).node();
            const svgData = new XMLSerializer().serializeToString(svgElement);
            const canvas = document.createElement("canvas");
            const img = document.createElement("img");
            canvas.width = Wordcloud.svgWidth;
            canvas.height = Wordcloud.svgHeight;
            const svgBase64 = btoa(unescape(encodeURIComponent(svgData)));
            const dataURL = 'data:image/svg+xml;base64,' + svgBase64;

            img.onload = async(ev: Event) => {
                const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
                ctx.fillStyle = this.backgroundColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx!.drawImage(img, 0, 0);
                const pngDataURL = canvas.toDataURL("image/png");

                // null if <=2.7
                const versionString = await Plugin.postApiRequest("GetVersion", {});

                // GetVersion introduced 2.8.0, returns null beforehand
                // this is a workaround for older versions of InterroBot supporting sandbox downloads.
                // the capability is removed, and all former "downloads" now route through
                // InterroBot app (only png|webp|jpg are currently allowed using ExportDataUri)
                if (!versionString){

                    // 2.7- remove fallback logic after 8/1/2025
                    const downloadLink = document.createElement("a");
                        const dateString = new Date().toISOString().slice(0, 16).replace(/[\-\:T]/g, "");
                        const filename: string = `wordcloud-${dateString}.png`;
                        downloadLink.download = filename;
                        downloadLink.href = pngDataURL;
                        downloadLink.click();

                        // message user that download completed
                        const msg: HTMLElement | null = document.querySelector(".cloud__message");
                        if (msg){
                            msg.innerText = `Saved ${filename} to ./Downloads`;
                            msg.classList.add("visible");
                            window.setTimeout(() => {
                                msg.classList.remove("visible");
                                msg.innerText = ``;
                            }, 5000);
                        }
                } else {

                    // 2.8+
                    // TODO postApiRequest needs refactor to support new, non-query API calls
                    // for now, run manually
                    // const kwargs = { format: "datauri", datauri: pngDataURL };
                    // const result = await Plugin.postApiRequest("ExportDataUri", kwargs);
                    const msg = {
                        target: "interrobot",
                        data: {
                            reportExport: {
                                format: "datauri",
                                datauri: pngDataURL,
                            }
                        },
                    };
                    window.parent.postMessage(msg, "*");
                }


            }
            img.src = dataURL;
        };

        this.index();
    }

    protected override async index() {

        const project: Project = await Project.getApiProject(this.getProjectId());

        this.render(`
            ${Templates.standardHeading(project, Wordcloud.meta.title)}
            ${Templates.standardForm(`
            <form class="main__form__standard main__form__ltr main__form__wordcloud" id="WordcloudForm" spellcheck="false">
                <label>
                    <span>Strategy</span>
                    <select name="strategy">
                        <option value="1">Frequency</option>
                        <option value="0">Jargon</option>

                    </select>
                </label>
                <label>
                    <span>Layout</span>
                    <select name="layout">
                    </select>
                </label>
                <label>
                    <span>Min Word Length</span>
                    <select name="minWordLength">
                        <option value="3">3 characters</option>
                        <option value="4">4 characters</option>
                        <option value="5">5 characters</option>
                    </select>
                </label>
                <label>
                    <span>Font Family</span>
                    <input type="text" name="fontFamily" placeholder="Optional font" />
                </label>
                <label>
                    <span>Background</span>
                    <input type="color" name="backgroundColor" value="#ffffff" />
                    <span class="main__form__color">#??????</span>
                </label>
                <div><button class="submit">Generate</button></div>
            </form>
            <div id="WordcloudFormProgress"></div>`)}
            ${Templates.standardResults()}
        `);

        const strategySelect: HTMLSelectElement = document.querySelector("select[name='strategy']") as HTMLSelectElement;
        const minWordLengthSelect: HTMLSelectElement = document.querySelector("select[name='minWordLength']") as HTMLSelectElement;
        const layoutSelect: HTMLSelectElement = document.querySelector("select[name='layout']") as HTMLSelectElement;
        const backgroundColorInput: HTMLInputElement = document.querySelector("input[name='backgroundColor']") as HTMLInputElement;
        const fontFamilyInput: HTMLInputElement = document.querySelector("input[name='fontFamily']") as HTMLInputElement;
        const progressWrapper: HTMLDivElement = document.getElementById("WordcloudFormProgress") as HTMLDivElement;

        for (let i=0; i< Wordcloud.layouts.length; i++){
            const clayout = Wordcloud.layouts[i];
            const option = document.createElement("option")
            option.innerText = clayout.name;
            option.setAttribute("value", `${clayout.id}`);
            layoutSelect.appendChild(option);
        }

        fontFamilyInput.addEventListener("mousedown", () => {
            const elementId: string = "Fontlist";
            let container: HTMLDivElement | null = document.getElementById(elementId) as HTMLDivElement;

            if (container === null){
                container = document.createElement("div");
                container.id = elementId;
                container.style.width = `${fontFamilyInput.offsetWidth}px`;
                container.classList.add("fontlist");
                const options: string[] = [
                    "Arial",
                    "Georgia",
                    "Impact",
                    "Palatino",
                    "Tahoma",
                    "Times New Roman",
                    "Verdana",
                ];
                options.forEach(font => {
                    const option: HTMLAnchorElement = document.createElement("a");
                    option.innerText = font;
                    option.href = "#";
                    container!.appendChild(option);
                    option.addEventListener("mousedown", (ev: Event) => {
                        fontFamilyInput.value = font;
                        container!.style.display = "none";
                        const event = new Event('change', {
                            bubbles: true,
                            cancelable: true,
                        });
                        fontFamilyInput.dispatchEvent(event);
                    });
                    option.addEventListener("click", (ev: Event) => {
                        ev.preventDefault();
                    });
                });
                fontFamilyInput.parentElement!.classList.add("fontlist__label");
                fontFamilyInput.parentElement!.appendChild(container);
            } else {
                container.style.display = "block";
                container.style.width = `${fontFamilyInput.offsetWidth}px`;
            }
            fontFamilyInput.addEventListener("blur", () => {
                container!.style.display = "none";
            });
        });

        // initialize PluginData for autoform to work
        const defaultData: {} = {};
        const autoformFields: HTMLElement[] = [strategySelect, minWordLengthSelect, layoutSelect, backgroundColorInput, fontFamilyInput];
        await this.initData(defaultData, autoformFields);

        const updateFormValues = () => {
            this.strategy = Number(strategySelect.value);
            this.layout = Wordcloud.layouts.find(a => a.id.toString() == layoutSelect.value) ?? Wordcloud.layouts[0];
            this.minWordLength = Number(minWordLengthSelect.value);
            this.backgroundColor = backgroundColorInput.value;
            this.fontFamily = fontFamilyInput.value ? fontFamilyInput.value : "Montserrat SemiBold";

            const colorEcho: HTMLElement | null = document.querySelector(".main__form__color");
            if (colorEcho){
                colorEcho.innerText = this.backgroundColor;
            }
        }

        backgroundColorInput.addEventListener("change", (ev: Event) => {
            updateFormValues();
        });

        this.progress = HtmlProcessingWidget.createElement(progressWrapper, "Scanning: ");
        this.strategy = Number(strategySelect.value);
        updateFormValues();

        const button: HTMLButtonElement = document.querySelector("button") as HTMLButtonElement;
        button.addEventListener("click", async (ev: MouseEvent) => {
            ev.preventDefault();
            button.setAttribute("disabled", "disabled");
            updateFormValues();
            try {
                await this.process();
            } catch (ex) {
                console.error(ex);
            } finally {
                button.removeAttribute("disabled");
            }
        });

        Plugin.postContentHeight();
    }

    protected async process() {

        await this.data.updateData();
        const basePath: string = "/hunspell";
        const requestOptions: { [key: string]: any } = {
            method: "GET",
            headers: {
                Accept: "text/plain",
                "Content-Type": "text/plain; charset=UTF-8"
            },
        };
        let [affData, wordsData] = await Promise.all([
            fetch(`${Wordcloud.baseMediaPath}/hunspell/${this.language}.aff`, requestOptions).then(response => response.text()),
            fetch(`${Wordcloud.baseMediaPath}/hunspell/${this.language}.dic`, requestOptions).then(response => response.text()),
        ]);

        Wordcloud.typo = new Typo(this.language, affData, wordsData);
        this.wordMap.clear();
        const projectId: number = this.getProjectId();
        const internalQueryString: string = "headers: text/html";
        let internalHtmlPagesQuery = new SearchQuery({
            project: projectId,
            query: internalQueryString,
            fields: "content",
            type: SearchQueryType.Any,
            includeExternal: false,
            includeNoRobots: false,
        });

        await Search.execute(internalHtmlPagesQuery, this.resultsMap, async (result: SearchResult) => {
            await this.wordcloudResultHandler(result);
        }, true, false, "Finding jargon…");

        let wordcloudWordList: WordcloudWord[] = [...this.wordMap.values()];
        this.wordMapPresentation = this.sortAndTruncatePresentation(wordcloudWordList);
        await this.report();
    }

    protected async report() {
        await this.displayResults();
    }

    private sortAndTruncatePresentation(wordcloudWordList: WordcloudWord[]): WordcloudWord[] {
        wordcloudWordList = wordcloudWordList.filter(word => word.getWord().length >= this.minWordLength);
        wordcloudWordList.sort((a, b) => b.getCount() - a.getCount());
        return wordcloudWordList.slice(0, Wordcloud.maxPresentationWords);
    }

    private async displayResults(): Promise<void> {
        Wordcloud.cloudWordLayoutMemo = undefined;
        // called from report, but also rerender
        this.removeHandlers();
        const resultsBits: string[] = [];
        resultsBits.push(`<div class="cloud__wrapper">`);
        resultsBits.push(`<form action="." method="get" class="cloud__actions">
            <div>
            <button class="cloud__action" aria-label="Expand">
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="128px"
                height="128px" viewBox="388.5 1532.71 128 128" xml:space="preserve">
                <path d="M508.938,1653.148h-34.469v-7h27.469v-27.47h7V1653.148z M430.529,1653.148h-34.469v-34.47h7v27.47h27.469V1653.148z
                    M508.938,1574.741h-7v-27.47h-27.469v-7h34.469V1574.741z M403.06,1574.741h-7v-34.47h34.469v7H403.06V1574.741z"/>
            </svg>
            </button>
            <button class="cloud__action" aria-label="Refresh">
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="128px"
                height="128px" viewBox="1188.5 1372.466 128 128" xml:space="preserve">
                <path d="M1210.944,1399.189c20.188-20.277,52.974-20.333,73.239-0.146l15.24,13.926v-16.084c0-2.383,8.632-2.383,8.632,0v25.896
                    c0,2.384-1.934,4.316-4.315,4.316h-25.896c-2.383,0-2.383-8.633,0-8.633h14.791l-14.342-13.14
                    c-0.045-0.044-0.101-0.089-0.134-0.135c-16.522-16.499-43.15-16.893-60.134-0.876c-17.343,16.354-18.142,43.666-1.788,61.01
                    c16.355,17.343,43.668,18.142,61.01,1.786c1.743-1.64,4.464-1.562,6.104,0.169c1.642,1.743,1.574,4.462-0.168,6.104
                    c-9.587,9.104-22.322,14.174-35.552,14.14h-0.696c-28.324-0.382-51.097-23.457-51.097-51.793
                    C1195.838,1422.028,1201.267,1408.889,1210.944,1399.189z"/>
            </svg>
            </button>
            <button class="cloud__action" aria-label="Download">
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="128px"
                    height="128px" viewBox="1028.5 1212.5 128 128" xml:space="preserve">
                    <path d="M1066.222,1283.45l23.792,23.762c1.328,1.33,3.645,1.33,4.973,0l23.839-23.839c-0.018-0.049-0.116-0.781-1.131-2.058 c-1.345-1.692-3.121-2.872-3.875-2.872l-17.801,17.788v-75.353c-0.15-0.188-1.402-0.727-3.519-0.727s-3.368,0.539-3.54,0.814 l0.021,75.265l-17.834-17.832c-0.722,0.044-2.498,1.224-3.842,2.916C1066.291,1282.592,1066.192,1283.323,1066.222,1283.45z"/>
                    <path d="M1040.056,1290.463c-2.116,0-3.367,0.538-3.539,0.813l0.021,40.054c0,0.383,0,1.126,0.062,1.456 c0.33,0.062,1.073,0.062,1.456,0.062h108.889c0.383,0,1.126,0,1.456-0.062c0.062-0.33,0.062-1.073,0.062-1.456v-40.142 c-0.15-0.188-1.401-0.726-3.518-0.726c-2.115,0-3.366,0.538-3.538,0.813l0.021,34.537h-97.855v-34.625 C1043.422,1291.001,1042.171,1290.463,1040.056,1290.463z"/>                </svg>
            </button>
            </div>
            <div class="cloud__message">

            </div>
        </form>`);

        // canvas otherwise won't generate image correctly without default embedded font
        // all other fonts must be installed on users local computer, css fonts not good
        // enough
        let fontdata: string = "";
        try {
            const response = await fetch(Wordcloud.embedFont);
            const blob = await response.blob();
            const reader = new FileReader();
            await new Promise<void>((resolve) => {
                reader.onloadend = () => resolve();
                reader.readAsDataURL(blob);
            });
            fontdata = reader.result!.toString().split(',')[1];
        } catch {
            // not the end of the world, image will have serif draw of monteserrat layout
            console.warn("default font not embedded in svg");
        }

        // fontdata to get canvas image rendering right. <style> triggers a sandbox
        // warning (inline-styles), but crucial for canvas rendering and png export
        resultsBits.push(`<svg class="cloud ${this.layout.spiral}" id="${Wordcloud.svgId}" width="${Wordcloud.svgWidth}" height="${Wordcloud.svgHeight}"
            viewBox="0 0 ${Wordcloud.svgWidth} ${Wordcloud.svgHeight}" fill="${this.backgroundColor}"
            preserveAspectRatio="xMidYMid meet">
            <style>
            @font-face {
                font-family: 'Montserrat SemiBold';
                font-style: normal;
                font-weight: 600;
                src: url("data:font/woff2;base64,${fontdata}") format("woff2");
            }
            svg {
                font-family: "Montserrat SemiBold";
            }
            text {
                stroke: #cccccc44;
                paint-order: stroke;
            }
            </style>
             </svg>
            </svg>`);

        resultsBits.push(`</div>`);
        // resultsBits.push(this.generateWordTable());
        const resultsElement: HTMLElement | null = document.querySelector(".main__results");
        // console.log(resultsElement);
        if (resultsElement !== null) {
            resultsElement.innerHTML = resultsBits.join("");
            const svg = resultsElement.querySelector("svg.cloud") as HTMLElement;
            if (svg !== null && svg.style.backgroundColor) {
                svg.style.backgroundColor = this.backgroundColor ?? "#ffffff";
            }
        }

        const header = `<h2><span class="keywords">Word Cloud Terms</span></h2>
            <div>
                <p>
                Review word cloud data and modify terms (maximum ${Wordcloud.maxPresentationWords} words).
                </p>
                <form id="WordcloundManagerAdd" action="." method="GET">
                    <input type="text" name="word" placeholder="term" required />
                    <input type="number" name="count" placeholder="count" required />
                    <button>Add Term</button>
                </form>
            </div>`;
        const headings: string[] = ["", "TERM", "COUNT",]; // "TYPE", "CAPTURE",
        const results: string[][] = [];
        // const captureMap: Map<number, string> = new Map<number, string>();
        // const typeMap: Map<number, string> = new Map<number, string>();

        for (let i=0; i< this.wordMapPresentation.length; i++){
            const cloudword: WordcloudWord = this.wordMapPresentation[i];
            const encodedCloudword: string = HtmlUtils.htmlEncode(cloudword.word);
            results.push([
                HtmlResultsTable.generateFormatedColumnNumber(i + 1),
                `${cloudword.getWord()}`,
                `${cloudword.getCount()}`,
            ]);
        }

        // augmented csv, these are unnecessary with the form context, but useful
        const exportExtra: {} = {};
        const cellHandler: Function = async (ev: MouseEvent) => {
            const button: HTMLButtonElement = ev.target as HTMLButtonElement;
            if (!button){
                return;
            }
            this.deleteWordHandler(ev);
        };
        const rowRenderer: Function | null = null;

        // delete term buttons in cellRenderer
        const cellRenderer: { [id: string]: Function } = {
            "TERM": (cellValue: string, rowData: {}) => {
                return {
                    "classes": ["term"],
                    "content": `<strong>${cellValue}</strong>
                        <button class="custom" data-word="${cellValue}">
                        <span>×</span> Remove</button>`
                    };
            },
        };
        const resultsSort: HTMLResultsTableSort = new HTMLResultsTableSort("COUNT", SortOrder.Descending, "TERM", SortOrder.Ascending);
        this.table = HtmlResultsTable.createElement(resultsElement!, this.getProjectId(), this.perPage,
            header, headings, results, resultsSort, rowRenderer, cellRenderer, cellHandler, exportExtra);

        this.addHandlers();
        this.generateCloud();



        Plugin.postContentHeight();
    }


    private draw(words: WordData[]) {

        if (this.cloudLayout === null){
            console.error("layout unavailable (not ready)");
            return;
        }
        if (words.length === 0){
            console.error("no words to add to cloud");
            return;
        }

        // reverse after layout calc, before draw to get correct draw order
        // of larger words on top of zIndex
        words.reverse();

        const halfWidth = Wordcloud.svgWidth / 2;
        const halfHeight = Wordcloud.svgHeight / 2;
        const color = d3.scaleOrdinal(d3.schemeCategory10);
        const transform: string = `translate(${halfWidth},${halfHeight})`;
        const svg = d3.select(`#${Wordcloud.svgId}`);

        const g = svg.append("g");
        g.attr("transform", transform);
        g.selectAll("text")
            .data(words)
            .enter().append("text")
            .style("font-size", (d: WordData) => `${Wordcloud.getWordLayoutFontSize(words, d.value)}px`)
            .style("font-family", (d: WordData) => `${d.fontFamily}`)
            .style("fill", (d: WordData, i: number) => color(i))
            .attr("text-anchor", "middle")
            .attr("transform", (d: WordData) => `translate(${d.x},${d.y})rotate(${d.rotate})`)
            .text((d: WordData) => d.text);

        // add zsort, zIndex is unsupported, but other props work
        const svgEl: HTMLElement = document.getElementById(Wordcloud.svgId) as HTMLElement;
        const allText = svgEl.querySelectorAll("text");
        for (let i=0; i< allText.length; i++){
            const text: SVGTextElement = allText[i] as SVGTextElement;
            const textSize: number = parseInt(text.style.fontSize, 10);
            text.classList.add(`zsort`, `zsort${textSize}`); // 5 - 55
        }
    }

    private generateCloud(): void {

        let topVal: number = 0;
        const data: WordcloudWord[] = [];

        for (let i=0; i< this.wordMapPresentation.length; i++){
            const cloudword: WordcloudWord = this.wordMapPresentation[i];
            const cloudwordWord: string = cloudword.getWord();
            const cloudwordCount: number = cloudword.getCount();
            topVal = Math.max(topVal, cloudwordCount);
            data.push(cloudword);
        }

        const words: WordData[] = data.map(d => ({
            text: d.getWord(),
            value: d.getCount(),
            fontFamily: this.fontFamily,
            // x, y, and rotate will be set by the cloud layout
        }));

        // keep an eye on .font(), it is not only applying font, but affecting separation
        this.cloudLayout = d3.layout.cloud()
            .size([Wordcloud.svgWidth, Wordcloud.svgHeight])
            .words(words)
            .font(this.layout.separated ? this.fontFamily : "")
            .padding(4)
            .rotate(() => ~~(Math.random() * 2) * 90)
            .fontSize(function(d: WordData) { return Wordcloud.getWordLayoutFontSize(words, d.value)})  // Adjust font size scaling
            .spiral(this.layout.spiral)
            .on("end", this.draw.bind(this));
        this.cloudLayout.start();
    }

    private addHandlers(): void {
        if (this.table) {
            this.table.addHandlers();
        }
        this.applyHandlers(true);
    }
    private removeHandlers(): void {
        if (this.table) {
            this.table.removeHandlers();
        }
        this.applyHandlers(false);
    }

    private applyHandlers(add: boolean): void {

        const navLinkMethod: "addEventListener" | "removeEventListener" = add ? "addEventListener" : "removeEventListener";

        const actions: NodeListOf<HTMLElement> = document.querySelectorAll(".cloud__action");
        if (actions.length == 3){
            (actions[0] as any)[navLinkMethod]("click", this.cloudExpandHandler);
            (actions[1] as any)[navLinkMethod]("click", this.cloudRefreshHandler);
            (actions[2] as any)[navLinkMethod]("click", this.cloudDownloadHandler);
            // button color
            const rgb = parseInt(this.backgroundColor.slice(1), 16);
            const r = (rgb >> 16) & 255, g = (rgb >> 8) & 255, b = rgb & 255;
            const isLight: boolean = (0.2126 * r + 0.7152 * g + 0.0722 * b) > 128;
            // console.log(this.backgroundColor);
            // console.log(isLight);
            if (isLight){
                actions[0].classList.add("light");
                actions[1].classList.add("light");
                actions[2].classList.add("light");
            } else {
                actions[0].classList.remove("light");
                actions[1].classList.remove("light");
                actions[2].classList.remove("light");
            }

        }

        const addWordForm: HTMLElement | null = document.getElementById("WordcloundManagerAdd");
        const addWordButton: HTMLElement | null | undefined = addWordForm?.querySelector("button");
        if (addWordButton){
            (addWordButton as any)[navLinkMethod]("click", this.addWordHandler);
        }
    }

    private async wordcloudResultHandler(result: SearchResult) {

        if (!result.getContent() && !result.hasProcessedContent()) {
            return;
        }

        // once the processed text is in place, clear html
        if (!result.hasProcessedContent()) {
            const textonly = result.getContentTextOnly();
            result.setProcessedContent(textonly);
            result.clearFulltextFields();
        }

        const documentTextWords: string[] = result.getProcessedContent().split(Wordcloud.wordSplitRe);
        for (let documentTextWord of documentTextWords) {

            // common processing
            let cleanedWord = documentTextWord.replace(Wordcloud.wordTrimRe, "");
            cleanedWord = cleanedWord.replace(/['']/, "'");

            if (this.stopwordsTruth[cleanedWord.toLowerCase()] !== undefined) {
                continue;
            }
            if (cleanedWord.length < this.minWordLength){
                continue;
            }

            const addToWordmap = (cleanedWord:string) => {
                const wordMapKey: string = cleanedWord.toLocaleLowerCase();
                let wordcloudWord: WordcloudWord | undefined = this.wordMap.get(wordMapKey);
                if (wordcloudWord === undefined) {
                    const firstWordInstance: WordcloudWord = new WordcloudWord(cleanedWord, 1);
                    this.wordMap.set(wordMapKey, firstWordInstance);
                }
                else {
                    wordcloudWord.incrementCount();
                }
            };

            switch(this.strategy){
                case 0: // jargon
                    // misspelled *is* the jargon detection
                    let misspelled: boolean = this.isMisspelling(cleanedWord, {});
                    if (misspelled) {
                        // this is what is desired (presumed jargon)
                        addToWordmap(cleanedWord);
                    }
                    break;
                case 1: // frequency
                default:
                    addToWordmap(cleanedWord);
                    break;
            }
        }

        if (!this.resultsMap.has(result.id)) {
            this.resultsMap.set(result.id, result);
        }
    }

    private isMisspelling(cleanedWord: string, ignoredMap: { [key: string]: boolean }): boolean {

        // ignore words with numbers
        if (cleanedWord.match(Wordcloud.wordAnyNumberRe) !== null) {
            return false;
        }
        // ignore words with puncutuation
        if (cleanedWord.match(Wordcloud.wordAnyPunctuationRe) !== null) {
            return false;
        }

        // typo.check() returns true if in dictionary
        let misspelled: boolean = !Wordcloud.typo.check(cleanedWord);

        // if misspelled, return immediately
        if (misspelled === true) {
            return misspelled
        }

        // not misspelled, further checks
        const ignorable: boolean = ignoredMap[cleanedWord] !== undefined;
        const urlLeniency: boolean = HtmlUtils.isUrl(cleanedWord);
        const numericLeniency: boolean = cleanedWord.match(Wordcloud.wordNumericRe) !== null;
        const hexLeniency: boolean = cleanedWord.match(Wordcloud.wordHexRe) !== null;
        const emailLeniency: boolean = cleanedWord.match(Wordcloud.emailRegex) !== null;
        const dateLeniency: boolean = !isNaN(Date.parse(cleanedWord));

        return ignorable || numericLeniency || hexLeniency || emailLeniency || dateLeniency || urlLeniency;
    }

    private async saveSvgAsImage(svgElement: SVGElement, fileName: string): Promise<void> {

        // Get the SVG data
        const svgData = new XMLSerializer().serializeToString(svgElement);

        // Create a canvas element
        const canvas = document.createElement("canvas");
        const img = document.createElement("img");
        canvas.width = Wordcloud.svgWidth;
        canvas.height = Wordcloud.svgHeight;
        const svgBase64 = btoa(unescape(encodeURIComponent(svgData)));
        const dataURL = 'data:image/svg+xml;base64,' + svgBase64;

        img.onload = function() {
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            ctx!.drawImage(img, 0, 0);
            const pngDataURL = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.download = fileName;
            downloadLink.href = pngDataURL;
            downloadLink.click();
        }
        img.src = dataURL;
    }
}

// handles DOMContentLoaded initialization
Plugin.initialize(Wordcloud);