# 🍽️ 研究室フードマップ

研究室のメンバーの食の好みを共有する静的Webアプリです。  
飲み会・食事会の幹事がお店を選ぶとき、誰が何を食べられないかをすぐ確認できます。

## 機能一覧

- **メンバーカード一覧** — 好き・嫌い・アレルギーをひと目で確認
- **詳細表示** — 条件付きOK食材、カテゴリ別ランキングを表示
- **名前検索** — リアルタイムフィルタリング
- **アレルギー持ちフィルター** — アレルギーあるメンバーだけ表示
- **苦手食材横断検索** — 「パクチー苦手な人は誰？」を一発検索
- **お気に入り** — よく見るメンバーをピン止め（localStorage保存）
- **ダークモード** — OS設定に連動、手動切り替えも可能
- **スマホ最適化** — モバイルファーストなレスポンシブデザイン

## ディレクトリ構成

```
lab-food-app/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages 自動デプロイ
├── src/
│   ├── components/
│   │   ├── MemberCard.tsx      # メンバーカード
│   │   ├── MemberDetail.tsx    # 詳細モーダル
│   │   └── SearchBar.tsx       # 検索・フィルターUI
│   ├── data/
│   │   └── members.json        # ← メンバーデータはここを編集
│   ├── hooks/
│   │   ├── useDarkMode.ts      # ダークモード管理
│   │   └── useFavorites.ts     # お気に入り管理
│   ├── types/
│   │   └── index.ts            # TypeScript 型定義
│   ├── App.tsx                 # メインコンポーネント
│   ├── main.tsx                # エントリーポイント
│   └── index.css               # Tailwind CSS
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## 初回セットアップ

### 必要環境
- Node.js 18以上
- npm 9以上

```bash
# リポジトリをクローン
git clone https://github.com/あなたのユーザー名/lab-food-app.git
cd lab-food-app

# 依存関係をインストール
npm install

# 開発サーバー起動（http://localhost:5173）
npm run dev
```

## GitHub Pages へのデプロイ

### 手順

#### 1. `vite.config.ts` の `base` を変更

```ts
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  base: "/lab-food-app/",  // ← リポジトリ名に合わせて変更
});
```

#### 2. GitHubにリポジトリを作成してプッシュ

```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/あなたのユーザー名/lab-food-app.git
git push -u origin main
```

#### 3. GitHub Pages を有効化

1. リポジトリの **Settings** → **Pages** を開く
2. **Source** を `GitHub Actions` に設定
3. `.github/workflows/deploy.yml` が自動的に使われます
4. `main` ブランチへのプッシュで自動デプロイ

デプロイ後のURL: `https://あなたのユーザー名.github.io/lab-food-app/`

---

## Cloudflare Pages へのデプロイ（代替）

1. [Cloudflare Pages](https://pages.cloudflare.com) にアクセス
2. **Connect to Git** でリポジトリを連携
3. ビルド設定:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node.js version**: `20`
4. `vite.config.ts` の `base` は `"/"` のままでOK

---

## メンバーデータの管理

### データファイルの場所

```
src/data/members.json
```

### メンバーを追加する

`members.json` に以下の形式でオブジェクトを追加します。

```json
{
  "id": "yamada",                      // ユニークID（英数字・ハイフンのみ）
  "name": "山田",                       // 表示名
  "likes": ["寿司", "ラーメン"],         // 好きな食べ物
  "dislikes": ["パクチー"],              // 苦手な食べ物
  "allergies": ["甲殻類"],              // アレルギー（空配列でもOK）
  "conditionalFoods": [
    {
      "food": "ナス",
      "condition": "天ぷらならOK"
    }
  ],
  "rankings": {
    "麺類": ["ラーメン", "うどん", "そば"],
    "肉料理": ["焼肉", "から揚げ"]
  },
  "memo": "辛いものが大好き。"            // 自由メモ（省略可）
}
```

### メンバーを削除する

該当オブジェクトを `members.json` から削除するだけです。

### フィールド仕様

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| `id` | string | ✅ | ユニークID。URL-safe な文字列推奨 |
| `name` | string | ✅ | 表示名 |
| `likes` | string[] | ✅ | 好きな食べ物リスト |
| `dislikes` | string[] | ✅ | 苦手な食べ物リスト |
| `allergies` | string[] | ✅ | アレルギーリスト（なければ `[]`） |
| `conditionalFoods` | ConditionalFood[] | ✅ | 条件付きOK（なければ `[]`） |
| `rankings` | Record<string, string[]> | ✅ | カテゴリ別ランキング（なければ `{}`） |
| `memo` | string | ❌ | 自由メモ（省略可） |

---

## よくある質問

### Q. メンバーが増えてもパフォーマンスは大丈夫？

数十人程度であれば全く問題ありません。  
JSONをそのまま読み込んでいるため、サーバー不要で静的ファイルだけで動作します。

### Q. アレルギー情報を間違えて登録したら？

`src/data/members.json` を直接編集して `git push` するだけです。  
GitHub Actions により数分でデプロイされます。

### Q. お気に入りはどこに保存される？

各ユーザーのブラウザの `localStorage` に保存されます。  
サーバーには送信されません。デバイスをまたいだ同期はできません。

---

## 技術スタック

| 項目 | 技術 |
|---|---|
| フレームワーク | React 18 + TypeScript |
| ビルドツール | Vite 5 |
| スタイリング | Tailwind CSS 3 |
| アイコン | lucide-react |
| データ管理 | JSON（静的ファイル） |
| 状態管理 | React Hooks のみ（外部ライブラリ不要） |
| 永続化 | localStorage（お気に入り・ダークモード） |
| ホスティング | GitHub Pages / Cloudflare Pages |

## ライセンス

MIT
