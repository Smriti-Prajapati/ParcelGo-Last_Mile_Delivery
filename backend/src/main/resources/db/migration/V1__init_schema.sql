CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('CUSTOMER', 'AGENT', 'ADMIN')),
    phone VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE zones (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE zone_areas (
    id BIGSERIAL PRIMARY KEY,
    zone_id BIGINT NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
    pincode VARCHAR(20) NOT NULL,
    area_name VARCHAR(100) NOT NULL,
    UNIQUE (pincode)
);

CREATE TABLE delivery_agents (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id),
    zone_id BIGINT REFERENCES zones(id),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    availability VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' CHECK (availability IN ('AVAILABLE', 'BUSY', 'OFFLINE')),
    vehicle_number VARCHAR(30),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE rate_cards (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    order_type VARCHAR(5) NOT NULL CHECK (order_type IN ('B2B', 'B2C')),
    zone_type VARCHAR(10) NOT NULL CHECK (zone_type IN ('INTRA', 'INTER')),
    min_weight DECIMAL(8, 2) NOT NULL,
    max_weight DECIMAL(8, 2) NOT NULL,
    rate_per_kg DECIMAL(10, 2) NOT NULL,
    base_charge DECIMAL(10, 2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE cod_surcharges (
    id BIGSERIAL PRIMARY KEY,
    order_type VARCHAR(5) NOT NULL UNIQUE CHECK (order_type IN ('B2B', 'B2C')),
    surcharge_amount DECIMAL(10, 2) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    tracking_id VARCHAR(20) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL REFERENCES users(id),
    agent_id BIGINT REFERENCES delivery_agents(id),
    pickup_address TEXT NOT NULL,
    pickup_pincode VARCHAR(20) NOT NULL,
    drop_address TEXT NOT NULL,
    drop_pincode VARCHAR(20) NOT NULL,
    pickup_zone_id BIGINT REFERENCES zones(id),
    drop_zone_id BIGINT REFERENCES zones(id),
    length DECIMAL(8, 2) NOT NULL,
    breadth DECIMAL(8, 2) NOT NULL,
    height DECIMAL(8, 2) NOT NULL,
    actual_weight DECIMAL(8, 2) NOT NULL,
    volumetric_weight DECIMAL(8, 2) NOT NULL,
    billable_weight DECIMAL(8, 2) NOT NULL,
    order_type VARCHAR(5) NOT NULL CHECK (order_type IN ('B2B', 'B2C')),
    payment_type VARCHAR(10) NOT NULL CHECK (payment_type IN ('PREPAID', 'COD')),
    base_charge DECIMAL(10, 2) NOT NULL,
    cod_surcharge DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_charge DECIMAL(10, 2) NOT NULL,
    status VARCHAR(25) NOT NULL DEFAULT 'CONFIRMED',
    scheduled_date DATE,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE order_tracking (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id),
    status VARCHAR(25) NOT NULL,
    actor_id BIGINT REFERENCES users(id),
    actor_name VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE reschedules (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id),
    original_date DATE,
    new_date DATE NOT NULL,
    reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_agent ON orders(agent_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_tracking_id ON orders(tracking_id);
CREATE INDEX idx_order_tracking_order ON order_tracking(order_id);
CREATE INDEX idx_zone_areas_pincode ON zone_areas(pincode);
CREATE INDEX idx_delivery_agents_availability ON delivery_agents(availability);
