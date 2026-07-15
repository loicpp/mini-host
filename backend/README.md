# Backend - MiniHost

Le backend est développé en Python avec Flask et PyWebView. Il est architecturé selon le modèle de l'Architecture Hexagonale (Ports et Adaptateurs).

## 🧪 Lancer les Tests

Les tests unitaires sont écrits avec `pytest`.

1. Activez l'environnement virtuel :
```bash
source venv/bin/activate
# ou sous Windows: venv\Scripts\activate
```

2. Lancer les tests simples :
```bash
PYTHONPATH=. pytest tests/
```

3. Lancer les tests avec le rapport de couverture (Coverage) :
L'objectif est de maintenir au minimum **70% de couverture**.
```bash
PYTHONPATH=. pytest --cov=core tests/
```
