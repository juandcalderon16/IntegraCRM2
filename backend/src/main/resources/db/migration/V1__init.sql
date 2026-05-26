CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(64) NOT NULL UNIQUE
);

CREATE TABLE permissions (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(128) NOT NULL UNIQUE,
    description VARCHAR(255)
);

CREATE TABLE role_permissions (
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    full_name VARCHAR(255) NOT NULL,
    supabase_user_id VARCHAR(128) UNIQUE,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(64),
    company VARCHAR(255),
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    owner_user_id BIGINT REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_owner ON customers(owner_user_id);
CREATE INDEX idx_customers_status ON customers(status);

CREATE TABLE prospects (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL,
    stage VARCHAR(32) NOT NULL DEFAULT 'LEAD',
    amount DECIMAL(14, 2),
    currency VARCHAR(8) NOT NULL DEFAULT 'USD',
    owner_user_id BIGINT REFERENCES users(id),
    expected_close_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prospects_owner ON prospects(owner_user_id);
CREATE INDEX idx_prospects_stage ON prospects(stage);

CREATE TABLE campaigns (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    channel VARCHAR(64),
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    budget DECIMAL(14, 2),
    start_date DATE,
    end_date DATE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE campaign_metrics (
    id BIGSERIAL PRIMARY KEY,
    campaign_id BIGINT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    impressions BIGINT NOT NULL DEFAULT 0,
    clicks BIGINT NOT NULL DEFAULT 0,
    conversions BIGINT NOT NULL DEFAULT 0,
    leads_generated BIGINT NOT NULL DEFAULT 0,
    revenue_attributed DECIMAL(14, 2) DEFAULT 0,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_campaign_metrics_campaign ON campaign_metrics(campaign_id);

CREATE TABLE interactions (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id),
    type VARCHAR(32) NOT NULL,
    summary TEXT NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_interactions_customer ON interactions(customer_id);
CREATE INDEX idx_interactions_occurred ON interactions(occurred_at);

-- Seed roles
INSERT INTO roles (name) VALUES
('ADMIN'), ('VENDEDOR'), ('ANALISTA'), ('ASESOR_SERVICIO'), ('GERENTE');

-- Seed permissions
INSERT INTO permissions (code, description) VALUES
('customers.read', 'Ver clientes'),
('customers.write', 'Crear/editar clientes'),
('prospects.read', 'Ver prospectos y pipeline'),
('prospects.write', 'Gestionar prospectos'),
('campaigns.read', 'Ver campañas'),
('campaigns.write', 'Gestionar campañas y métricas'),
('interactions.read', 'Ver historial de interacciones'),
('interactions.write', 'Registrar interacciones'),
('reports.export', 'Exportar reportes'),
('users.manage', 'Administrar usuarios y roles'),
('dashboard.view', 'Ver dashboard');

-- ADMIN: all
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p WHERE r.name = 'ADMIN';

-- VENDEDOR
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.code IN (
  'customers.read', 'customers.write', 'prospects.read', 'prospects.write',
  'interactions.read', 'interactions.write', 'dashboard.view'
) WHERE r.name = 'VENDEDOR';

-- ANALISTA
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.code IN (
  'campaigns.read', 'campaigns.write', 'customers.read', 'prospects.read', 'dashboard.view'
) WHERE r.name = 'ANALISTA';

-- ASESOR_SERVICIO
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.code IN (
  'customers.read', 'interactions.read', 'interactions.write', 'dashboard.view'
) WHERE r.name = 'ASESOR_SERVICIO';

-- GERENTE
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.code IN (
  'customers.read', 'prospects.read', 'campaigns.read', 'interactions.read',
  'reports.export', 'dashboard.view'
) WHERE r.name = 'GERENTE';

-- Demo users (contraseña por defecto: password — hash BCrypt estándar Spring)
INSERT INTO users (email, password_hash, full_name, enabled) VALUES
('admin@crm.local', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Administrador Demo', true),
('vendedor@crm.local', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'María Vendedora', true),
('analista@crm.local', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Carlos Analista', true),
('asesor@crm.local', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Laura Asesora', true),
('gerente@crm.local', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Roberto Gerente', true);

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u JOIN roles r ON r.name = 'ADMIN' WHERE u.email = 'admin@crm.local';

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u JOIN roles r ON r.name = 'VENDEDOR' WHERE u.email = 'vendedor@crm.local';

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u JOIN roles r ON r.name = 'ANALISTA' WHERE u.email = 'analista@crm.local';

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u JOIN roles r ON r.name = 'ASESOR_SERVICIO' WHERE u.email = 'asesor@crm.local';

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u JOIN roles r ON r.name = 'GERENTE' WHERE u.email = 'gerente@crm.local';

-- Demo data
INSERT INTO customers (name, email, phone, company, status, owner_user_id, notes)
SELECT 'Acme Corp', 'contacto@acme.test', '+1-555-0100', 'Acme', 'ACTIVE', u.id, 'Cliente estratégico'
FROM users u WHERE u.email = 'vendedor@crm.local';

INSERT INTO prospects (title, customer_id, stage, amount, owner_user_id)
SELECT 'Renovación Acme', c.id, 'PROPOSAL', 45000, c.owner_user_id
FROM customers c WHERE c.name = 'Acme Corp';

INSERT INTO campaigns (name, channel, status, budget, start_date, end_date, description)
VALUES ('Q1 Email', 'EMAIL', 'ACTIVE', 5000, CURRENT_DATE - 30, CURRENT_DATE + 60, 'Campaña demo');

INSERT INTO campaign_metrics (campaign_id, impressions, clicks, conversions, leads_generated, revenue_attributed)
SELECT id, 120000, 3400, 180, 42, 98000 FROM campaigns WHERE name = 'Q1 Email';

INSERT INTO interactions (customer_id, user_id, type, summary, occurred_at)
SELECT c.id, u.id, 'CALL', 'Llamada de seguimiento post-demo.', NOW() - INTERVAL '2 days'
FROM customers c, users u WHERE c.name = 'Acme Corp' AND u.email = 'asesor@crm.local';
