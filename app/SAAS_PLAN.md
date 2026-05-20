# Plano de Transformação SaaS - Fuel Controller

Este arquivo foi criado para **salvar o progresso** da nossa migração. Se os tokens acabarem ou a conversa for encerrada, basta pedir na próxima sessão: *"Continue de onde paramos no arquivo SAAS_PLAN.md"*.

## 1. Arquitetura do Banco de Dados (SaaS)
- Substituir o `localStorage` pelo **Supabase** (PostgreSQL).
- **Tabela `users`**: Gerencia o e-mail e senha de cada cliente.
- **Tabela `vehicles`**: Com coluna `user_id` para segurança de acesso.
- **Tabela `refuels`**: Registros de abastecimento vinculados ao veículo e usuário.

## 2. Autenticação e Segurança
- Transformar o PIN único em **Tela de Login Moderna** (E-mail e Senha).

## 3. Próximos Passos (Checklist de Implementação)
- [x] **Fase 1**: Recriar o design do odômetro no arquivo `Dashboard.tsx` usando CSS moderno (Estilo carro esporte/digital).
- [x] **Fase 2**: Configurar o projeto no Supabase e instalar os pacotes oficiais.
- [x] **Fase 3**: Implementar o sistema de Login (E-mail/Senha).
- [ ] **Fase 4**: Migrar lógicas de salvar veículo/abastecimento do `localStorage` para chamadas seguras no Supabase.
