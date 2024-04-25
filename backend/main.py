from fastapi import FastAPI

app = FastAPI()


@app.get("/search")
async def search(q: str):
    return {"message": f"for: {q}"}
