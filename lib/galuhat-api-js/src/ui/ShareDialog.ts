export class ShareDialog {
    private overlay: HTMLDivElement;
    private shareLink: HTMLInputElement;
    private shareUrl: string = "";
    private description_text=""
    private hashtag=""
    constructor() {
        // 📌 オーバーレイとダイアログを作成（最初は非表示）
        this.overlay = document.createElement("div");
        this.overlay.id = "overlay";
        this.overlay.style.display = "none";
        this.overlay.innerHTML = `
            <div id="dialog">
                <button id="close-x">&times;</button> <!-- 右上の × ボタン -->
                <h2>共有リンク</h2>
                <div id="link-container">
                    <input type="text" id="share-link" value="" readonly>
                    <button id="copy-link">コピー</button>
                </div>
                <div id="sns-buttons">
                    <button id="share-twitter">X</button>
                </div>
                <button id="close-dialog">閉じる</button>
            </div>
        `;
        document.body.appendChild(this.overlay);

        // 📌 入力フィールドを取得
        this.shareLink = this.overlay.querySelector("#share-link") as HTMLInputElement;

        // 📌 CSS を追加
        this.injectStyles();

        // 📌 イベント設定
        this.overlay.querySelector("#close-dialog")?.addEventListener("click", () => this.hideDialog());
        this.overlay.querySelector("#copy-link")?.addEventListener("click", () => this.copyLink());
        this.overlay.querySelector("#close-x")?.addEventListener("click", () => this.hideDialog()); // × ボタン
        this.overlay.querySelector("#share-twitter")?.addEventListener("click", () => this.shareToTwitter());
    }

    private injectStyles() {
        const style = document.createElement("style");
        style.textContent = `
            #overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
            }
            #dialog {
                position: relative;
                background: white;
                padding: 20px;
                border-radius: 10px;
                text-align: center;
                width: 320px;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
            }
            #close-x {
                position: absolute;
                top: 10px;
                right: 10px;
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
                color: #333;
            }
            #link-container {
                width:100%;
                display: flex;
                align-items: center;
                // gap: 5px;
                height:1.5em;
            }
            #share-link {
                flex-grow: 1;
                margin-width:1px 0;
                height:100%;
                text-align: center;
                border-width: 0 0 1px 0;
                border-color: #ccc;
            }
            #copy-link {
                background: #007bff;
                color: white;
                // padding: 5px 10px;
                border: none 0;
                height:100%;
                cursor: pointer;
                border-radius: 0px;
            }
            #sns-buttons {
                width:100%;
                display: flex;
                justify-content: space-between;
                margin-top: 10px;
                margin-bottom: 10px;
            }
            #sns-buttons button {
                flex: 1;
                margin: 0 5px;
                padding: 8px;
                font-size: 14px;
                color: white;
                border: none;
                cursor: pointer;
                border-radius: 5px;
            }
            #share-twitter {
                background: #1DA1F2;
            }
            #share-line {
                background: #06C755;
            }
            #close-dialog {
                background: #ccc;
            }
        `;
        document.head.appendChild(style);
    }

    showDialog(link: string,description:string,hashtag:string) {
        this.hashtag=hashtag
        this.shareUrl = link; // 📌 共有リンクを設定
        this.shareLink.value = link;
        this.overlay.style.display = "flex"; // 📌 ダイアログを表示
        this.description_text=description
    }

    hideDialog() {
        this.overlay.style.display = "none"; // 📌 ダイアログを非表示
    }

    private copyLink() {
        navigator.clipboard.writeText(this.shareUrl).then(() => {
            alert("リンクをコピーしました！");
        }).catch(err => {
            console.error("コピーに失敗しました", err);
        });
    }

    private shareToTwitter() {
        const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(this.shareUrl)}&text=${this.description_text}&hashtags=${this.hashtag}`;
        window.open(url, "_blank");
    }
}