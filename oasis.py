"""Small browser-safe data layer for the OASIS demonstration."""

ACCIDENTS = [
    {"data": "2026-01-02", "rodovia": "BR-493", "municipio": "Guapimirim", "tipo": "Colisão lateral", "feridos": 1, "mortos": 0},
    {"data": "2026-01-02", "rodovia": "BR-116", "municipio": "Barra Mansa", "tipo": "Derramamento de carga", "feridos": 1, "mortos": 0},
    {"data": "2026-01-03", "rodovia": "BR-101", "municipio": "Itaboraí", "tipo": "Colisão traseira", "feridos": 2, "mortos": 0},
    {"data": "2026-01-04", "rodovia": "BR-040", "municipio": "Petrópolis", "tipo": "Saída de leito carroçável", "feridos": 0, "mortos": 1},
    {"data": "2026-01-05", "rodovia": "BR-116", "municipio": "Resende", "tipo": "Colisão frontal", "feridos": 3, "mortos": 1},
    {"data": "2026-01-06", "rodovia": "BR-493", "municipio": "Magé", "tipo": "Tombamento", "feridos": 1, "mortos": 0},
    {"data": "2026-01-07", "rodovia": "BR-101", "municipio": "São Gonçalo", "tipo": "Colisão lateral", "feridos": 4, "mortos": 0},
    {"data": "2026-01-08", "rodovia": "BR-040", "municipio": "Duque de Caxias", "tipo": "Atropelamento", "feridos": 1, "mortos": 0},
]


def listar_rodovias():
    return sorted({acidente["rodovia"] for acidente in ACCIDENTS})


def analisar(rodovia="todas"):
    dados = [
        acidente for acidente in ACCIDENTS
        if rodovia == "todas" or acidente["rodovia"] == rodovia
    ]
    total = len(dados)
    feridos = sum(acidente["feridos"] for acidente in dados)
    mortos = sum(acidente["mortos"] for acidente in dados)
    por_rodovia = {
        estrada: sum(item["rodovia"] == estrada for item in dados)
        for estrada in listar_rodovias()
    }
    return {
        "total": total,
        "feridos": feridos,
        "mortos": mortos,
        "media_feridos": round(feridos / total, 2) if total else 0,
        "por_rodovia": por_rodovia,
        "amostra": dados[:6],
    }
