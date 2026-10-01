# Supabase e tempo real

A demo continua funcionando com dados locais quando `window.GUARIBAS_SUPABASE` não está configurado. Para ativar o modo real:

1. Crie um projeto no Supabase.
2. Execute `supabase/schema.sql` no SQL Editor.
3. Configure `window.GUARIBAS_SUPABASE` em uma camada de deploy segura com a URL e a chave `anon` pública.
4. Configure autenticação e políticas RLS antes de inserir dados reais.

O cliente opcional assina mudanças em `ocorrencias`, `domicilios`, `solicitacoes` e `equipes`. Técnicos autenticados também podem transmitir sua posição via `watchPosition`; a política RLS deve ser revisada antes de usar em produção.

A chave `service_role` nunca deve ser enviada ao navegador.
