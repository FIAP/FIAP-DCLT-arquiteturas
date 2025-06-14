# Diagramas de Sequência - Central de Mídia

## Visão Geral

Este documento apresenta os principais fluxos da Central de Mídia através de diagramas de sequência detalhados, mostrando as interações entre os diferentes componentes do sistema.

## 1. Fluxo de Aquisição de Conteúdo

### 1.1 Solicitação de Compra/Aluguel

```mermaid
sequenceDiagram
    participant App as Aplicativo Mobile
    participant API as WebAPI
    participant CC as ConteudoController
    participant CR as ConteudoRepository
    participant ConsR as ConsumidorRepository
    participant TR as TituloRepository
    participant PCR as PlanoComercialRepository
    participant SR as SituacaoRepository
    participant PR as PagamentoRepository
    participant DB as Database

    Note over App,DB: Fluxo de Aquisição de Conteúdo

    App->>+API: POST /Conteudo
    Note right of App: {ConsumidorId, TituloId, PlanoComercialId, Valor, Token}
    
    API->>+CC: PostConteudo(ConteudoViewModel)
    
    CC->>+ConsR: FirstOrDefault(c => c.Id == ConsumidorId)
    ConsR->>+DB: SELECT * FROM Consumidor WHERE Id = ?
    DB-->>-ConsR: Dados do Consumidor
    ConsR-->>-CC: Consumidor
    
    CC->>+TR: FirstOrDefault(c => c.Id == TituloId)
    TR->>+DB: SELECT * FROM Titulo WHERE Id = ?
    DB-->>-TR: Dados do Título
    TR-->>-CC: Titulo
    
    CC->>+PCR: FirstOrDefault(c => c.Id == PlanoComercialId)
    PCR->>+DB: SELECT * FROM PlanoComercial WHERE Id = ?
    DB-->>-PCR: Dados do Plano
    PCR-->>-CC: PlanoComercial
    
    alt Validação Bem-sucedida
        
        CC->>CC: Verificar se conteúdo já foi alugado
        
        alt Conteúdo não alugado
            
            Note over CC: Criar nova situação
            CC->>CC: new Situacao("Solicitação de conteúdo", AguardandoPagamento)
            CC->>+SR: Add(situacao)
            SR->>+DB: INSERT INTO Situacao
            DB-->>-SR: ID da Situação
            SR-->>-CC: Situacao criada
            
            Note over CC: Criar novo conteúdo
            CC->>CC: new Conteudo(DataAquisicao, Periodo, Token)
            
            Note over CC: Criar novo pagamento
            CC->>CC: new Pagamento(Data, Valor, false, AguardandoPagamento)
            
            CC->>CC: conteudo.AssociarPagamento(pagamento)
            CC->>CC: conteudo.AssociarSituacao(situacao)
            CC->>CC: consumidor.AssociarConteudo(conteudo)
            
            CC->>+CR: Add(conteudo)
            CR->>+DB: INSERT INTO Conteudo, Pagamento
            DB-->>-CR: Conteúdo criado
            CR-->>-CC: Sucesso
            
            CC->>API: ResultadoViewModel(OK, "Conteúdo cadastrado", Token)
            
        else Conteúdo já alugado
            
            CC->>API: ResultadoViewModel(NotModified, "Conteúdo já existente")
            
        end
        
    else Validação Falhou
        
        CC->>API: ResultadoViewModel(NotModified, "Erro na validação")
        
    end
    
    CC-->>-API: Retorna resultado
    API-->>-App: Resultado da operação
```

### 1.2 Atualização de Status de Pagamento

```mermaid
sequenceDiagram
    participant Gateway as Payment Gateway
    participant API as WebAPI
    participant CC as ConteudoController
    participant CR as ConteudoRepository
    participant SR as SituacaoRepository
    participant PR as PagamentoRepository
    participant DB as Database

    Note over Gateway,DB: Callback de Pagamento

    Gateway->>+API: GET /Conteudo/AtualizarConteudo
    Note right of Gateway: {idConteudo, status, identificadorAparelho, player}
    
    API->>+CC: GetAtualizarConteudo(idConteudo, status)
    
    CC->>+CR: FirstOrDefault(c => c.Id == idConteudo)
    CR->>+DB: SELECT * FROM Conteudo WHERE Id = ?
    DB-->>-CR: Dados do Conteúdo
    CR-->>-CC: Conteudo
    
    alt Conteúdo encontrado
        
        alt Status = "Aprovado"
            
            Note over CC: Criar situação de liberação
            CC->>CC: new Situacao("Conteúdo liberado", Liberado)
            CC->>+SR: Add(situacao)
            SR->>+DB: INSERT INTO Situacao
            DB-->>-SR: Situação criada
            SR-->>-CC: Sucesso
            
            Note over CC: Atualizar pagamento
            CC->>CC: new Pagamento(true, Aprovado)
            CC->>+PR: Add(pagamento)
            PR->>+DB: INSERT INTO Pagamento
            DB-->>-PR: Pagamento criado
            PR-->>-CC: Sucesso
            
            CC->>API: ResultadoViewModel(OK, "Conteúdo liberado")
            
        else Status = "Cancelado"
            
            Note over CC: Criar situação de cancelamento
            CC->>CC: new Situacao("Solicitação Cancelada", Cancelado)
            CC->>+SR: Add(situacao)
            SR->>+DB: INSERT INTO Situacao
            DB-->>-SR: Situação criada
            SR-->>-CC: Sucesso
            
            Note over CC: Atualizar pagamento
            CC->>CC: new Pagamento(false, Cancelado)
            CC->>+PR: Add(pagamento)
            PR->>+DB: INSERT INTO Pagamento
            DB-->>-PR: Pagamento atualizado
            PR-->>-CC: Sucesso
            
            CC->>API: ResultadoViewModel(OK, "Conteúdo cancelado")
            
        else Status = "Devolvido"
            
            Note over CC: Processar devolução
            CC->>CC: new Situacao("Conteúdo não Liberado", Cancelado)
            CC->>+SR: Add(situacao)
            SR->>+DB: INSERT INTO Situacao
            DB-->>-SR: Situação criada
            SR-->>-CC: Sucesso
            
            CC->>API: ResultadoViewModel(OK, "Conteúdo devolvido")
            
        end
        
    else Conteúdo não encontrado
        
        CC->>API: ResultadoViewModel(NotModified, "Conteúdo não encontrado")
        
    end
    
    CC-->>-API: Retorna resultado
    API-->>-Gateway: Resultado da operação
```

## 2. Fluxo de Exibição de Destaque

### 2.1 Carregamento da Página Principal

```mermaid
sequenceDiagram
    participant App as Aplicativo
    participant API as WebAPI
    participant DC as DestaqueController
    participant AR as AparelhoRepository
    participant DR as DestaqueRepository
    participant ConsR as ConsumidorRepository
    participant NR as NoticiaRepository
    participant DB as Database

    Note over App,DB: Carregamento da Tela de Destaque

    App->>+API: GET /Destaque
    Note right of App: {identificadorAparelho, consumidorId?, estado?, publicoAlvo?, player?}
    
    API->>+DC: GetDestaque(identificadorAparelho, consumidorId, estado, publicoAlvo, player)
    
    Note over DC: Validar aparelho
    DC->>+AR: CreateQuery<IGetAparelhoByGuid>()
    AR->>+DB: SELECT * FROM Aparelho WHERE Identificador = ?
    DB-->>-AR: Dados do Aparelho
    AR-->>-DC: Aparelho validado
    
    Note over DC: Buscar página de destaque ativa
    DC->>+DR: CreateQuery<IGetPaginaDestaque>()
    DR->>+DB: SELECT * FROM PaginaDestaque WHERE Periodo BETWEEN ? AND ?
    DB-->>-DR: Página de Destaque
    DR-->>-DC: PaginaDestaque
    
    alt Consumidor logado (consumidorId > 0)
        
        DC->>+ConsR: CreateQuery<IGetEntityById<Consumidor>>()
        ConsR->>+DB: SELECT * FROM Consumidor WHERE Id = ?
        DB-->>-ConsR: Dados do Consumidor
        ConsR-->>-DC: Consumidor
        
        DC->>DC: GetIdade(consumidor.DataNascimento)
        Note over DC: Calcular idade para filtros
        
        alt Página de destaque existe
            
            par Buscar conteúdos em paralelo
                
                DC->>+DR: getDestaques(paginaDestaque, idade)
                DR->>+DB: SELECT * FROM Destaque WHERE...
                DB-->>-DR: Lista de Destaques
                DR-->>-DC: Destaques filtrados
                
            and
                
                DC->>+DR: GetDestaquesAoVivo(paginaDestaque, idade)
                DR->>+DB: SELECT * FROM DestaqueAoVivo WHERE...
                DB-->>-DR: Lista de Destaques Ao Vivo
                DR-->>-DC: Destaques Ao Vivo filtrados
                
            and
                
                DC->>+DR: getSubDestaques(paginaDestaque, idade)
                DR->>+DB: SELECT * FROM SubDestaque WHERE...
                DB-->>-DR: Lista de SubDestaques
                DR-->>-DC: SubDestaques filtrados
                
            and
                
                DC->>+DR: GetNoticias(paginaDestaque, idade)
                DR->>+DB: SELECT * FROM Noticia WHERE...
                DB-->>-DR: Lista de Notícias
                DR-->>-DC: Notícias filtradas
                
            and
                
                DC->>+DR: getAnuncios(paginaDestaque, estado, idade)
                DR->>+DB: SELECT * FROM Anuncio WHERE...
                DB-->>-DR: Lista de Anúncios
                DR-->>-DC: Anúncios filtrados
                
            end
            
            DC->>DC: ModelToViewModel(destaques, destaquesAoVivo, subDestaques, noticias, anuncios)
            
        else Sem página de destaque
            
            DC->>DC: DestaquePadrao()
            Note over DC: Retornar conteúdo padrão com destaques flagados
            
        end
        
    else Sem consumidor logado
        
        Note over DC: Usar idade padrão = 17 anos
        
        alt Página de destaque existe
            
            par Buscar conteúdos genéricos
                
                DC->>+DR: getDestaques(paginaDestaque, 17)
                DR->>+DB: SELECT * FROM Destaque WHERE...
                DB-->>-DR: Lista de Destaques
                DR-->>-DC: Destaques genéricos
                
            and
                
                DC->>+DR: GetDestaquesAoVivo(paginaDestaque, 17)
                DR->>+DB: SELECT * FROM DestaqueAoVivo WHERE...
                DB-->>-DR: Lista de Destaques Ao Vivo
                DR-->>-DC: Destaques Ao Vivo genéricos
                
            and
                
                DC->>+DR: getSubDestaques(paginaDestaque, 17)
                DR->>+DB: SELECT * FROM SubDestaque WHERE...
                DB-->>-DR: Lista de SubDestaques
                DR-->>-DC: SubDestaques genéricos
                
            end
            
            DC->>DC: ModelToViewModel(destaques, destaquesAoVivo, subDestaques, noticias, anuncios)
            
        else Sem página de destaque
            
            DC->>DC: DestaquePadrao()
            
        end
        
    end
    
    DC-->>-API: DestaqueViewModel
    API-->>-App: JSON com destaques organizados
```

## 3. Fluxo de Gerenciamento de Títulos (Admin)

### 3.1 Criação/Edição de Título

```mermaid
sequenceDiagram
    participant Admin as Administrador
    participant UI as Interface Web
    participant TC as TituloController
    participant TR as TituloRepository
    participant DB as Database
    participant SF as SessionFactory

    Note over Admin,SF: Gerenciamento de Títulos

    Admin->>+UI: Acessar formulário de título
    UI->>+TC: GET /Titulo/Create ou Edit/{id}
    
    TC->>TC: LoadParameters(id, false)
    
    par Carregar dados para formulário
        
        TC->>+TR: CreateQuery<IGetClassificacaoIndicativaAutoComplete>()
        TR->>+DB: SELECT * FROM ClassificacaoIndicativa
        DB-->>-TR: Lista de Classificações
        TR-->>-TC: ViewBag.Classificacao
        
    and
        
        TC->>+TR: CreateQuery<IGetSessaoAutoComplete>()
        TR->>+DB: SELECT * FROM Sessao
        DB-->>-TR: Lista de Sessões
        TR-->>-TC: ViewBag.Sessao
        
    and
        
        TC->>+TR: CreateQuery<IGetAllEmissora>()
        TR->>+DB: SELECT * FROM Emissora
        DB-->>-TR: Lista de Emissoras
        TR-->>-TC: ViewBag.Emissora
        
    and
        
        TC->>+TR: CreateQuery<IGetAllGenero>()
        TR->>+DB: SELECT * FROM Genero
        DB-->>-TR: Lista de Gêneros
        TR-->>-TC: ViewBag.Generos
        
    and
        
        TC->>+TR: CreateQuery<IGetAllCategoria>()
        TR->>+DB: SELECT * FROM Categoria WHERE TipoMenu = ?
        DB-->>-TR: Lista de Categorias
        TR-->>-TC: ViewBag.Categorias
        
    end
    
    alt Edição (id > 0)
        
        TC->>+TR: FirstOrDefault(c => c.Id == id)
        TR->>+DB: SELECT * FROM Titulo WHERE Id = ?
        DB-->>-TR: Dados do Título
        TR-->>-TC: Titulo
        
        TC->>TC: CarregarNota(id)
        Note over TC: Calcular avaliações dos materiais
        
    end
    
    TC-->>-UI: View com dados carregados
    UI-->>-Admin: Formulário preenchido
    
    Admin->>+UI: Submeter formulário
    UI->>+TC: POST /Titulo/Create ou Edit
    
    alt Operação de Criação
        
        TC->>TC: BeforeRepositoryAdd(titulo)
        TC->>+TR: Add(titulo)
        TR->>+DB: INSERT INTO Titulo
        DB-->>-TR: Título criado
        TR-->>-TC: Sucesso
        TC->>TC: AfterRepositoryAdd(titulo)
        TC->>TC: CategoriasAutomaticas(titulo)
        
    else Operação de Edição
        
        TC->>TC: UpdateModelData(id, viewModel)
        TC->>+SF: GetCurrentSession().Update(entity)
        SF->>+DB: UPDATE Titulo SET ...
        DB-->>-SF: Título atualizado
        SF-->>-TC: Sucesso
        TC->>TC: CategoriasAutomaticas(titulo)
        
    end
    
    TC-->>-UI: RedirectToAction("Index")
    UI-->>-Admin: Lista de títulos atualizada
```

### 3.2 Exclusão de Títulos

```mermaid
sequenceDiagram
    participant Admin as Administrador
    participant UI as Interface Web
    participant TC as TituloController
    participant TR as TituloRepository
    participant DB as Database

    Note over Admin,DB: Exclusão de Títulos

    alt Exclusão Individual
        
        Admin->>+UI: Clicar em "Excluir" no título
        UI->>+TC: DELETE /Titulo/{id}
        
        TC->>+TR: FirstOrDefault(c => c.Id == id)
        TR->>+DB: SELECT * FROM Titulo WHERE Id = ?
        DB-->>-TR: Dados do Título
        TR-->>-TC: Titulo
        
        TC->>TC: BeforeRepositoryRemove(titulo)
        TC->>+TR: Remove(titulo)
        TR->>+DB: DELETE FROM Titulo WHERE Id = ?
        DB-->>-TR: Título removido
        TR-->>-TC: Sucesso
        TC->>TC: AfterRepositoryRemove(titulo)
        
        TC->>UI: Sucesso
        
    else Exclusão Múltipla
        
        Admin->>+UI: Selecionar múltiplos títulos + "Excluir Selecionados"
        UI->>+TC: POST /Titulo/DeleteMoreThanOne
        Note right of UI: chkTituloId = "1,2,3,4"
        
        TC->>TC: Request["chkTituloId"].Split(',')
        
        loop Para cada ID selecionado
            
            TC->>+TR: FirstOrDefault(c => c.Id == id)
            TR->>+DB: SELECT * FROM Titulo WHERE Id = ?
            DB-->>-TR: Dados do Título
            TR-->>-TC: Titulo
            
            TC->>TC: BeforeRepositoryRemove(titulo)
            TC->>+TR: Remove(titulo)
            TR->>+DB: DELETE FROM Titulo WHERE Id = ?
            DB-->>-TR: Título removido
            TR-->>-TC: Sucesso
            TC->>TC: AfterRepositoryRemove(titulo)
            
        end
        
        TC->>UI: RedirectToAction("Index")
        
    end
    
    TC-->>-UI: Operação concluída
    UI-->>-Admin: Títulos removidos
```

## 4. Fluxo de Busca e Filtros

### 4.1 Pesquisa de Títulos

```mermaid
sequenceDiagram
    participant User as Usuário
    participant UI as Interface
    participant TC as TituloController
    participant TR as TituloRepository
    participant DB as Database

    Note over User,DB: Pesquisa de Conteúdo

    User->>+UI: Digite termo de busca + filtros
    UI->>+TC: GET /Titulo/Index
    Note right of UI: {Termo, TipoMaterial, pageNumber}
    
    TC->>TC: GetSearchQuery()
    TC->>+TR: CreateQuery<ITituloPagedQuery>()
    
    TR->>TR: Configurar query com parâmetros
    Note over TR: Termo = Request["Termo"]<br/>TipoMaterial = Request["TipoMaterial"]
    
    TR->>+DB: SELECT * FROM Titulo WHERE Nome LIKE ? AND TipoMaterial = ?
    Note over DB: Paginação + Filtros aplicados
    DB-->>-TR: Resultados paginados
    TR-->>-TC: PagedResult<Titulo>
    
    TC->>TC: ViewBag.Termo = query.Termo
    TC-->>-UI: View com resultados
    UI-->>-User: Lista de títulos filtrada
    
    alt Navegação de Páginas
        
        User->>+UI: Clicar em página 2, 3, etc.
        UI->>+TC: GET /Titulo/Paginacao
        Note right of UI: {pageNumber}
        
        TC->>+TR: CreateQuery com nova página
        TR->>+DB: SELECT * FROM Titulo LIMIT ? OFFSET ?
        DB-->>-TR: Próxima página de resultados
        TR-->>-TC: PagedResult<Titulo>
        
        TC-->>-UI: Partial view com nova página
        UI-->>-User: Resultados atualizados via AJAX
        
    end
```

