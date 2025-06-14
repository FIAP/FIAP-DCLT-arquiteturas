-- Script de inicialização para popular dados de demonstração
-- Este script será executado automaticamente quando o container do PostgreSQL iniciar

-- Inserir ativos de demonstração (apenas se as tabelas existirem)
DO $$
BEGIN
    -- Verificar se a tabela assets existe antes de inserir dados
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assets') THEN
        
        -- Limpar dados existentes (opcional, apenas para desenvolvimento)
        -- DELETE FROM assets WHERE id IN (1,2,3,4,5,6,7,8,9,10);
        
        -- Inserir ações brasileiras
        INSERT INTO assets (id, symbol, name, type, sector, current_price, previous_price, market_cap, dividend_yield, risk_rating, description, is_active, created_at, updated_at) VALUES
        (1, 'PETR4', 'Petróleo Brasileiro S.A. - Petrobras', 'acao', 'Petróleo e Gás', 32.45, 31.20, 422500000000, 12.5, 'alto', 'Maior empresa de petróleo do Brasil', true, NOW(), NOW()),
        (2, 'VALE3', 'Vale S.A.', 'acao', 'Mineração', 65.80, 67.10, 312000000000, 8.7, 'medio', 'Maior empresa de mineração do Brasil', true, NOW(), NOW()),
        (3, 'ITUB4', 'Itaú Unibanco Holding S.A.', 'acao', 'Bancário', 25.75, 25.30, 245000000000, 6.2, 'baixo', 'Maior banco privado do Brasil', true, NOW(), NOW()),
        (4, 'BBDC4', 'Banco Bradesco S.A.', 'acao', 'Bancário', 14.85, 15.20, 145000000000, 7.1, 'baixo', 'Segundo maior banco privado do Brasil', true, NOW(), NOW()),
        (5, 'MGLU3', 'Magazine Luiza S.A.', 'acao', 'Varejo', 8.45, 9.10, 56000000000, 0.0, 'alto', 'Maior varejista online do Brasil', true, NOW(), NOW()),
        
        -- Inserir FIIs (Fundos Imobiliários)
        (6, 'XPML11', 'XP Malls FII', 'fii', 'Shoppings', 96.50, 95.80, 2800000000, 0.85, 'medio', 'Fundo de investimento em shopping centers', true, NOW(), NOW()),
        (7, 'HGLG11', 'CSHG Logística FII', 'fii', 'Logística', 158.70, 160.20, 5200000000, 0.78, 'baixo', 'Fundo de investimento em galpões logísticos', true, NOW(), NOW()),
        
        -- Inserir Criptomoedas
        (8, 'BTC', 'Bitcoin', 'cripto', 'Criptomoeda', 245000.00, 250000.00, 4800000000000, 0.0, 'alto', 'A primeira e maior criptomoeda do mundo', true, NOW(), NOW()),
        (9, 'ETH', 'Ethereum', 'cripto', 'Criptomoeda', 16500.00, 17200.00, 1980000000000, 0.0, 'alto', 'Plataforma de contratos inteligentes', true, NOW(), NOW()),
        
        -- Inserir Renda Fixa
        (10, 'TESOURO-SELIC', 'Tesouro Selic 2029', 'renda_fixa', 'Governo', 100.85, 100.82, 0, 13.65, 'baixo', 'Título público indexado à taxa Selic', true, NOW(), NOW())
        
        ON CONFLICT (id) DO UPDATE SET
            current_price = EXCLUDED.current_price,
            previous_price = EXCLUDED.previous_price,
            updated_at = NOW();
            
        -- Resetar sequence se necessário
        SELECT setval('assets_id_seq', (SELECT MAX(id) FROM assets));
        
    END IF;
END $$; 