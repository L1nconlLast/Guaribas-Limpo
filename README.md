# Guaribas Limpo

**Mapeando a última milha, conectando famílias, protegendo o rio.**

MVP desenvolvido para o Hackathon O Piauí Que Queremos.

[Acessar o MVP](https://l1nconllast.github.io/Guaribas-Limpo/)

## O problema

Em Picos (PI), a rede de esgoto pode chegar à rua, mas nem sempre chega até a casa. Barreiras financeiras, falta de informação e dificuldade de acesso à Tarifa Social mantêm famílias desconectadas, enquanto descartes irregulares pressionam a saúde pública e o Rio Guaribas.

## A solução

O Guaribas Limpo transforma o mapa da rede em um mapa de ação:

| Etapa | Objetivo |
| --- | --- |
| **MAPEAR** | Identificar rede disponível, domicílios pendentes e ocorrências. |
| **CONECTAR** | Facilitar a consulta de elegibilidade e a solicitação de ligação. |
| **MEDIR** | Acompanhar indicadores operacionais e territoriais. |

## Demo

O MVP possui três abas:

1. **Mapa:** visualização georreferenciada da última milha.
2. **Conecte sua Casa:** fluxo CPF/NIS, Tarifa Social e solicitação.
3. **Painel:** KPIs e gráficos demonstrativos.

Os dados são fictícios. A integração com concessionária, Prefeitura e Tarifa Social depende de validação e autorização institucional.

## Executar localmente

```bash
git clone https://github.com/L1nconlLast/Guaribas-Limpo.git
cd Guaribas-Limpo
```

Abra `index.html` no navegador. O mapa usa Leaflet e OpenStreetMap via CDN, portanto precisa de conexão com a internet para carregar os tiles.

## Estrutura

```text
Guaribas-Limpo/
├── .github/workflows/pages.yml  # Deploy automático no GitHub Pages
├── docs/demo.md                  # Roteiro de demonstração
├── docs/pitch.md                 # Estrutura dos slides
├── src/styles.css                # Estilos responsivos
├── src/app.js                    # Dados e interações
├── index.html                    # As três abas do MVP
├── LICENSE
└── README.md
```

## Tecnologias

- Leaflet e OpenStreetMap para o mapa;
- HTML, CSS e JavaScript sem dependências de build;
- GitHub Pages para hospedagem do MVP.

Para produção, estão previstos PostgreSQL/PostGIS, backend Flask e integração institucional com dados autorizados.

## Próximos passos

- [ ] Integrar dados oficiais da concessionária e da Prefeitura.
- [ ] Adicionar persistência para vistorias e solicitações.
- [ ] Validar um piloto no bairro Paroquial.
- [ ] Expandir para municípios da bacia do Rio Guaribas.
- [ ] Desenvolver o módulo educacional Guardiões da Água.

## Licença

MIT. Consulte [LICENSE](LICENSE).
