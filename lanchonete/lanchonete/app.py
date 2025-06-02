from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from routers import cliente, comanda, combo, produto, codigo_promocional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Ou especifique seus domínios ["http://localhost:3000", etc.]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(cliente.router)
app.include_router(produto.router)
app.include_router(combo.router)
app.include_router(comanda.router)
app.include_router(codigo_promocional.router)

templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def get_main(request: Request):
    return templates.TemplateResponse("main.html", {"request": request})

@app.get("/comanda", response_class=HTMLResponse)
async def get_comanda(request: Request):
    return templates.TemplateResponse("comanda.html", {"request": request})

@app.get("/produto-combo", response_class=HTMLResponse)
async def read_produto_combo(request: Request):
    return templates.TemplateResponse("cadastro_prod_comb.html", {"request": request})

@app.get("/gerenciamento", response_class=HTMLResponse)
async def read_gerenciamento(request: Request):
    return templates.TemplateResponse("gerenciamento_comanda.html", {"request": request})

