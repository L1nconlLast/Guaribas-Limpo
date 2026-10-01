insert into public.domicilios (id, endereco, status, tarifa_social, geom) values
  ('0241', 'Rua São Vicente, 120', 'CONECTADO', 'ATIVA', ST_SetSRID(ST_MakePoint(-41.4676, -7.0736), 4326)::geography),
  ('0242', 'Rua São Vicente, 156', 'PENDENTE', 'VERIFICAR', ST_SetSRID(ST_MakePoint(-41.4672, -7.0740), 4326)::geography),
  ('0243', 'Rua São Vicente, 198', 'PENDENTE', 'VERIFICAR', ST_SetSRID(ST_MakePoint(-41.4667, -7.0744), 4326)::geography),
  ('0244', 'Av. Nossa Senhora, 35', 'CONECTADO', 'ATIVA', ST_SetSRID(ST_MakePoint(-41.4685, -7.0754), 4326)::geography),
  ('0245', 'Rua do Mercado, 18', 'PENDENTE', 'VERIFICAR', ST_SetSRID(ST_MakePoint(-41.4669, -7.0772), 4326)::geography),
  ('0246', 'Rua da Paz, 58', 'CONECTADO', 'NÃO INFORMADA', ST_SetSRID(ST_MakePoint(-41.4674, -7.0793), 4326)::geography)
on conflict (id) do update set endereco = excluded.endereco, status = excluded.status, tarifa_social = excluded.tarifa_social, geom = excluded.geom;

insert into public.rede_trechos (nome, geom) values
  ('Trecho demonstrativo principal', ST_GeomFromText('LINESTRING(-41.4682 -7.0729, -41.4667 -7.0752, -41.4658 -7.0776, -41.4667 -7.0803)', 4326)::geography);

insert into public.ocorrencias (tipo, descricao, prioridade, geom) values
  ('ESGOTO_A_CEU_ABERTO', 'Ponto de lançamento irregular próximo a vala.', 'ALTA', ST_SetSRID(ST_MakePoint(-41.4663, -7.0768), 4326)::geography),
  ('DESCARTE_IRREGULAR', 'Resíduos e efluentes identificados em área aberta.', 'MEDIA', ST_SetSRID(ST_MakePoint(-41.4659, -7.0783), 4326)::geography)
  ;
