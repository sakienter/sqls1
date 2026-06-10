# S級リーグS1

Googleスプレッドシートで編集した大会結果を、JSON経由でCloudflare Pagesに表示するための最小デモです。

## フォルダ構成

```text
cnvsworld-cloudflare-demo/
├─ public/
│  ├─ index.html
│  ├─ style.css
│  ├─ script.js
│  └─ sample-data.json
├─ functions/
│  └─ api/
│     └─ results.js
├─ apps-script/
│  └─ Code.gs
├─ public-data-template.csv
└─ README.md
```

## まず画面だけ試す

`public/index.html` をブラウザで開いてください。
ローカル環境では `/api/results` が使えないため、`sample-data.json` または埋め込みデモデータで表示されます。

## Cloudflare Pagesで試す

1. このフォルダ全体をGitHubリポジトリに入れる
2. Cloudflare Dashboard → Workers & Pages → Pages → Create a project
3. GitHubリポジトリを接続
4. ビルド設定を以下にする

```text
Framework preset: None
Build command: exit 0
Build output directory: public
```

5. Deployする

`GAS_URL` を設定していない場合、`functions/api/results.js` がデモJSONを返すので、そのまま動作確認できます。

## Googleスプレッドシートとつなぐ

1. Googleスプレッドシートに `public_data` シートを作る
2. `public-data-template.csv` のヘッダーを貼り付ける
3. 拡張機能 → Apps Script を開く
4. `apps-script/Code.gs` の内容を貼り付ける
5. デプロイ → 新しいデプロイ → 種類: ウェブアプリ
6. 実行するユーザー: 自分
7. アクセスできるユーザー: 全員
8. 発行された `/exec` URLをコピー
9. Cloudflare Pagesの Environment variables に `GAS_URL` として追加
10. Cloudflare Pagesを再デプロイ

## 注意

- JSONに含めたデータは公開情報になります。
- 非公開メモや個人情報は `public_data` シートに入れないでください。
- Apps ScriptのURLを完全な秘密として扱う構成ではありません。公開用データだけを出す前提です。
