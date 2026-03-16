## Transpo – Transposition d'accords (Next.js)

### Pré-requis
- Node.js 20.x recommandé
- npm (fourni avec Node 20)

### Installation
```bash
npm install
```

### Lancement en développement
```bash
npm run dev
```

Puis ouvrez `http://localhost:3000` dans votre navigateur.

### Description rapide
- Application Next.js 16 (App Router) avec TypeScript et Tailwind CSS.
- Interface centrée et responsive pour coller ou saisir des accords sur plusieurs lignes.
- Bouton **Transposer** qui calcule une première version transposée (décalage 0).
- Deux boutons **-** et **+** qui appliquent une transposition cumulative de ±1 demi-ton sur le résultat affiché.
- Gestion des accords simples et slash (ex. `DoM`, `Rem7`, `DoM/Sol`), en notation française.
- Convention d’affichage : toutes les notes chromatiques sont normalisées en dièses (`Do, Do#, Ré, Ré#, Mi, Fa, Fa#, Sol, Sol#, La, La#, Si`), même si l’entrée utilise des bémols (`Réb, Mib, Solb, Lab, Sib`).

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
