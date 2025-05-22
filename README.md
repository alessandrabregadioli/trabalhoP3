## Configurações

Para isso deverá possuir pipx (do Python) instalado, além disso, deverá ter pgAdmin 4 (SGBD Postgres) instalado e realizar o deploy.

***Por enquanto será este tutorial até eu dockerizar o sistema***

1. Baixar poetry para baixar bibliotecas 

`` pipx install poetry ``

2. Criar o ambiente virtual do projeto:

***Acredito que já esteja mas... para garantir ***

`` poetry new lanchonete ``

`` cd lanchonete ``

`` poetry shell ``

`` poetry env use python3.12 ``  (Obrigatório)

Fecha o terminal e abre novamente

`` cd lanchonete ``

`` poetry shell ``


3. Adiciona as bibliotecas necessárias que utilizaremos

***Acredito que já esteja instalado quando copiar o repositório mas... para garantir ***

`` poetry add pydantic-settings ruff taskipy pytest fastapi[standard] pydantic sqlalchemy httpx alembic pwdlib[argon2] python-multipart tzdata PyJWT pytest-cov psycopg2-binary testcontainers[postgresql] ``

`` poetry add --group dev factory-boy freezegun``


4. Adicionar comandos simples para rodar no terminal. Em trabalhop3/lanchonete/pyproject.toml adiciona essa configuração (de preferência entre as bibliotecas instaladas e a tag ``[build-system]``):

***Acredito que já esteja no arquivo mas... para garantir ***

``[tool.ruff]``

``line-length = 120``

``extend-exclude = ['migrations']``


``[tool.ruff.lint]``

``preview = true``

``select = ['I', 'F', 'E', 'W', 'PL', 'PT']``


``[tool.ruff.format]``

``preview = true``
``quote-style = 'single'``


``[tool.pytest.ini_options]``

``pythonpath = "."``

``addopts = '-p no:warnings'``


``[tool.taskipy.tasks]``

``run = 'fastapi dev lanchonete/app.py'``

``test = 'pytest -s --cov=lanchonete -vv'``

``post_test = 'coverage html'``

``lint = 'ruff check . && ruff check . --diff'``

``format = 'ruff check . --fix && ruff format .'``

``pre_test = 'task lint'``


5. Criar as tabelas no Postgres com SQLAchemy e Alembic:

Primeiro, no arquivo lanchonete/.env vai definir DATABASE_URl para conectar com o SGBD na seguinte forma:

``DATABASE_URl="postgresql+psycopg2://postgres:[senha_postgres]@localhost:5432/lanchonete"``

``alembic init migrations``

``alembic revision --autogenerate -m "[qualquer_nome]" ``

``alembic upgrade head``  (Para utilizar a versão atual do esquema do banco de dados)

Em migrations/env.py o arquivo deverá está desta forma:

```
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

from lanchonete.models import table_registry
from lanchonete.settings import Settings

config = context.config
config.set_main_option('sqlalchemy.url', Settings().DATABASE_URL)


if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = table_registry.metadata
```

*** Já vou adicionar os arquivos e mais instruções ;) ***