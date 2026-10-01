    create extension if not exists postgis;
    create extension if not exists pgcrypto;

    create type public.perfil_usuario as enum ('morador', 'tecnico', 'gestor');
    create type public.status_domicilio as enum ('PENDENTE', 'CONECTADO');
    create type public.status_ocorrencia as enum ('ABERTA', 'EM_ATENDIMENTO', 'RESOLVIDA');
    create type public.prioridade_ocorrencia as enum ('BAIXA', 'MEDIA', 'ALTA', 'URGENTE');

    create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    perfil public.perfil_usuario not null default 'morador',
    nome text,
    created_at timestamptz not null default now()
    );

    create table public.domicilios (
    id text primary key,
    endereco text not null,
    bairro text,
    status public.status_domicilio not null default 'PENDENTE',
    tarifa_social text,
    cpf_nis_hash text,
    geom geography(Point, 4326) not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
    );

    create table public.ocorrencias (
    id uuid primary key default gen_random_uuid(),
    tipo text not null,
    descricao text,
    status public.status_ocorrencia not null default 'ABERTA',
    prioridade public.prioridade_ocorrencia not null default 'MEDIA',
    domicilio_id text references public.domicilios(id) on delete set null,
    equipe_id uuid,
    foto_url text,
    geom geography(Point, 4326) not null,
    created_by uuid references auth.users(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
    );

    create table public.solicitacoes (
    id uuid primary key default gen_random_uuid(),
    protocolo text not null unique,
    domicilio_id text references public.domicilios(id) on delete set null,
    cpf_nis_hash text,
    status text not null default 'ABERTA',
    created_by uuid references auth.users(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
    );

    create table public.equipes (
    id uuid primary key default gen_random_uuid(),
    nome text not null,
    tecnico_id uuid references auth.users(id) on delete set null,
    status text not null default 'DISPONIVEL',
    geom geography(Point, 4326),
    updated_at timestamptz not null default now()
    );

    create table public.rede_trechos (
    id uuid primary key default gen_random_uuid(),
    nome text,
    geom geography(LineString, 4326) not null,
    created_at timestamptz not null default now()
    );

    alter table public.ocorrencias add constraint ocorrencias_equipe_fk foreign key (equipe_id) references public.equipes(id) on delete set null;

    create index domicilios_geom_idx on public.domicilios using gist (geom);
    create index ocorrencias_geom_idx on public.ocorrencias using gist (geom);
    create index equipes_geom_idx on public.equipes using gist (geom);
    create index rede_trechos_geom_idx on public.rede_trechos using gist (geom);

    create or replace function public.touch_updated_at()
    returns trigger language plpgsql as $$
    begin
    new.updated_at = now();
    return new;
    end;
    $$;

    create trigger domicilios_touch before update on public.domicilios for each row execute function public.touch_updated_at();
    create trigger ocorrencias_touch before update on public.ocorrencias for each row execute function public.touch_updated_at();
    create trigger solicitacoes_touch before update on public.solicitacoes for each row execute function public.touch_updated_at();
    create trigger equipes_touch before update on public.equipes for each row execute function public.touch_updated_at();

    alter table public.domicilios enable row level security;
    alter table public.ocorrencias enable row level security;
    alter table public.solicitacoes enable row level security;
    alter table public.equipes enable row level security;
    alter table public.rede_trechos enable row level security;
    alter table public.profiles enable row level security;

    create policy "authenticated users read map data" on public.domicilios for select to authenticated using (true);
    create policy "authenticated users read occurrences" on public.ocorrencias for select to authenticated using (true);
    create policy "authenticated users create occurrences" on public.ocorrencias for insert to authenticated with check (created_by = auth.uid());
    create policy "authenticated users update occurrences" on public.ocorrencias for update to authenticated using (true) with check (true);
    create policy "authenticated users read requests" on public.solicitacoes for select to authenticated using (created_by = auth.uid() or exists (select 1 from public.profiles where id = auth.uid() and perfil in ('tecnico', 'gestor')));
    create policy "authenticated users create requests" on public.solicitacoes for insert to authenticated with check (created_by = auth.uid());
    create policy "authenticated users read teams" on public.equipes for select to authenticated using (true);
    create policy "technicians update own team" on public.equipes for update to authenticated using (tecnico_id = auth.uid()) with check (tecnico_id = auth.uid());
    create policy "authenticated users read network" on public.rede_trechos for select to authenticated using (true);
    create policy "users read own profile" on public.profiles for select to authenticated using (id = auth.uid());

    alter table public.domicilios replica identity full;
    alter table public.ocorrencias replica identity full;
    alter table public.solicitacoes replica identity full;
    alter table public.equipes replica identity full;

    alter publication supabase_realtime add table public.domicilios;
    alter publication supabase_realtime add table public.ocorrencias;
    alter publication supabase_realtime add table public.solicitacoes;
    alter publication supabase_realtime add table public.equipes;
