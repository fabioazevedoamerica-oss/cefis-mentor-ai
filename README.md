# CEFIS Mentor AI

> Hackathon CEFIS 2026 — Tutor de Aprendizado com IA

**Demo ao vivo:** https://cefis-tutor-mu.vercel.app

---

## O que é

Plataforma de tutoria personalizada construída em 1 dia para o Hackathon de Inovação em Aprendizado da CEFIS. Usa inteligência artificial real (Claude AI da Anthropic) integrada com o conteúdo verdadeiro da plataforma CEFIS.

## Funcionalidades

### Entrega Mínima Obrigatória ✅
- **Onboarding inteligente** — 5 perguntas coletam perfil, área, objetivo, tempo disponível e estilo de aprendizagem
- **Diagnóstico de lacunas** — identifica o que o aluno ainda precisa aprender por nível e área
- **Plano de estudos semanal** — organizado por dia da semana (Seg–Sex), adaptado ao tempo disponível (10min até 2h+), com cursos reais da CEFIS

### Diferenciais Valorizados ✅
- **Tutor IA com RAG** (`/tutor`) — chat com Claude AI alimentado por **446 transcrições reais de aulas CEFIS**. Responde dúvidas citando curso e aula de origem
- **Quiz de Fixação com IA** (`/quiz`) — questões geradas pelo Claude a partir das transcrições reais, com correção e explicação automática
- **Player de vídeo embutido** — preview das aulas diretamente no site (URLs reais do CDN da CEFIS, sem autenticação)
- **Adaptação ao estilo de aprendizagem** — Visual, Auditivo, Leitura ou Prático — plano e dicas adaptados
- **Mentor IA personalizado** — Claude Haiku gera mensagem de boas-vindas, dicas e citação motivacional por nome, área e objetivo

## Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion
- **IA:** Claude Haiku (Anthropic API) para geração de insights, respostas do tutor e quiz
- **RAG:** 446 transcrições VTT de aulas reais indexadas em corpus JSON (~665KB)
- **API CEFIS:** Integração com `api-v3.cefis.com.br` — cursos, trilhas, dados reais
- **Deploy:** Vercel (produção)

## Arquitetura

```
app/
├── page.tsx              # Landing com hero video + QuickDemo + player modal
├── onboarding/           # Formulário de perfil (5 perguntas)
├── plano/                # Plano personalizado com insights Claude AI
├── tutor/                # Chat com Tutor IA (RAG)
├── quiz/                 # Quiz de fixação gerado por IA
├── api/
│   ├── plano/            # Geração do plano + Claude Haiku insights
│   ├── courses/          # Proxy API CEFIS v3
│   ├── tutor/            # RAG: busca semântica + Claude
│   └── quiz/             # Geração de questões com Claude
└── components/
    ├── CourseCard.tsx
    └── VideoModal.tsx

public/data/
└── corpus.json           # 446 aulas indexadas com transcrições
```

## Critérios de Avaliação — Cobertura

| Critério | Peso | Implementado |
|----------|------|-------------|
| Funcionalidade | 30 pts | ✅ Onboarding → Diagnóstico → Plano → Chat → Quiz |
| Integração com CEFIS | 25 pts | ✅ API real + transcrições reais + CDN vídeos |
| Qualidade da IA | 20 pts | ✅ Claude Haiku personalizado por perfil + RAG |
| Inovação | 15 pts | ✅ Player embutido + RAG + Quiz gerado da transcrição |
| Experiência do usuário | 10 pts | ✅ Dark theme + animações + mobile responsive |

## Rodando Localmente

```bash
npm install

# Configurar variável de ambiente
echo "ANTHROPIC_API_KEY=sua_chave_aqui" > .env.local

npm run dev
# Acesse http://localhost:3000
```

## Autor

**Fábio Azevedo** — Participante solo · Hackathon CEFIS 2026

---

*Powered by Claude AI × Next.js × Vercel × CEFIS API*
