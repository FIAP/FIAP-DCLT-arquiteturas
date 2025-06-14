# 03 - Implementação de Código
## Detalhes de Classes e Interfaces dos Componentes Críticos

### Introdução

Este documento apresenta os detalhes de implementação dos componentes mais críticos do sistema, mostrando classes, interfaces e suas relações através de diagramas UML. O foco está nos padrões de design utilizados e na estrutura de dados.

### Padrões de Design Implementados

#### **Strategy Pattern:**
- `CostBasisMethod`: Diferentes algoritmos de cálculo de custo base
- `OrderType`: Diferentes tipos de execução de ordens
- `FeeCalculator`: Diferentes estruturas de taxas

#### **Factory Pattern:**
- `OrderFactory`: Criação de diferentes tipos de ordem
- `CalculatorFactory`: Criação de calculadoras específicas
- `ReportFactory`: Geração de diferentes tipos de relatório

#### **Observer Pattern:**
- `OrderStatusObserver`: Notificação de mudanças de status
- `PnLObserver`: Atualização automática de P&L
- `RiskObserver`: Monitoramento de limites de risco

#### **Repository Pattern:**
- Abstração do acesso a dados
- Facilita testes unitários
- Permite mudança de tecnologia de persistência

#### **Command Pattern:**
- `OrderCommand`: Encapsula operações de ordem
- `TransactionCommand`: Operações de transação
- `RebalanceCommand`: Operações de rebalanceamento

## 3.1 Identity Service - Estrutura de Classes

```mermaid
classDiagram
    class AuthController {
        -authService: AuthService
        -logger: Logger
        +register(req, res, next): Promise~void~
        +login(req, res, next): Promise~void~
        +logout(req, res, next): Promise~void~
        +refreshToken(req, res, next): Promise~void~
        +validateToken(req, res, next): Promise~void~
        -validateInput(data): ValidationResult
        -handleError(error, res): void
    }
    
    class AuthService {
        -userRepository: UserRepository
        -jwtService: JWTService
        -passwordService: PasswordService
        +authenticateUser(email, password): Promise~AuthResult~
        +generateTokens(user): TokenPair
        +refreshAccessToken(refreshToken): Promise~string~
        +validatePassword(password, hash): Promise~boolean~
        +hashPassword(password): Promise~string~
        +revokeToken(token): Promise~void~
    }
    
    class JWTService {
        -secretKey: string
        -refreshSecretKey: string
        -accessTokenExpiry: string
        -refreshTokenExpiry: string
        +generateAccessToken(payload): string
        +generateRefreshToken(payload): string
        +verifyAccessToken(token): Promise~JWTPayload~
        +verifyRefreshToken(token): Promise~JWTPayload~
        +decodeToken(token): JWTPayload
    }
    
    class PasswordService {
        -saltRounds: number
        +hash(password): Promise~string~
        +compare(password, hash): Promise~boolean~
        +generateSalt(): string
        +validateStrength(password): ValidationResult
    }
    
    class UserRepository {
        -db: Database
        +findByEmail(email): Promise~User~
        +findById(id): Promise~User~
        +create(userData): Promise~User~
        +update(id, userData): Promise~User~
        +delete(id): Promise~boolean~
        +findByRefreshToken(token): Promise~User~
    }
    
    class User {
        +id: string
        +email: string
        +passwordHash: string
        +firstName: string
        +lastName: string
        +isActive: boolean
        +refreshToken: string
        +createdAt: Date
        +updatedAt: Date
        +getFullName(): string
        +isValidEmail(): boolean
    }
    
    class AuthResult {
        +success: boolean
        +user: User
        +accessToken: string
        +refreshToken: string
        +expiresIn: number
        +message: string
    }
    
    class TokenPair {
        +accessToken: string
        +refreshToken: string
        +expiresIn: number
        +tokenType: string
    }
    
    class ValidationResult {
        +isValid: boolean
        +errors: string[]
        +warnings: string[]
    }
    
    class JWTPayload {
        +userId: string
        +email: string
        +iat: number
        +exp: number
        +type: string
    }
    
    %% Relacionamentos
    AuthController --> AuthService
    AuthService --> UserRepository
    AuthService --> JWTService
    AuthService --> PasswordService
    UserRepository --> User
    AuthService --> AuthResult
    JWTService --> TokenPair
    JWTService --> JWTPayload
    PasswordService --> ValidationResult
    AuthController --> ValidationResult
```

**Responsabilidades das Classes:**
- **AuthController**: Gerencia endpoints de autenticação
- **AuthService**: Lógica de negócio de autenticação
- **JWTService**: Geração e validação de tokens JWT
- **PasswordService**: Hash e validação de senhas
- **UserRepository**: Acesso a dados de usuários

## 3.2 Portfolio Service - Estrutura de Classes

```mermaid
classDiagram
    class PortfolioController {
        -portfolioService: PortfolioService
        -logger: Logger
        +getPortfolios(req, res): Promise~void~
        +getPortfolioById(req, res): Promise~void~
        +createPortfolio(req, res): Promise~void~
        +updatePortfolio(req, res): Promise~void~
        +deletePortfolio(req, res): Promise~void~
        +getPortfolioPerformance(req, res): Promise~void~
        +getDiversificationAnalysis(req, res): Promise~void~
    }
    
    class PortfolioService {
        -portfolioRepository: PortfolioRepository
        -positionService: PositionService
        -riskService: RiskService
        -performanceAnalyzer: PerformanceAnalyzer
        +createPortfolio(data): Promise~Portfolio~
        +getPortfoliosByUser(userId): Promise~Portfolio[]~
        +calculateTotalValue(portfolioId): Promise~number~
        +getPerformanceMetrics(portfolioId): Promise~PerformanceMetrics~
        +getDiversificationMetrics(portfolioId): Promise~DiversificationMetrics~
        +rebalancePortfolio(portfolioId, strategy): Promise~RebalanceResult~
    }
    
    class PositionService {
        -positionRepository: PositionRepository
        -assetService: AssetService
        +getPositionsByPortfolio(portfolioId): Promise~Position[]~
        +addPosition(portfolioId, assetId, quantity): Promise~Position~
        +updatePosition(positionId, quantity): Promise~Position~
        +removePosition(positionId): Promise~boolean~
        +calculatePositionValue(position): Promise~number~
        +getPositionPnL(positionId): Promise~PnLResult~
    }
    
    class RiskService {
        -riskAnalyzer: RiskAnalyzer
        -marketDataService: MarketDataService
        +calculatePortfolioRisk(portfolioId): Promise~RiskMetrics~
        +calculateVaR(positions, confidence): Promise~number~
        +getCorrelationMatrix(assetIds): Promise~CorrelationMatrix~
        +performStressTest(portfolioId, scenario): Promise~StressTestResult~
        +checkRiskLimits(portfolioId): Promise~RiskLimitCheck~
    }
    
    class PerformanceAnalyzer {
        -marketDataService: MarketDataService
        +calculateReturns(portfolioId, period): Promise~ReturnMetrics~
        +calculateSharpeRatio(portfolioId): Promise~number~
        +calculateBeta(portfolioId, benchmark): Promise~number~
        +performAttributionAnalysis(portfolioId): Promise~AttributionResult~
        +compareWithBenchmark(portfolioId, benchmarkId): Promise~ComparisonResult~
    }
    
    class Portfolio {
        +id: string
        +userId: string
        +name: string
        +description: string
        +strategy: string
        +totalValue: number
        +cashBalance: number
        +isActive: boolean
        +createdAt: Date
        +updatedAt: Date
        +positions: Position[]
        +calculateTotalValue(): number
        +getAssetAllocation(): AssetAllocation[]
    }
    
    class Position {
        +id: string
        +portfolioId: string
        +assetId: string
        +quantity: number
        +averageCost: number
        +currentPrice: number
        +marketValue: number
        +unrealizedPnL: number
        +createdAt: Date
        +updatedAt: Date
        +calculateMarketValue(): number
        +calculatePnL(): number
    }
    
    class PerformanceMetrics {
        +totalReturn: number
        +annualizedReturn: number
        +volatility: number
        +sharpeRatio: number
        +maxDrawdown: number
        +beta: number
        +alpha: number
        +informationRatio: number
    }
    
    class RiskMetrics {
        +portfolioVaR: number
        +componentVaR: ComponentVaR[]
        +expectedShortfall: number
        +volatility: number
        +correlationRisk: number
        +concentrationRisk: number
        +liquidityRisk: number
    }
    
    class DiversificationMetrics {
        +assetAllocation: AssetAllocation[]
        +sectorAllocation: SectorAllocation[]
        +geographicAllocation: GeographicAllocation[]
        +diversificationRatio: number
        +concentrationIndex: number
        +effectiveNumberOfAssets: number
    }
    
    %% Relacionamentos
    PortfolioController --> PortfolioService
    PortfolioService --> PositionService
    PortfolioService --> RiskService
    PortfolioService --> PerformanceAnalyzer
    PortfolioService --> Portfolio
    PositionService --> Position
    RiskService --> RiskMetrics
    PerformanceAnalyzer --> PerformanceMetrics
    PortfolioService --> DiversificationMetrics
    Portfolio --> Position
```

**Responsabilidades das Classes:**
- **PortfolioController**: Endpoints de gestão de carteiras
- **PortfolioService**: Lógica de negócio de portfolios
- **PositionService**: Gestão de posições individuais
- **RiskService**: Cálculos de risco e análise
- **PerformanceAnalyzer**: Métricas de performance

## 3.3 Transaction Service - Estrutura de Classes

```mermaid
classDiagram
    class OrderController {
        -orderService: OrderService
        -logger: Logger
        +placeOrder(req, res): Promise~void~
        +getOrderStatus(req, res): Promise~void~
        +cancelOrder(req, res): Promise~void~
        +getOrderHistory(req, res): Promise~void~
        +getOrderBook(req, res): Promise~void~
        -validateOrderRequest(data): ValidationResult
    }
    
    class OrderService {
        -orderRepository: OrderRepository
        -orderProcessor: OrderProcessor
        -portfolioService: PortfolioService
        -assetService: AssetService
        +placeOrder(orderData): Promise~Order~
        +cancelOrder(orderId): Promise~boolean~
        +getOrdersByUser(userId): Promise~Order[]~
        +processOrderExecution(orderId): Promise~ExecutionResult~
        +validateOrder(orderData): Promise~ValidationResult~
        +calculateOrderValue(order): Promise~number~
    }
    
    class OrderProcessor {
        -feeCalculator: FeeCalculator
        -riskValidator: RiskValidator
        -marketDataService: MarketDataService
        +processMarketOrder(order): Promise~ExecutionResult~
        +processLimitOrder(order): Promise~ExecutionResult~
        +processStopOrder(order): Promise~ExecutionResult~
        +validateOrderRisk(order): Promise~RiskValidationResult~
        +calculateExecutionPrice(order): Promise~number~
        +checkMarketHours(): boolean
    }
    
    class FeeCalculator {
        -feeStructure: FeeStructure
        +calculateCommission(order): number
        +calculateTax(order): number
        +calculateRegulatory(order): number
        +calculateTotalFees(order): FeeBreakdown
        +applyDiscounts(fees, user): FeeBreakdown
    }
    
    class Order {
        +id: string
        +userId: string
        +portfolioId: string
        +assetId: string
        +orderType: OrderType
        +side: OrderSide
        +quantity: number
        +price: number
        +stopPrice: number
        +status: OrderStatus
        +timeInForce: TimeInForce
        +executedQuantity: number
        +executedPrice: number
        +fees: FeeBreakdown
        +createdAt: Date
        +updatedAt: Date
        +executions: Execution[]
        +isExecutable(): boolean
        +calculateRemainingQuantity(): number
    }
    
    class Execution {
        +id: string
        +orderId: string
        +quantity: number
        +price: number
        +fees: number
        +executionTime: Date
        +venue: string
        +tradeId: string
        +calculateValue(): number
    }
    
    class ExecutionResult {
        +success: boolean
        +orderId: string
        +executedQuantity: number
        +executedPrice: number
        +remainingQuantity: number
        +fees: FeeBreakdown
        +executionTime: Date
        +message: string
    }
    
    class FeeBreakdown {
        +commission: number
        +tax: number
        +regulatory: number
        +exchange: number
        +total: number
        +currency: string
    }
    
    class OrderType {
        <<enumeration>>
        MARKET
        LIMIT
        STOP
        STOP_LIMIT
        TRAILING_STOP
    }
    
    class OrderSide {
        <<enumeration>>
        BUY
        SELL
    }
    
    class OrderStatus {
        <<enumeration>>
        PENDING
        PARTIALLY_FILLED
        FILLED
        CANCELLED
        REJECTED
        EXPIRED
    }
    
    class TimeInForce {
        <<enumeration>>
        DAY
        GTC
        IOC
        FOK
    }
    
    %% Relacionamentos
    OrderController --> OrderService
    OrderService --> OrderProcessor
    OrderService --> Order
    OrderProcessor --> FeeCalculator
    OrderProcessor --> ExecutionResult
    Order --> Execution
    Order --> FeeBreakdown
    Order --> OrderType
    Order --> OrderSide
    Order --> OrderStatus
    Order --> TimeInForce
    FeeCalculator --> FeeBreakdown
```

**Responsabilidades das Classes:**
- **OrderController**: Endpoints de gestão de ordens
- **OrderService**: Lógica de negócio de ordens
- **OrderProcessor**: Engine de processamento e execução
- **FeeCalculator**: Cálculo de taxas e comissões
- **Order**: Entidade principal de ordem

## 3.4 Financial Service - Estrutura de Classes

```mermaid
classDiagram
    class PnLController {
        -pnlService: PnLService
        -logger: Logger
        +getPnLReport(req, res): Promise~void~
        +getRealizedPnL(req, res): Promise~void~
        +getUnrealizedPnL(req, res): Promise~void~
        +getTaxReport(req, res): Promise~void~
        +getPerformanceAttribution(req, res): Promise~void~
    }
    
    class PnLService {
        -pnlCalculator: PnLCalculator
        -taxCalculator: TaxCalculator
        -pnlRepository: PnLRepository
        +calculateRealizedPnL(portfolioId, period): Promise~PnLResult~
        +calculateUnrealizedPnL(portfolioId): Promise~PnLResult~
        +generateTaxReport(userId, taxYear): Promise~TaxReport~
        +getPerformanceAttribution(portfolioId): Promise~AttributionResult~
        +updatePnLForTransaction(transaction): Promise~void~
    }
    
    class PnLCalculator {
        -costBasisMethod: CostBasisMethod
        +calculateRealizedPnL(transactions): PnLResult
        +calculateUnrealizedPnL(positions): PnLResult
        +calculateCostBasis(transactions, method): CostBasisResult
        +applyFIFO(transactions): CostBasisResult
        +applyLIFO(transactions): CostBasisResult
        +applySpecificIdentification(transactions): CostBasisResult
        +calculateWashSaleAdjustment(transactions): WashSaleResult
    }
    
    class TaxCalculator {
        -taxRules: TaxRules
        +calculateCapitalGainsTax(pnlResult): TaxResult
        +calculateDividendTax(dividends): TaxResult
        +applyTaxLossHarvesting(pnlResult): TaxOptimizationResult
        +generateTaxLotReport(transactions): TaxLotReport
        +calculateWithholding(income, country): WithholdingResult
    }
    
    class PnLResult {
        +totalPnL: number
        +realizedPnL: number
        +unrealizedPnL: number
        +shortTermGains: number
        +longTermGains: number
        +dividendIncome: number
        +interestIncome: number
        +fees: number
        +currency: string
        +period: DateRange
        +positions: PositionPnL[]
        +getTotalReturn(): number
        +getReturnPercentage(): number
    }
    
    class PositionPnL {
        +assetId: string
        +symbol: string
        +quantity: number
        +costBasis: number
        +marketValue: number
        +unrealizedPnL: number
        +realizedPnL: number
        +dividends: number
        +fees: number
        +holdingPeriod: number
        +getReturnPercentage(): number
    }
    
    class CostBasisResult {
        +method: CostBasisMethod
        +totalCostBasis: number
        +averageCostBasis: number
        +lots: TaxLot[]
        +adjustments: CostBasisAdjustment[]
    }
    
    class TaxLot {
        +id: string
        +assetId: string
        +quantity: number
        +costBasis: number
        +acquisitionDate: Date
        +disposalDate: Date
        +holdingPeriod: number
        +isLongTerm(): boolean
        +calculateGain(): number
    }
    
    class TaxResult {
        +shortTermTax: number
        +longTermTax: number
        +dividendTax: number
        +withholdingTax: number
        +totalTax: number
        +effectiveRate: number
        +taxableIncome: number
        +exemptions: number
    }
    
    class CostBasisMethod {
        <<enumeration>>
        FIFO
        LIFO
        SPECIFIC_IDENTIFICATION
        AVERAGE_COST
    }
    
    class AttributionResult {
        +assetSelection: number
        +sectorAllocation: number
        +timing: number
        +currency: number
        +interaction: number
        +total: number
        +benchmark: string
        +period: DateRange
    }
    
    %% Relacionamentos
    PnLController --> PnLService
    PnLService --> PnLCalculator
    PnLService --> TaxCalculator
    PnLCalculator --> PnLResult
    PnLCalculator --> CostBasisResult
    PnLResult --> PositionPnL
    CostBasisResult --> TaxLot
    TaxCalculator --> TaxResult
    PnLCalculator --> CostBasisMethod
    PnLService --> AttributionResult
```

**Responsabilidades das Classes:**
- **PnLController**: Endpoints de P&L e relatórios
- **PnLService**: Lógica de negócio de P&L
- **PnLCalculator**: Algoritmos de cálculo de P&L
- **TaxCalculator**: Cálculos fiscais e otimização
- **PnLResult**: Resultado consolidado de P&L

### Interfaces Principais

#### **IRepository<T>**
```typescript
interface IRepository<T> {
    findById(id: string): Promise<T | null>;
    findAll(): Promise<T[]>;
    create(entity: T): Promise<T>;
    update(id: string, entity: Partial<T>): Promise<T>;
    delete(id: string): Promise<boolean>;
}
```

#### **ICalculator**
```typescript
interface ICalculator {
    calculate(input: any): Promise<any>;
    validate(input: any): ValidationResult;
    getConfiguration(): CalculatorConfig;
}
```

#### **INotificationService**
```typescript
interface INotificationService {
    sendEmail(to: string, subject: string, body: string): Promise<boolean>;
    sendSMS(to: string, message: string): Promise<boolean>;
    sendPushNotification(userId: string, message: string): Promise<boolean>;
}
```

### Benefícios da Implementação

#### **Testabilidade**
- Cada classe tem responsabilidade única
- Interfaces facilitam mocking
- Dependency injection permite isolamento

#### **Extensibilidade**
- Novos algoritmos podem ser adicionados facilmente
- Strategy pattern permite mudanças de comportamento
- Factory pattern facilita criação de objetos

#### **Manutenibilidade**
- Código organizado e bem estruturado
- Separação clara de responsabilidades
- Documentação através de interfaces

#### **Performance**
- Otimizações específicas por componente
- Cache implementado onde necessário
- Lazy loading para dados pesados

#### **Compliance**
- Facilita auditoria e regulamentação
- Logs detalhados de todas as operações
- Rastreabilidade completa de transações