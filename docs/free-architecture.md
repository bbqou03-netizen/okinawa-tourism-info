# 無料運用アーキテクチャ

## 目的

沖縄観光情報サイトを、初期費用と月額費用なしで公開・更新するための構成です。

## 構成

| 領域 | 採用するもの | 費用 |
| --- | --- | --- |
| 公開 | GitHub Pages | 無料 |
| 更新処理 | GitHub Actions | 無料枠 |
| データ | JSONファイル | 無料 |
| 収集元 | 公式サイト、RSS、公開HTML | 無料 |
| 多言語 | 手元の翻訳JSON、公式多言語ページ | 無料 |

## データ更新の流れ

### ローカル確認中

1. `npm run start` を実行します。
2. `scripts/auto-collect-and-serve.mjs` が起動時に `scripts/update-tourism-data.mjs` を実行します。
3. 以後、標準では60分ごとに自動収集します。
4. 画面は `data/tourism.json` を5分ごとに読み直します。

### GitHub Pages公開後

1. `config/sources.json` に観光情報ソースを登録します。
2. GitHub Actions が毎日 `scripts/update-tourism-data.mjs` を実行します。
3. スクリプトが `robots.txt` を確認し、許可される公開ページから観光関連リンクを抽出します。
4. `data/tourism.json` が更新され、差分が自動コミットされます。
5. GitHub Pages が最新JSONを読み込んで表示します。

## 多言語方針

無料運用では、有料翻訳APIを使いません。

- UI文言は `app.js` の辞書で4言語化します。
- 主要スポットは `data/tourism.json` に4言語文を持たせます。
- 自動収集した新着情報は、取得元の原文を表示します。
- 必要に応じて、公式の英語、中国語、韓国語ページを `config/sources.json` に追加します。

## 注意点

- 収集元サイトの利用規約と robots.txt を確認してください。
- 自動収集データは公式リンク付きで表示し、日時や料金などの重要情報はリンク先で確認できるようにします。
- GitHub Actions の無料枠を超えないよう、実行頻度は1日1回程度にします。
- 本文や画像の転載は避け、リンク、日付、短い案内文を中心に扱います。
