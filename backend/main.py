from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import router
import uvicorn

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"Hello": "World"}


app.include_router(router, prefix='/items')

if __name__ == '__main__':
    uvicorn.run("main:app", host='127.0.0.1', port=8000, reload=True)
