# Okinawa Guide

沖縄の観光情報を日本語、英語、中国語、韓国語で表示する静的サイトです。依存パッケージなし、無料ホスティング前提で動きます。

## 無料で運用する設計

- ホスティング: GitHub Pages
- 自動更新: GitHub Actions の無料枠
- データ保存: リポジトリ内の `data/tourism.json`
- 情報収集: 公式サイト、RSS、公開HTMLページ
- 翻訳: 有料APIは使わず、`data/tourism.json` に4言語テキストを保持

新しく自動収集した情報は、取得元の言語のまま4言語枠に入ります。完全翻訳したいスポットや重要ニュースは、`data/tourism.json` の `title` / `summary` に日本語、英語、中国語、韓国語を追記します。

## ローカル確認

```bash
npm run start
```

起動時に観光情報を収集し、その後は一定間隔で自動収集します。ブラウザで `http://localhost:4173` を開きます。

収集間隔は無料運用で負荷をかけすぎないよう、標準で60分です。変更する場合は次のように指定します。

```bash
COLLECT_INTERVAL_MINUTES=120 npm run start
```

自動収集なしで静的表示だけ確認する場合:

```bash
npm run serve:static
```

## データ更新

```bash
npm run update:data
```

`config/sources.json` に登録したソースを巡回し、`data/tourism.json` の `updates` を更新します。

## 自動更新

`.github/workflows/update-tourism-data.yml` は毎日 `npm run update:data` を実行し、差分があれば自動コミットします。

ローカル表示中は `npm run start` の常駐サーバが自動収集します。公開後はGitHub Actionsが自動収集します。

## 多言語データの増やし方

無料運用を優先するため、有料翻訳APIは使いません。以下のどちらかで多言語化します。

- 公式の多言語ページを `config/sources.json` に追加する
- 重要な観光スポットや記事だけ `data/tourism.json` に翻訳文を追記する
