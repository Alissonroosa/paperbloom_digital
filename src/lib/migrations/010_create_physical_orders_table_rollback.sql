-- Rollback 010
DROP TABLE IF EXISTS physical_orders CASCADE;
DROP SEQUENCE IF EXISTS physical_orders_number_seq;
DROP TYPE IF EXISTS delivery_type_enum;
DROP TYPE IF EXISTS payment_status_enum;
DROP TYPE IF EXISTS order_status_enum;
