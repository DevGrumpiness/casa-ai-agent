from fastapi import FastAPI

app = FastAPI(
    title="Casa Vazquez AI Agent api",
    version="0.1.0",
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}